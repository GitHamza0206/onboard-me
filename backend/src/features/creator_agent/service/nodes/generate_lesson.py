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
    html = chain.invoke(sub)

    progress_msg = AIMessage(
        content=f"✅ Contenu généré pour {sub.get('lesson_id')} ({current_index + 1}/{len(submodules)})"
    )

    # Use .get() on the sub-dictionary as well for safety
    lesson_id = sub.get("lesson_id")
    new_outputs = {**outputs, lesson_id: html}

    return {
        "messages": [progress_msg],
        "outputs": new_outputs
    }