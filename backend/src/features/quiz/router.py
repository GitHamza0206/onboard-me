from fastapi import APIRouter, Depends, HTTPException
from src.features.auth.dependencies import get_current_user
from src.supabase_client import supabase
from src.features.formations.progression_service import ProgressionService

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"]
)

@router.get("/module/{module_id}")
async def get_module_quiz(
    module_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Récupère le quiz associé à un module spécifique avec vérification d'accès"""
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=401, detail="Token utilisateur invalide")

        # 1. Vérifier que l'utilisateur a accès à ce module
        # D'abord, trouver la formation qui contient ce module
        formation_response = supabase.table("formation_modules").select("formation_id").eq("module_id", module_id).execute()
        
        if not formation_response.data:
            raise HTTPException(status_code=404, detail="Module not found in any formation")
        
        formation_id = formation_response.data[0]["formation_id"]
        
        # Vérifier que l'utilisateur a accès à cette formation
        user_formation_response = supabase.table('user_formations').select('*').eq(
            'user_id', user_id
        ).eq('formation_id', formation_id).execute()
        
        if not user_formation_response.data:
            raise HTTPException(status_code=403, detail="Formation non assignée à cet utilisateur")

        # Vérifier que le module est accessible selon la progression
        accessible_modules = ProgressionService.get_accessible_modules(user_id, formation_id)
        
        if module_id not in accessible_modules:
            raise HTTPException(status_code=403, detail="Module non accessible. Complétez les modules précédents.")

        # 2. Récupérer le quiz du module
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


@router.post("/submit")
async def submit_quiz(
    quiz_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Soumet les réponses d'un quiz et calcule le score"""
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=401, detail="Token utilisateur invalide")

        quiz_id = quiz_data.get("quiz_id")
        answers = quiz_data.get("answers", [])  # Format: [{"question_id": int, "selected_answer_ids": [int]}]
        
        if not quiz_id or not answers:
            raise HTTPException(status_code=400, detail="quiz_id et answers sont requis")

        # 1. Vérifier que le quiz existe et récupérer ses infos
        quiz_response = supabase.table("quizzes").select("*").eq("id", quiz_id).execute()
        if not quiz_response.data:
            raise HTTPException(status_code=404, detail="Quiz non trouvé")
        
        quiz = quiz_response.data[0]
        module_id = quiz["module_id"]
        passing_score = quiz["passing_score"]
        
        # 2. Vérifier l'accès au module (même logique que get_module_quiz)
        formation_response = supabase.table("formation_modules").select("formation_id").eq("module_id", module_id).execute()
        if not formation_response.data:
            raise HTTPException(status_code=404, detail="Module non trouvé")
        
        formation_id = formation_response.data[0]["formation_id"]
        
        user_formation_response = supabase.table('user_formations').select('*').eq(
            'user_id', user_id
        ).eq('formation_id', formation_id).execute()
        
        if not user_formation_response.data:
            raise HTTPException(status_code=403, detail="Formation non assignée")

        accessible_modules = ProgressionService.get_accessible_modules(user_id, formation_id)
        if module_id not in accessible_modules:
            raise HTTPException(status_code=403, detail="Module non accessible")

        # 3. Calculer le score
        total_score = 0
        max_score = 0
        responses_to_save = []
        
        for answer_data in answers:
            question_id = answer_data.get("question_id")
            selected_answer_ids = answer_data.get("selected_answer_ids", [])
            
            # Récupérer la question
            question_response = supabase.table("quiz_questions").select("*").eq("id", question_id).execute()
            if not question_response.data:
                continue
                
            question = question_response.data[0]
            question_points = question.get("points", 1)
            max_score += question_points
            
            # Récupérer les bonnes réponses
            correct_answers_response = supabase.table("quiz_answers").select("id").eq(
                "question_id", question_id
            ).eq("is_correct", True).execute()
            
            correct_answer_ids = [ans["id"] for ans in correct_answers_response.data]
            
            # Vérifier si la réponse est correcte
            is_correct = set(selected_answer_ids) == set(correct_answer_ids)
            points_earned = question_points if is_correct else 0
            total_score += points_earned
            
            responses_to_save.append({
                "question_id": question_id,
                "selected_answer_ids": selected_answer_ids,
                "is_correct": is_correct,
                "points_earned": points_earned
            })

        # 4. Calculer le pourcentage et déterminer si c'est réussi
        percentage = (total_score / max_score * 100) if max_score > 0 else 0
        passed = percentage >= passing_score
        
        # 5. Compter les tentatives précédentes
        previous_attempts_response = supabase.table("user_quiz_attempts").select("attempt_number").eq(
            "user_id", user_id
        ).eq("quiz_id", quiz_id).order("attempt_number", desc=True).limit(1).execute()
        
        attempt_number = 1
        if previous_attempts_response.data:
            attempt_number = previous_attempts_response.data[0]["attempt_number"] + 1
        
        # Vérifier le nombre maximum de tentatives
        max_attempts = quiz.get("max_attempts", 3)
        if attempt_number > max_attempts:
            raise HTTPException(status_code=400, detail=f"Nombre maximum de tentatives atteint ({max_attempts})")

        # 6. Sauvegarder la tentative
        attempt_data = {
            "user_id": user_id,
            "quiz_id": quiz_id,
            "score": total_score,
            "max_score": max_score,
            "passed": passed,
            "completed_at": "now()",
            "attempt_number": attempt_number
        }
        
        attempt_response = supabase.table("user_quiz_attempts").insert(attempt_data).execute()
        if not attempt_response.data:
            raise HTTPException(status_code=500, detail="Erreur lors de la sauvegarde de la tentative")
        
        attempt_id = attempt_response.data[0]["id"]
        
        # 7. Sauvegarder les réponses individuelles
        for response in responses_to_save:
            response["attempt_id"] = attempt_id
            
        if responses_to_save:
            supabase.table("user_quiz_responses").insert(responses_to_save).execute()

        # 8. Retourner le résultat
        return {
            "score": total_score,
            "max_score": max_score,
            "percentage": round(percentage, 1),
            "passed": passed,
            "passing_score": passing_score,
            "attempt_number": attempt_number,
            "max_attempts": max_attempts,
            "message": "Quiz réussi ! Vous pouvez passer au module suivant." if passed else f"Quiz échoué. Score: {percentage:.1f}%. Minimum requis: {passing_score}%."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la soumission: {str(e)}")