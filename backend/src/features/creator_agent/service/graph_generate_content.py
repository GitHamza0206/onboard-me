# src/features/creator_agent/service/graph.py
from langgraph.graph import StateGraph, END, START
from src.features.creator_agent.service.state import State
from src.features.creator_agent.service.nodes.prepare_submodules import prepare
from src.features.creator_agent.service.nodes.generate_lesson import generate_lesson
from src.features.creator_agent.service.nodes.save_to_supabase import save
from src.features.creator_agent.service.nodes.generate_quiz import generate_quiz
from src.features.creator_agent.service.nodes.save_quiz_to_supabase import save_quiz_to_supabase

def finalize_formation(state: State) -> State:
    """Finalise la formation en mettant à jour has_content = true"""
    try:
        print("🎯 Finalisation de la formation...")
        
        # Obtenir formation_id depuis le premier module
        if state["submodules"]:
            first_module = state["submodules"][0]
            module_id = first_module["module_id"]
            numeric_module_id = int(module_id.split('_')[1])
            
            from src.supabase_client import supabase
            from langchain_core.messages import AIMessage
            
            # Trouver la formation_id
            fm_response = supabase.table("formation_modules").select("formation_id").eq("module_id", numeric_module_id).single().execute()
            
            if fm_response.data and fm_response.data.get("formation_id"):
                formation_id = fm_response.data["formation_id"]
                print(f"🏁 Mise à jour de la formation ID {formation_id} à has_content = true")
                
                # Mettre à jour has_content
                supabase.table("formations").update({"has_content": True}).eq("id", formation_id).execute()
                
                total_lessons = len(state["submodules"])
                final_message = AIMessage(
                    content=f"🎉 Formation complètement terminée! {total_lessons} leçons générées et sauvegardées. Formation ID {formation_id} finalisée."
                )
                
                print(f"--- [BACKGROUND TASK] Génération du contenu terminée avec succès. Formation {formation_id} finalisée. ---")
                
                return {
                    "messages": [final_message],
                    "formation_completed": {
                        "formation_id": formation_id,
                        "total_lessons": total_lessons,
                        "status": "completed"
                    }
                }
            else:
                print("❌ Impossible de trouver la formation_id pour finaliser")
                return {"messages": [AIMessage(content="❌ Erreur lors de la finalisation")]}
        else:
            print("❌ Aucun module trouvé pour finaliser")
            return {"messages": [AIMessage(content="❌ Aucun contenu à finaliser")]}
            
    except Exception as e:
        print(f"❌ Erreur lors de la finalisation: {str(e)}")
        from langchain_core.messages import AIMessage
        return {"messages": [AIMessage(content=f"❌ Erreur lors de la finalisation: {str(e)}")]}

workflow = StateGraph(State)

# ↓↓↓  Nœuds
workflow.add_node("prepare", prepare)
workflow.add_node("generate_lesson", generate_lesson)
workflow.add_node("save", save)
workflow.add_node("generate_quiz", generate_quiz)
workflow.add_node("save_quiz", save_quiz_to_supabase)
workflow.add_node("finalize", finalize_formation)

# ↓↓↓  Logique de boucle
def has_more(state: State) -> str:
    if state["current_index"] < len(state["submodules"]):
        return "loop"
    return "finalize"

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
        "finalize": "finalize"                  # finaliser
    }
)
workflow.add_node("loop", increment_index)      # nœud d’incrémentation

workflow.add_edge("finalize", END)              # fin après finalisation

graph = workflow.compile()
