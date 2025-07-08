from src.supabase_client import supabase
from src.features.formations.schema import FormationStructureCreate, LessonStructure

def apply_course_changes(formation_id: int, proposed_structure: FormationStructureCreate):
    """
    Applies the proposed changes to the course structure in the database.
    This function is the final step, executed only after human approval.
    """
    try:
        # We will collect new lessons to be inserted after the main transaction
        lessons_to_add_separately: list[tuple[int, LessonStructure]] = []

        # Start a transaction to ensure all changes are applied atomically
        with supabase.batch() as batch:
            # 1. Update the main formation title
            batch.table("formations").update({"nom": proposed_structure.title}).eq("id", formation_id)

            # 2. Get the current state from the database for comparison
            current_modules_db_resp = supabase.table("formation_modules").select("modules(id, titre, index)").eq("formation_id", formation_id).execute()
            current_modules_db = current_modules_db_resp.data or []
            current_module_ids_db = {fm['modules']['id'] for fm in current_modules_db if fm.get('modules')}

            # 3. Process modules from the proposed structure
            proposed_module_ids = set()
            for i, module_data in enumerate(proposed_structure.modules):
                module_id_str = module_data.id.split('_')[-1]
                module_id = int(module_id_str)
                proposed_module_ids.add(module_id)

                module_payload = {"titre": module_data.title, "index": i}
                
                if module_id in current_module_ids_db:
                    batch.table("modules").update(module_payload).eq("id", module_id)
                else:
                    print(f"Warning: Skipping creation of new module with temp id {module_data.id}")
                    continue

                # 4. Process lessons (submodules) within each module
                current_lessons_db_resp = supabase.table("submodules").select("id, titre, description, content, index").eq("module_id", module_id).execute()
                current_lessons_db = current_lessons_db_resp.data or []
                current_lesson_ids_db = {l['id'] for l in current_lessons_db}
                
                proposed_lesson_ids = set()
                for j, lesson_data in enumerate(module_data.lessons):
                    # Check if the lesson ID is temporary or a real DB ID
                    if lesson_data.id.startswith("lesson_"):
                        lesson_id = int(lesson_data.id.split('_')[-1])
                        proposed_lesson_ids.add(lesson_id)
                        
                        lesson_payload = {
                            "titre": lesson_data.title,
                            "description": lesson_data.description,
                            "content": lesson_data.content,
                            "index": j
                        }
                        if lesson_id in current_lesson_ids_db:
                            batch.table("submodules").update(lesson_payload).eq("id", lesson_id)
                        else:
                            # If it's a new lesson ID not in DB, it's an error in logic, skip
                            print(f"Warning: Skipping update for non-existent lesson {lesson_id}")
                    else:
                        # If ID is not 'lesson_...', it's a new lesson to be created
                        lessons_to_add_separately.append((module_id, lesson_data))

                # 5. Delete lessons that are in the DB but not in the proposed structure
                lessons_to_delete = current_lesson_ids_db - proposed_lesson_ids
                if lessons_to_delete:
                    for lesson_id_del in lessons_to_delete:
                        batch.table("submodules").delete().eq("id", lesson_id_del)

            # 6. Delete modules that are in the DB but not in the proposed structure
            modules_to_delete = current_module_ids_db - proposed_module_ids
            if modules_to_delete:
                for module_id_del in modules_to_delete:
                    batch.table("formation_modules").delete().eq("module_id", module_id_del)
                    batch.table("modules").delete().eq("id", module_id_del)
        
        # Now, handle the insertion of new lessons outside the transaction
        for module_id_for_insert, lesson_data_to_insert in lessons_to_add_separately:
            supabase.table("submodules").insert({
                "titre": lesson_data_to_insert.title,
                "description": lesson_data_to_insert.description,
                "content": lesson_data_to_insert.content,
                "index": lesson_data_to_insert.index,
                "module_id": module_id_for_insert
            }).execute()

        return {"status": "success", "message": "Course updated successfully."}

    except Exception as e:
        return {"status": "error", "message": f"An error occurred: {str(e)}"} 