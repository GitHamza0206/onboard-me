# src/features/creator_agent/service/nodes/prepare_submodules.py
from typing import List, Dict, Any
from langchain_core.messages import AIMessage
from src.features.creator_agent.service.state import State

def extract_all_submodules(structure: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Flatte tous les submodules dans un seul tableau."""
    subs = []
    for mod in structure["modules"]:
        for lesson in mod["lessons"]:
            subs.append({"module_id": mod["id"],
                         "module_title": mod["title"], 
                         "lesson_id": lesson["id"],
                         "lesson_title": lesson["title"],
                         "lesson_description": lesson["description"]})
    return subs

def prepare(state: State) -> State:
    if not state.course_structure:
        raise ValueError("course_structure manquant dans le state")

    subs = extract_all_submodules(state.course_structure)
    return {
        # Une phrase de statut pour le chat (facultatif)
        "messages": [AIMessage(content=f"📚 {len(subs)} leçons à générer…")],
        "submodules": subs,          # la todo-list complète
        "current_index": 0,          # on démarre au début
        "outputs": {}                # vide au départ
    }
