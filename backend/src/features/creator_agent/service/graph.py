from langgraph.graph import END, START, StateGraph
from .nodes.create_structure import create_structure
from .nodes.generate import generate
from .state import State
from langgraph.checkpoint.memory import MemorySaver

# ===========================================
# Import nodes
# ===========================================
from langchain_core.messages import BaseMessage
# ===========================================

workflow = StateGraph(State)
# Initialize MemorySaver with the configuration directly
memory = MemorySaver()

# ===========================================
# Define the nodes
# ===========================================
workflow.add_node("generate", generate)

# ===========================================

# ===========================================
# define the edges
workflow.add_edge(START, "generate")
workflow.add_edge("generate", END)


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
