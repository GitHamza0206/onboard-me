from src.supabase_client import supabase
from src.features.formations.schema import FormationStructureCreate, ModuleStructure

def apply_course_changes(formation_id: int, proposed_structure: FormationStructureCreate):
    """
    Applies the proposed changes to the course structure in the database.
    This function is the final step, executed only after human approval.
    """
    try:
        # --- Main Formation Title ---
        supabase.table("formations").update({"nom": proposed_structure.title}).eq("id", formation_id).execute()

        # --- Modules Processing ---
        current_modules_db_resp = supabase.table("formation_modules").select("modules(id, titre, index)").eq("formation_id", formation_id).execute()
        current_modules_db = current_modules_db_resp.data or []
        current_module_ids_db = {fm['modules']['id'] for fm in current_modules_db if fm.get('modules')}
        
        proposed_module_ids = {int(mod.id.split('_')[-1]) for mod in proposed_structure.modules}

        # Update existing modules
        for i, module_data in enumerate(proposed_structure.modules):
            module_id = int(module_data.id.split('_')[-1])
            if module_id in current_module_ids_db:
                module_payload = {"titre": module_data.title, "index": i}
                supabase.table("modules").update(module_payload).eq("id", module_id).execute()

        # Delete old modules
        modules_to_delete = current_module_ids_db - proposed_module_ids
        if modules_to_delete:
            for module_id in modules_to_delete:
                supabase.table("formation_modules").delete().eq("module_id", module_id).execute()
                supabase.table("modules").delete().eq("id", module_id).execute()

        # --- Lessons Processing for each module ---
        for module_data in proposed_structure.modules:
            module_id = int(module_data.id.split('_')[-1])
            if module_id not in current_module_ids_db:
                 print(f"Warning: Skipping lessons for non-existent module {module_id}")
                 continue

            current_lessons_db_resp = supabase.table("submodules").select("id").eq("module_id", module_id).execute()
            current_lesson_ids_db = {l['id'] for l in (current_lessons_db_resp.data or [])}
            
            proposed_lesson_ids_in_module = {int(lesson.id.split('_')[-1]) for lesson in module_data.lessons if lesson.id.startswith("lesson_")}

            # Update existing and create new lessons
            for j, lesson_data in enumerate(module_data.lessons):
                lesson_payload = {
                    "titre": lesson_data.title,
                    "description": lesson_data.description,
                    "content": lesson_data.content,
                    "index": j,
                    "module_id": module_id
                }
                if lesson_data.id.startswith("lesson_"):
                    lesson_id = int(lesson_data.id.split('_')[-1])
                    if lesson_id in current_lesson_ids_db:
                        supabase.table("submodules").update(lesson_payload).eq("id", lesson_id).execute()
                else:
                    # Insert new lesson (ID is auto-generated)
                    supabase.table("submodules").insert(lesson_payload).execute()

            # Delete old lessons from this module
            lessons_to_delete = current_lesson_ids_db - proposed_lesson_ids_in_module
            if lessons_to_delete:
                for lesson_id in lessons_to_delete:
                    supabase.table("submodules").delete().eq("id", lesson_id).execute()

        return {"status": "success", "message": "Course updated successfully."}

    except Exception as e:
        return {"status": "error", "message": f"An error occurred: {str(e)}"} 