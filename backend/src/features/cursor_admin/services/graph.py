from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode
from langchain_core.messages import ToolMessage
from .state import State
from .nodes.tools import get_course_structure
from shared.llm import llm

# ===========================================
# Define the tools
# ===========================================
tools = [get_course_structure]
tool_node = ToolNode(tools)

# ===========================================
# Define the agent
# ===========================================
model = llm 
model = model.bind_tools(tools)

def should_continue(state: State) -> str:
    """
    Determines the next step for the agent.
    """
    if isinstance(state['messages'][-1], ToolMessage):
        return "end" # The tool has been called, for now we end here.
    if state['messages'][-1].tool_calls:
        return "continue"
    return "end"

def call_model(state: State) -> dict:
    """
    The main agent node. It calls the model with the current state and returns the result.
    """
    messages = state['messages']
    response = model.invoke(messages)
    return {"messages": [response]}


# ===========================================
# Define the graph
# ===========================================
workflow = StateGraph(State)

workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)


# ===========================================
# Define the edges
# ===========================================
workflow.set_entry_point("agent")

workflow.add_conditional_edges(
    "agent",
    should_continue,
    {"continue": "tools", "end": END}
)
workflow.add_edge("tools", "agent")


# ===========================================
# Compile the graph
# ===========================================
memory = MemorySaver()
graph = workflow.compile(checkpointer=memory)


if __name__ == "__main__":
    prompt = """
You are a course editing assistant. 
A user wants to modify the course with ID '84'. 
First, call the `get_course_structure` tool to understand the course. 
Here is the user's request: 
'change the title of the first lesson to 'TOTOTOTO''
    """
    thread = {"configurable": {"thread_id": "1"}}
    for event in graph.stream({"messages": [("user", prompt)]}, thread):
        for v in event.values():
            print(v)
