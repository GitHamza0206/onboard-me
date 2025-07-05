from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from services.creator_agent.state import State
# ===========================================
# Import nodes
from services.creator_agent.nodes.generate import generate
# ===========================================

workflow = StateGraph(State)
# Initialize MemorySaver with the configuration directly
memory = MemorySaver()

# ===========================================
# Define the nodes
# ===========================================
workflow.add_node("generate", generate)

# ===========================================
#EDGE functions 

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
