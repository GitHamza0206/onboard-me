from langgraph.graph import END, START, StateGraph
from .nodes.generate import generate
from .nodes.ingest_knowledge import ingest_knowledge
from .state import State
from langgraph.checkpoint.memory import MemorySaver
from .nodes.tools import tool_node
from langchain_core.messages import BaseMessage
from .nodes.create_structure import create_structure

workflow = StateGraph(State)
memory = MemorySaver()

# ===========================================
# Define the nodes
# ===========================================
workflow.add_node("ingest_knowledge", ingest_knowledge)
workflow.add_node("generate", generate)
workflow.add_node("create_structure", create_structure)
workflow.add_node("tools", tool_node)

# ===========================================
# Define the edges
# ===========================================
workflow.add_edge(START, "ingest_knowledge")
workflow.add_edge("ingest_knowledge", "generate")
workflow.add_edge("generate", END)

# def should_create_structure(state: State) -> str:
#     """Return 'create_structure' if the agent should create a structure, otherwise return END."""
#     return "create_structure" if state.get("confidence_score") >= 4 else END

# workflow.add_conditional_edges("generate", 
#                                should_create_structure,
#                                )
# workflow.add_edge("create_structure", END)

def should_continue(state: State) -> str:
    """Return 'tools' if the agent should call tools, otherwise return END."""
    messages = state.get("messages", [])
    if not messages:
        return END
    last_message = messages[-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END


# Compile
graph = workflow.compile(checkpointer=memory)

if __name__ == "__main__":
    thread = {"configurable": {"thread_id": "1"}}
    for event in graph.stream({"messages": [("user", "what is the weather in sf?")]}, thread):
        for v in event.values():
            print(v)
