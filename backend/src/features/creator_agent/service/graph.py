from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from src.features.creator_agent.service.state import State
# ===========================================
# Import nodes
from src.features.creator_agent.service.nodes.generate import generate
from src.features.creator_agent.service.nodes.create_structure import create_structure
# ===========================================

workflow = StateGraph(State)
# Initialize MemorySaver with the configuration directly
memory = MemorySaver()

# ===========================================
# Define the nodes
# ===========================================
workflow.add_node("generate", generate)
workflow.add_node("create_structure", create_structure)

# ===========================================
#EDGE functions 

def should_generate_structure(state: State) -> str:
    """
    Determines whether to generate the course structure or end the current turn.
    """
    # ▼▼▼ CORRECTION ICI ▼▼▼
    last_message = state.messages[-1]
    if last_message.content == "PROCEED_TO_GENERATION":
        return "create_structure"
    else:
        return END


# ===========================================
# define the edges
workflow.add_edge(START, "generate")
workflow.add_conditional_edges(
    "generate",
    should_generate_structure,
    {
        "create_structure": "create_structure",
        END: END
    }
)
workflow.add_edge("create_structure", END)

# ===========================================

# def show_graph(workflow):
#     import io

#     import matplotlib.pyplot as plt
#     from PIL import Image

#     # Generate and display the graph as an image
#     image_bytes = workflow.get_graph().draw_mermaid_png()
#     image = Image.open(io.BytesIO(image_bytes))

#     plt.imshow(image)
#     plt.axis("off")
#     plt.show()


# Compile
graph = workflow.compile(checkpointer=memory)

if __name__ == "__main__":
    print(graph.invoke({"messages": "qui est tu?"}, config={"thread_id": "1"}))
    #show_graph(graph)
