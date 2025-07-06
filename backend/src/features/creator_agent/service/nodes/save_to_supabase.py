# backend/src/features/creator_agent/service/nodes/save_to_supabase.py
from langgraph.graph import END
from src.supabase_client import supabase
from langchain_core.messages import AIMessage
from src.features.creator_agent.service.state import State

def save(state: State) -> State:
    submodules = state.get("submodules", [])
    current_index = state.get("current_index", 0)
    outputs = state.get("outputs", {})
    
    if current_index >= len(submodules):
        return {"messages": [AIMessage(content="💾 Erreur : Index invalide pour les sous-modules.")]}

    lesson_info = submodules[current_index]
    lesson_id = lesson_info.get("lesson_id")
    html_content = outputs.get(lesson_id)

    if not all([lesson_id, html_content]):
        return {"messages": [AIMessage(content=f"💾 Erreur : Données manquantes pour la leçon {lesson_id}. Sauvegarde ignorée.")]}

    try:
        numeric_id = int(lesson_id.split('_')[1])
        supabase.table("submodules").update({"content": html_content}).eq("id", numeric_id).execute()
        
        # Logique critique pour la fin du processus
        if current_index + 1 == len(submodules):
            print(f"--- Toutes les {len(submodules)} leçons ont été générées. Mise à jour du statut de la formation. ---")
            
            module_id = lesson_info.get("module_id")
            if module_id:
                numeric_module_id = int(module_id.split('_')[1])
                
                fm_response = supabase.table("formation_modules").select("formation_id").eq("module_id", numeric_module_id).single().execute()
                
                if fm_response.data and fm_response.data.get("formation_id"):
                    formation_id = fm_response.data["formation_id"]
                    print(f"--- Mise à jour de la formation ID {formation_id} à has_content = true ---")
                    
                    supabase.table("formations").update({"has_content": True}).eq("id", formation_id).execute()
                    
                    final_message = f"✅💾 Contenu de la formation terminé. Statut mis à jour pour la formation {formation_id}."
                    
                    # CORRECTION : Mettre fin explicitement au graphe ici
                    return {
                        "messages": [AIMessage(content=final_message)],
                        END: True  # Signal de fin pour langgraph
                    }
                else:
                    print(f"--- Impossible de trouver formation_id pour module_id {numeric_module_id}. ---")

    except Exception as e:
        error_message = f"💾 Erreur lors de la sauvegarde pour la leçon {lesson_id}: {str(e)}"
        print(f"--- [ERREUR] {error_message} ---")
        return {"messages": [AIMessage(content=error_message)]}

    return {"messages": [AIMessage(content=f"💾 Leçon {lesson_id} sauvegardée avec succès.")]}