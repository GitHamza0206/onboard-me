# src/features/creator_agent/service/nodes/save_to_supabase.py
from src.supabase_client import supabase
from langchain_core.messages import AIMessage
from src.features.creator_agent.service.state import State

def save(state: State) -> State:
    submodules = state.get("submodules", [])
    current_index = state.get("current_index", 0)
    outputs = state.get("outputs", {})
    
    lesson_id = submodules[current_index].get("lesson_id")
    html = outputs.get(lesson_id)

    if not all([lesson_id, html]):
        return {"messages": [AIMessage(content=f"💾 Erreur: Données manquantes pour la sauvegarde.")]}

    numeric_id = int(lesson_id.split('_')[1])
    supabase.table("submodules").update({"content": html}).eq("id", numeric_id).execute()
    
    # Check if this is the last lesson
    if current_index + 1 == len(submodules):
        module_id = submodules[current_index].get("module_id")
        if module_id:
            try:
                numeric_module_id = int(module_id.split("_")[1])
                res = supabase.table("formation_modules").select("formation_id").eq("module_id", numeric_module_id).single().execute()
                if res.data:
                    formation_id = res.data["formation_id"]
                    supabase.table("formations").update({"has_content": True}).eq("id", formation_id).execute()
            except Exception as e:
                print(f"Error updating formation status: {e}")

    return {"messages": [AIMessage(content=f"💾 Leçon {lesson_id} sauvegardée.")]}