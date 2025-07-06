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
    lesson_title = lesson_info.get("lesson_title")
    html_content = outputs.get(lesson_id)

    if not all([lesson_id, html_content]):
        return {"messages": [AIMessage(content=f"💾 Erreur : Données manquantes pour la leçon {lesson_id}. Sauvegarde ignorée.")]}

    try:
        numeric_id = int(lesson_id.split('_')[1])
        
        # Start save message
        start_save_msg = AIMessage(
            content=f"💾 Sauvegarde en cours: {lesson_title} ({current_index + 1}/{len(submodules)})"
        )
        
        supabase.table("submodules").update({"content": html_content}).eq("id", numeric_id).execute()
        
        # Success save message
        save_success_msg = AIMessage(
            content=f"✅💾 Leçon sauvegardée: {lesson_title} | Base de données mise à jour"
        )
        
        messages = [start_save_msg, save_success_msg]
        
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
                    
                    final_message = AIMessage(
                        content=f"🎉 Formation terminée! Toutes les {len(submodules)} leçons ont été générées et sauvegardées. Formation ID {formation_id} mise à jour avec has_content = true."
                    )
                    
                    messages.append(final_message)
                    
                    # CORRECTION : Mettre fin explicitement au graphe ici
                    return {
                        "messages": messages,
                        "formation_completed": {
                            "formation_id": formation_id,
                            "total_lessons": len(submodules),
                            "status": "completed"
                        },
                        END: True  # Signal de fin pour langgraph
                    }
                else:
                    print(f"--- Impossible de trouver formation_id pour module_id {numeric_module_id}. ---")

    except Exception as e:
        error_message = f"💾 Erreur lors de la sauvegarde pour la leçon {lesson_id}: {str(e)}"
        print(f"--- [ERREUR] {error_message} ---")
        return {"messages": [AIMessage(content=error_message)]}

    return {
        "messages": messages,
        "lesson_saved": {
            "lesson_id": lesson_id,
            "lesson_title": lesson_title,
            "progress": f"{current_index + 1}/{len(submodules)}"
        }
    }