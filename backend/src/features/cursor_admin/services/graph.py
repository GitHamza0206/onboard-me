from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from .state import State

# ===========================================
# Define the nodes (as placeholders for now)
# ===========================================

def get_course_structure_node(state: State):
    """
    Placeholder node to fetch the course structure.
    In Task 2, this will be replaced by a proper tool call.
    """
    print("--- Fetching Course Structure ---")
    formation_id = state.get("formation_id")
    print(f"Formation ID: {formation_id}")
    # In reality, we'd call the service here and update the state
    return {"current_structure": {"title": "Placeholder Course", "modules": []}}

def generate_new_structure_node(state: State):
    """
    Placeholder for the agent generating the new structure.
    """
    print("--- Agent is generating new structure ---")
    # Agent logic will go here
    return {"proposed_structure": {"title": "New Placeholder Course", "modules": []}}

def calculate_diff_node(state: State):
    """
    Placeholder for calculating the diff between old and new structures.
    """
    print("--- Calculating Diff ---")
    # Difftastic logic will go here
    return {"diff": "--- Diff --- \n...changes..."}


# ===========================================
# Define the graph
# ===========================================
workflow = StateGraph(State)

workflow.add_node("get_course_structure", get_course_structure_node)
workflow.add_node("generate_new_structure", generate_new_structure_node)
workflow.add_node("calculate_diff", calculate_diff_node)


# ===========================================
# Define the edges
# ===========================================
workflow.add_edge(START, "get_course_structure")
workflow.add_edge("get_course_structure", "generate_new_structure")
workflow.add_edge("generate_new_structure", "calculate_diff")

# The graph will interrupt after calculating the diff to wait for human approval.
# We will configure this interruption later.
workflow.add_edge("calculate_diff", END)


# ===========================================
# Compile the graph
# ===========================================
memory = MemorySaver()
graph = workflow.compile(
    checkpointer=memory,
    # We will add the interrupt here in a later task
    # interrupt_after=["calculate_diff"], 
)

#graph.get_graph().print_ascii()

if __name__ == "__main__":
    thread = {"configurable": {"thread_id": "1"}}
    for event in graph.stream({"messages": [("user", "change the first course title to 'New Title'")]}, thread):
        for v in event.values():
            print(v)
