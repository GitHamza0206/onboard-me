# src/features/creator_agent/service/nodes/save_to_supabase.py
from src.supabase_client import supabase
from langchain_core.messages import AIMessage
from src.features.creator_agent.service.state import State

def save(state: State) -> State:
    lesson_id = state.submodules[state.current_index]["lesson_id"]
    html = state.outputs[lesson_id]

    # numéric id -> "lesson_27" ➜ 27
    numeric_id = int(lesson_id.split('_')[1])

    supabase.table("submodules").update({"content": html}).eq("id", numeric_id).execute()
    
    if state.current_index + 1 == len(state.submodules):
        # On suppose que chaque submodule a un "module_id" de forme "module_3"
        module_id = state.submodules[state.current_index]["module_id"]
        numeric_module_id = int(module_id.split("_")[1])

        # On va chercher l’id de la formation liée à ce module
        res = supabase.table("formation_modules").select("formation_id").eq("module_id", numeric_module_id).single().execute()
        formation_id = res.data["formation_id"]

        supabase.table("formations").update({"has_content": True}).eq("id", formation_id).execute()

    return {"messages": [AIMessage(content=f"💾 Lesson {lesson_id} sauvegardée en DB")]}
