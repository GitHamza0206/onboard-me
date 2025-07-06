# src/features/creator_agent/service/graph.py
from langgraph.graph import StateGraph, END, START
from src.features.creator_agent.service.state import State
from src.features.creator_agent.service.nodes.prepare_submodules import prepare
from src.features.creator_agent.service.nodes.generate_lesson import generate_lesson
from src.features.creator_agent.service.nodes.save_to_supabase import save      # si tu veux persister

workflow = StateGraph(State)

# ↓↓↓  Nœuds
workflow.add_node("prepare", prepare)
workflow.add_node("generate_lesson", generate_lesson)
workflow.add_node("save", save)

# ↓↓↓  Logique de boucle
def has_more(state: State) -> str:
    if state.current_index < len(state.submodules):
        return "loop"
    return END

def increment_index(state: State) -> State:
    return {"current_index": state.current_index + 1}

workflow.add_edge(START, "prepare")
workflow.add_edge("prepare", "generate_lesson")
workflow.add_edge("generate_lesson", "save")
workflow.add_edge("save", "loop")               # passerelle technique

workflow.add_conditional_edges(
    "loop",
    has_more,
    {
        "loop": "generate_lesson",              # continue
        END: END                                # terminé
    }
)
workflow.add_node("loop", increment_index)      # nœud d’incrémentation

graph = workflow.compile()
