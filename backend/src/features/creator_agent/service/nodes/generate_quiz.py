# src/features/creator_agent/service/nodes/generate_quiz.py
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List
from shared.llm import llm
from src.features.creator_agent.service.state import State


class QuizAnswer(BaseModel):
    answer_text: str = Field(description="Le texte de la réponse")
    is_correct: bool = Field(description="Si cette réponse est correcte")


class QuizQuestion(BaseModel):
    question_text: str = Field(description="Le texte de la question")
    question_type: str = Field(default="multiple_choice", description="Le type de question")
    explanation: str = Field(description="Explication de la bonne réponse")
    answers: List[QuizAnswer] = Field(description="Liste des réponses possibles")


class ModuleQuiz(BaseModel):
    title: str = Field(description="Titre du quiz")
    description: str = Field(description="Description du quiz")
    questions: List[QuizQuestion] = Field(description="Liste des questions du quiz")


def generate_quiz(state: State) -> State:
    """Génère un quiz pour un module après génération de toutes ses leçons"""
    
    # Récupérer le module actuel
    current_submodule = state.submodules[state.current_index]
    current_module_id = current_submodule["module_id"]
    
    # Récupérer toutes les leçons du module actuel
    current_module_lessons = []
    
    for sub in state.submodules:
        if sub["module_id"] == current_module_id:
            current_module_lessons.append({
                "title": sub["lesson_title"],
                "description": sub["lesson_description"],
                "content": state.outputs.get(sub["lesson_id"], "")
            })
    
    # Si on n'a pas de leçons, on skip
    if not current_module_lessons:
        return {"messages": [AIMessage(content="❌ Aucune leçon trouvée pour générer le quiz")]}
    
    # Créer le parser pour la sortie structurée
    parser = PydanticOutputParser(pydantic_object=ModuleQuiz)
    
    # Template pour générer le quiz
    prompt = ChatPromptTemplate.from_template(
        """Tu es un expert en création de quiz pédagogiques. 

Crée un quiz de 5 questions à choix multiples basé sur le contenu des leçons suivantes :

{lessons_content}

### Instructions pour le quiz :
1. Génère exactement 5 questions pertinentes
2. Chaque question doit avoir 4 réponses possibles (A, B, C, D)
3. Une seule réponse correcte par question
4. Inclus une explication pour chaque bonne réponse
5. Les questions doivent couvrir les points clés du module
6. Varie les types de questions (définition, application, analyse)

### Titre du module : {module_title}

{format_instructions}
"""
    )
    
    # Préparer le contenu des leçons
    lessons_text = ""
    for lesson in current_module_lessons:
        lessons_text += f"**{lesson['title']}**\n{lesson['description']}\n\n"
    
    # Récupérer le titre du module
    module_title = current_submodule.get("module_title", "Module")
    
    # Créer la chaîne de traitement
    chain = prompt | llm | parser
    
    try:
        # Générer le quiz
        quiz_data = chain.invoke({
            "lessons_content": lessons_text,
            "module_title": module_title,
            "format_instructions": parser.get_format_instructions()
        })
        
        # Stocker le quiz dans l'état (sérialisé en JSON)
        quiz_key = f"quiz_{current_module_id}"
        new_outputs = {**state.outputs, quiz_key: quiz_data.model_dump_json()}
        
        progress_msg = AIMessage(
            content=f"📝 Quiz généré pour le module {current_module_id} ({len(quiz_data.questions)} questions)"
        )
        
        return {
            "messages": [progress_msg],
            "outputs": new_outputs
        }
        
    except Exception as e:
        error_msg = AIMessage(content=f"❌ Erreur lors de la génération du quiz: {str(e)}")
        return {"messages": [error_msg]}