from fastapi import HTTPException
from langchain_core.tools import tool

from src.features.formations.schema import FormationStructureCreate
from src.supabase_client import supabase


@tool
def get_course_structure(formation_id: int) -> dict:
    """
    Fetches the complete structure of a formation from the database.
    This tool is the agent's way of "reading the file".
    """
    try:
        response = (
            supabase.table("formations")
            .select("""
                nom,
                has_content,
                formation_modules(
                    modules(
                        id, titre, index,
                        submodules(id, titre, description, index, content)
                    )
                )
            """)
            .eq("id", formation_id)
            .execute()
        )
        rows = response.data
        if not rows:
            raise HTTPException(status_code=404, detail="Formation not found")

        data = rows[0]
        
        modules_src = [
            fm["modules"]
            for fm in data.get("formation_modules", [])
            if fm.get("modules") is not None
        ]

        formatted_modules = []
        for module in sorted(modules_src, key=lambda m: m.get("index") or 0):
            formatted_lessons = [
                {
                    "id": f"lesson_{lesson['id']}",
                    "title": lesson['titre'],
                    "description": lesson['description'],
                    "content": lesson.get('content', '')
                }
                for lesson in sorted(module.get("submodules", []), key=lambda l: l.get("index") or 0)
            ]
            formatted_modules.append({
                "id": f"module_{module['id']}",
                "title": module['titre'],
                "lessons": formatted_lessons,
            })
            
        result = {
            "title": data['nom'],
            "has_content": data["has_content"],
            "modules": formatted_modules
        }
        
        # Validate with pydantic model to be sure
        FormationStructureCreate.model_validate(result)
        return result

    except Exception as e:
        # For the agent, we return a descriptive string instead of raising an exception
        return f"An error occurred while fetching the formation: {str(e)}"
