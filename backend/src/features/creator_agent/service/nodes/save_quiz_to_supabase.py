# src/features/creator_agent/service/nodes/save_quiz_to_supabase.py
import json
from src.supabase_client import supabase
from langchain_core.messages import AIMessage
from src.features.creator_agent.service.state import State


def save_quiz_to_supabase(state: State) -> State:
    """Sauvegarde le quiz généré dans la base de données Supabase"""
    
    try:
        # Récupérer le module actuel
        current_module = state.submodules[state.current_index]
        module_id = current_module["module_id"]
        numeric_module_id = int(module_id.split("_")[1])
        
        # Récupérer le quiz généré (désérialiser depuis JSON)
        quiz_key = f"quiz_{module_id}"
        if quiz_key not in state.outputs:
            return {"messages": [AIMessage(content=f"❌ Aucun quiz trouvé pour le module {module_id}")]}
        
        quiz_json = state.outputs[quiz_key]
        quiz_data = json.loads(quiz_json)
        
        # 1. Insérer le quiz principal
        quiz_insert_data = {
            "module_id": numeric_module_id,
            "title": quiz_data["title"],
            "description": quiz_data["description"],
            "passing_score": 70,  # Score par défaut
            "max_attempts": 3,    # Tentatives par défaut
            "is_active": True
        }
        
        quiz_result = supabase.table("quizzes").insert(quiz_insert_data).execute()
        quiz_id = quiz_result.data[0]["id"]
        
        # 2. Insérer les questions
        for question_index, question in enumerate(quiz_data["questions"]):
            question_insert_data = {
                "quiz_id": quiz_id,
                "question_text": question["question_text"],
                "question_type": question["question_type"],
                "points": 1,  # Points par défaut
                "order_index": question_index,
                "explanation": question.get("explanation", "")
            }
            
            question_result = supabase.table("quiz_questions").insert(question_insert_data).execute()
            question_id = question_result.data[0]["id"]
            
            # 3. Insérer les réponses pour chaque question
            for answer_index, answer in enumerate(question["answers"]):
                answer_insert_data = {
                    "question_id": question_id,
                    "answer_text": answer["answer_text"],
                    "is_correct": answer["is_correct"],
                    "order_index": answer_index
                }
                
                supabase.table("quiz_answers").insert(answer_insert_data).execute()
        
        success_msg = AIMessage(
            content=f"💾 Quiz sauvegardé en DB pour le module {module_id} (ID: {quiz_id}, {len(quiz_data['questions'])} questions)"
        )
        
        return {"messages": [success_msg]}
        
    except Exception as e:
        error_msg = AIMessage(content=f"❌ Erreur lors de la sauvegarde du quiz: {str(e)}")
        return {"messages": [error_msg]}