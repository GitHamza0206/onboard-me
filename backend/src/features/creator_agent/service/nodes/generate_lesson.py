# src/features/creator_agent/service/nodes/generate_lesson.py
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from shared.llm import llm
from src.features.creator_agent.service.state import State

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

def generate_lesson(state: State) -> State:
    sub = state.submodules[state.current_index]
    html = chain.invoke(sub)

    # on crée un message pour suivre l’avancement
    progress_msg = AIMessage(
        content=f"✅ Contenu généré pour {sub['lesson_id']} ({state.current_index+1}/{len(state.submodules)})"
    )

    # maj du dictionnaire de sortie
    new_outputs = {**state.outputs, sub["lesson_id"]: html}

    return {
        "messages": [progress_msg],
        "outputs": new_outputs
    }
