# src/features/creator_agent/service/graph.py
from langgraph.graph import StateGraph, END, START
from src.features.creator_agent.service.state import State
from src.features.creator_agent.service.nodes.prepare_submodules import prepare
from src.features.creator_agent.service.nodes.generate_lesson import generate_lesson
from src.features.creator_agent.service.nodes.save_to_supabase import save
from src.features.creator_agent.service.nodes.generate_quiz import generate_quiz
from src.features.creator_agent.service.nodes.save_quiz_to_supabase import save_quiz_to_supabase

workflow = StateGraph(State)

# ↓↓↓  Nœuds
workflow.add_node("prepare", prepare)
workflow.add_node("generate_lesson", generate_lesson)
workflow.add_node("save", save)
workflow.add_node("generate_quiz", generate_quiz)
workflow.add_node("save_quiz", save_quiz_to_supabase)

# ↓↓↓  Logique de boucle
def has_more(state: State) -> str:
    if state["current_index"]< len(state["submodules"]):
        return "loop"
    return END

def increment_index(state: State) -> State:
    return {"current_index": state["current_index"] + 1}

def should_generate_quiz(state: State) -> str:
    """Détermine si on doit générer un quiz après cette leçon"""
    # FIX: Use dictionary key access instead of attribute access
    current_index = state["current_index"]
    
    # Si c'est la dernière leçon de toute la formation
    if current_index >= len(state["submodules"]) - 1:
        return "generate_quiz"
    
    # Vérifier si la prochaine leçon est dans un module différent
    current_module = state["submodules"][current_index]["module_id"]
    next_module = state["submodules"][current_index + 1]["module_id"]
    
    if current_module != next_module:
        return "generate_quiz"
    
    return "loop"

workflow.add_edge(START, "prepare")
workflow.add_edge("prepare", "generate_lesson")
workflow.add_edge("generate_lesson", "save")
# Après sauvegarde, décider si on génère un quiz ou on continue
workflow.add_conditional_edges(
    "save",
    should_generate_quiz,
    {
        "generate_quiz": "generate_quiz",       # générer quiz de fin de module
        "loop": "loop"                          # continuer avec la prochaine leçon
    }
)

# Après génération du quiz, le sauvegarder puis continuer
workflow.add_edge("generate_quiz", "save_quiz")
workflow.add_edge("save_quiz", "loop")

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
