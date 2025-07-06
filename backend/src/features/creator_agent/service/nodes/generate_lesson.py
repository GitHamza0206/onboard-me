# src/features/creator_agent/service/nodes/generate_lesson.py
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from shared.llm import llm
from src.features.creator_agent.service.state import State

# --- prompt and chain definitions are unchanged ---
prompt = ChatPromptTemplate.from_template(
    """You are a world-class course writer. Write the COMPLETE lesson content
for employees.

### Context
- Module: "{module_title}" (id {module_id})
- Lesson: "{lesson_title}" (id {lesson_id})
- Description: "{lesson_description}"

### Output rules
Return *only* well-formatted **HTML** (no markdown, no explanations).
Use <h2>, <h3>, <p>, <ul><li>, etc.
"""
)
chain = prompt | llm | StrOutputParser()
# ---

def generate_lesson(state: State) -> State:
    submodules = state.get("submodules", [])
    current_index = state.get("current_index", 0)
    outputs = state.get("outputs", {})

    sub = submodules[current_index]
    lesson_id = sub.get("lesson_id")
    lesson_title = sub.get("lesson_title")
    
    print(f"--- Génération de la leçon : {lesson_title} ---")
    
    # Start message for streaming
    start_msg = AIMessage(
        content=f"🔄 Génération en cours: {lesson_title} ({current_index + 1}/{len(submodules)})"
    )
    
    html = chain.invoke(sub)

    print(f"--- Contenu HTML généré pour {lesson_title} ---")
    print(html[:500] + "..." if len(html) > 500 else html) # Affiche un aperçu

    # Completion message with more detail
    completion_msg = AIMessage(
        content=f"✅ Leçon terminée: {lesson_title} | {len(html)} caractères générés | Progression: {current_index + 1}/{len(submodules)} leçons"
    )

    new_outputs = {**outputs, lesson_id: html}

    return {
        "messages": [start_msg, completion_msg],
        "outputs": new_outputs,
        "lesson_generated": {
            "lesson_id": lesson_id,
            "lesson_title": lesson_title, 
            "content_length": len(html),
            "progress": f"{current_index + 1}/{len(submodules)}"
        }
    }