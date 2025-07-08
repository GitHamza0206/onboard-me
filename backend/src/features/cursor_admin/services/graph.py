from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.messages import ToolMessage, AIMessage, HumanMessage
import json
import subprocess
import tempfile
import os

from .state import State
from .nodes.tools import get_course_structure
from src.shared.deep_merge import deep_merge
from shared.llm import llm

# ===========================================
# Define the tools
# ===========================================
tools = [get_course_structure]
tool_node = ToolNode(tools)

# ===========================================
# Define the agent model
# ===========================================
model = llm
model = model.bind_tools(tools)

# ===========================================
# Define the graph nodes
# ===========================================

def call_model(state: State) -> dict:
    """The main agent node. It calls the model with the current state and returns the result."""
    print("--- Calling Model ---")
    
    # We create a new list of messages to avoid modifying the state directly
    messages = list(state['messages'])
    
    # If the last message was a tool call result, we prompt the agent for the next step
    if isinstance(messages[-1], ToolMessage):
        user_request = state.get("user_prompt", "the user's request")
        prompt = (
            "You are an expert course editor. You have been given the full JSON structure of the course. "
            f"Now, based on the user's original request, please generate a *partial* JSON object representing ONLY the desired changes. "
            "Your response must be a JSON object that can be merged into the original structure. "
            "For example, to change a lesson title, you might respond with: "
            '`{"modules": [{"id": "module_123", "lessons": [{"id": "lesson_456", "title": "A New Title"}]}]}`. '
            "It is crucial that you include the `id` for any object (module or lesson) you intend to modify, so the system can identify it. "
            "Do not add any explanations, just the raw JSON object. "
            f"Here is the user's request: '{user_request}'"
        )
        messages.append(HumanMessage(content=prompt))

    response = model.invoke(messages)
    return {"messages": [response]}


def parse_proposed_structure(state: State) -> dict:
    """
    Parses the agent's proposed JSON structure from its last message and saves it to the state.
    """
    print("--- Parsing Proposed Structure ---")
    last_message = state['messages'][-1]
    
    if not isinstance(last_message, AIMessage) or not isinstance(last_message.content, str):
        return {"proposed_structure": None, "diff": "Error: Agent did not propose a new structure."}

    try:
        # Extract JSON from the agent's response string
        json_str = last_message.content.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:-4].strip()
            
        proposed_structure = json.loads(json_str)
        return {"proposed_structure": proposed_structure}
    except json.JSONDecodeError as e:
        error_msg = f"Error: Agent returned invalid JSON. {e}"
        return {"proposed_structure": None, "diff": error_msg}


def merge_changes_node(state: State) -> dict:
    """
    Merges the agent's partial changes into the current course structure.
    """
    print("--- Merging Changes ---")
    current_structure = state.get("current_structure")
    partial_changes = state.get("proposed_structure") # At this point, this is the partial JSON

    if not current_structure or not partial_changes:
        return {"diff": "Error: Cannot merge, missing current structure or partial changes."}

    # Perform the deep merge
    merged_structure = deep_merge(current_structure, partial_changes)
    
    # The final, merged structure is now the official "proposed_structure"
    return {"proposed_structure": merged_structure}


def calculate_diff_node(state: State) -> dict:
    """
    Calculates the diff between the current and proposed course structures using difftastic.
    """
    print("--- Calculating Diff ---")
    current_structure = state.get("current_structure")
    proposed_structure = state.get("proposed_structure")

    if not current_structure or not proposed_structure:
        return {"diff": "Error: Cannot calculate diff, missing current or proposed structure."}

    current_json = json.dumps(current_structure, indent=2)
    proposed_json = json.dumps(proposed_structure, indent=2)

    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f1, \
             tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as f2:
            f1.write(current_json)
            f1_name = f1.name
            f2.write(proposed_json)
            f2_name = f2.name

        # Execute difftastic on the temporary files
        process = subprocess.run(
            ['difft', f1_name, f2_name],
            capture_output=True,
            text=True,
            check=False 
        )
        
        diff_output = process.stdout if process.returncode == 0 or process.returncode == 1 else process.stderr
        
    except FileNotFoundError:
        diff_output = "Error: `difft` command not found. Please ensure Difftastic is installed and in your PATH."
    except Exception as e:
        diff_output = f"An unexpected error occurred during diff calculation: {e}"
    finally:
        # Clean up the temporary files
        if 'f1_name' in locals() and os.path.exists(f1_name):
            os.unlink(f1_name)
        if 'f2_name' in locals() and os.path.exists(f2_name):
            os.unlink(f2_name)
            
    return {"diff": diff_output}


def save_course_structure(state: State) -> dict:
    """
    Saves the fetched course structure from the tool message into the state.
    """
    print("--- Saving Course Structure ---")
    last_message = state['messages'][-1]
    if isinstance(last_message, ToolMessage):
        try:
            structure = json.loads(last_message.content)
            return {"current_structure": structure}
        except (json.JSONDecodeError, TypeError):
            return {"diff": "Error: Could not parse course structure from tool."}
    return {}


# ===========================================
# Define the conditional logic for edges
# ===========================================

def should_continue(state: State) -> str:
    """Determines the next step for the agent."""
    last_message = state['messages'][-1]
    
    if last_message.tool_calls:
        return "tools"
    
    if isinstance(last_message, ToolMessage):
        # After a tool call, we save the result and then go back to the agent
        return "save_and_rerun_agent"

    # If the agent has proposed a new structure, parse and diff it
    if isinstance(last_message, AIMessage) and state.get("current_structure"):
        return "parse_and_diff"

    return "end"


# ===========================================
# Define the graph
# ===========================================
workflow = StateGraph(State)

workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)
workflow.add_node("save_course_structure", save_course_structure)
workflow.add_node("parse_proposed_structure", parse_proposed_structure)
workflow.add_node("merge_changes", merge_changes_node)
workflow.add_node("calculate_diff", calculate_diff_node)


# ===========================================
# Define the edges
# ===========================================
workflow.set_entry_point("agent")

workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        "parse_and_diff": "parse_proposed_structure",
        "end": END,
        "save_and_rerun_agent": "save_course_structure"
    }
)
workflow.add_edge("tools", "save_course_structure")
workflow.add_edge("save_course_structure", "agent")
workflow.add_edge("parse_proposed_structure", "merge_changes")
workflow.add_edge("merge_changes", "calculate_diff")


# ===========================================
# Compile the graph with interrupt
# ===========================================
memory = MemorySaver()
graph = workflow.compile(
    checkpointer=memory,
    # Interrupt the graph after the diff is calculated, to wait for human approval
    interrupt_after=["calculate_diff"],
)

#graph.get_graph().print_ascii()


if __name__ == "__main__":
    prompt = """
You are a course editing assistant. 
A user wants to modify the course with ID '84'. 
First, call the `get_course_structure` tool to understand the course. 
Here is the user's request: 
'change the title 'Mastering Advanced Sales Techniques' of the first lesson to 'TOTOTOTO''
    """
    thread = {"configurable": {"thread_id": "1"}}
    for event in graph.stream({"messages": [("user", prompt)]}, thread):
        for v in event.values():
            print(v)
