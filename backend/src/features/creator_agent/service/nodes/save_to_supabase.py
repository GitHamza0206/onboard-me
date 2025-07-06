# backend/src/features/creator_agent/service/nodes/save_to_supabase.py
from src.supabase_client import supabase
from langchain_core.messages import AIMessage
from src.features.creator_agent.service.state import State

def save(state: State) -> State:
    submodules = state.get("submodules", [])
    current_index = state.get("current_index", 0)
    outputs = state.get("outputs", {})
    
    # Ensure we are within the bounds of the submodules list
    if current_index >= len(submodules):
        return {"messages": [AIMessage(content="💾 Error: Invalid index for submodules.")]}

    lesson_info = submodules[current_index]
    lesson_id = lesson_info.get("lesson_id")
    html_content = outputs.get(lesson_id)

    if not all([lesson_id, html_content]):
        return {"messages": [AIMessage(content=f"💾 Error: Missing data for lesson {lesson_id}. Skipping save.")]}

    try:
        # Convert lesson_id (e.g., "lesson_101") to its numeric part
        numeric_id = int(lesson_id.split('_')[1])
        supabase.table("submodules").update({"content": html_content}).eq("id", numeric_id).execute()
        
        # --- THIS IS THE CRITICAL FIX ---
        # Check if this is the last lesson of the course.
        if current_index + 1 == len(submodules):
            print(f"--- All {len(submodules)} lessons generated. Updating formation status. ---")
            
            # Get the module_id from the current (last) lesson
            module_id = lesson_info.get("module_id") # e.g., "module_1"
            if module_id:
                numeric_module_id = int(module_id.split('_')[1])
                
                # Find the formation_id from the formation_modules junction table
                fm_response = supabase.table("formation_modules").select("formation_id").eq("module_id", numeric_module_id).single().execute()
                
                if fm_response.data and fm_response.data.get("formation_id"):
                    formation_id = fm_response.data["formation_id"]
                    print(f"--- Updating formation ID {formation_id} to has_content = true ---")
                    
                    # Update the has_content flag in the formations table
                    supabase.table("formations").update({"has_content": True}).eq("id", formation_id).execute()
                    
                    final_message = f"✅💾 Formation content complete. Status updated for formation {formation_id}."
                    return {"messages": [AIMessage(content=final_message)]}
                else:
                    print(f"--- Could not find formation_id for module_id {numeric_module_id}. ---")

    except Exception as e:
        # Log the error for debugging
        error_message = f"💾 Error during save for lesson {lesson_id}: {str(e)}"
        print(f"--- [ERROR] {error_message} ---")
        return {"messages": [AIMessage(content=error_message)]}

    # Default message for successful save of a single lesson
    return {"messages": [AIMessage(content=f"💾 Lesson {lesson_id} saved successfully.")]}