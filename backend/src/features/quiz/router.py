from fastapi import APIRouter, Depends, HTTPException
from src.features.auth.dependencies import get_current_user
from src.supabase_client import supabase

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)

@router.get("/module/{module_id}")
async def get_module_quiz(
    module_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Récupère le quiz associé à un module spécifique"""
    try:
        # Récupérer le quiz du module
        quiz_response = supabase.table("quizzes").select("*").eq("module_id", module_id).eq("is_active", True).execute()
        
        if not quiz_response.data:
            raise HTTPException(status_code=404, detail="Quiz not found for this module")
        
        quiz = quiz_response.data[0]
        quiz_id = quiz["id"]
        
        # Récupérer les questions du quiz avec leurs réponses
        questions_response = supabase.table("quiz_questions").select("*").eq("quiz_id", quiz_id).order("order_index").execute()
        
        if not questions_response.data:
            raise HTTPException(status_code=404, detail="No questions found for this quiz")
        
        # Pour chaque question, récupérer ses réponses
        questions_with_answers = []
        for question in questions_response.data:
            question_id = question["id"]
            
            # Récupérer les réponses de la question
            answers_response = supabase.table("quiz_answers").select("*").eq("question_id", question_id).order("order_index").execute()
            
            question_with_answers = {
                **question,
                "answers": answers_response.data or []
            }
            questions_with_answers.append(question_with_answers)
        
        # Construire la réponse finale
        result = {
            **quiz,
            "questions": questions_with_answers
        }
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quiz: {str(e)}")

@router.get("/formation/{formation_id}")
async def get_formation_quizzes(
    formation_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Récupère tous les quiz d'une formation"""
    try:
        # Récupérer tous les modules de la formation
        modules_response = supabase.table("formation_modules").select("module_id").eq("formation_id", formation_id).execute()
        
        if not modules_response.data:
            raise HTTPException(status_code=404, detail="No modules found for this formation")
        
        module_ids = [module["module_id"] for module in modules_response.data]
        
        # Récupérer tous les quiz des modules
        quizzes = []
        for module_id in module_ids:
            try:
                quiz_response = supabase.table("quizzes").select("*").eq("module_id", module_id).eq("is_active", True).execute()
                
                if quiz_response.data:
                    quiz = quiz_response.data[0]
                    quiz_id = quiz["id"]
                    
                    # Récupérer les questions et réponses
                    questions_response = supabase.table("quiz_questions").select("*").eq("quiz_id", quiz_id).order("order_index").execute()
                    
                    questions_with_answers = []
                    for question in questions_response.data:
                        answers_response = supabase.table("quiz_answers").select("*").eq("question_id", question["id"]).order("order_index").execute()
                        question_with_answers = {
                            **question,
                            "answers": answers_response.data or []
                        }
                        questions_with_answers.append(question_with_answers)
                    
                    quiz_with_questions = {
                        **quiz,
                        "questions": questions_with_answers
                    }
                    quizzes.append(quiz_with_questions)
                    
            except Exception as e:
                # Continue même si un quiz individuel pose problème
                print(f"Error fetching quiz for module {module_id}: {e}")
                continue
        
        return quizzes
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching formation quizzes: {str(e)}")