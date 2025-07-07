# features/admin/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from src.supabase_client import supabase
from src.features.auth.dependencies import get_current_admin_user
from src.features.formations.schema import Formation as FormationSchema
from . import schema
from uuid import UUID
from typing import List
import secrets 
import string 

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin_user)]
)

def generate_temporary_password(length=12):
    """Generates a secure temporary password."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    return password

def calculate_user_quiz_progress(user_id: str) -> tuple[int, str]:
    """
    Calcule la progression des quiz pour un utilisateur.
    Calcule la moyenne des progressions par formation (au lieu du total global).
    Retourne (progression_percentage, status_text).
    """
    try:
        # 1. Obtenir toutes les formations assignées à l'utilisateur
        user_formations_response = supabase.table('user_formations').select('formation_id').eq('user_id', user_id).execute()
        if not user_formations_response.data:
            return 0, "En attente"
        
        formation_ids = [item['formation_id'] for item in user_formations_response.data]
        formation_progress_list = []
        
        # 2. Calculer la progression pour chaque formation
        for formation_id in formation_ids:
            # Obtenir les modules de cette formation
            formation_modules_response = supabase.table('formation_modules').select('module_id').eq('formation_id', formation_id).execute()
            if not formation_modules_response.data:
                formation_progress_list.append(0)
                continue
                
            module_ids = [item['module_id'] for item in formation_modules_response.data]
            
            # Obtenir tous les quiz de ces modules
            quizzes_response = supabase.table('quizzes').select('id').in_('module_id', module_ids).execute()
            if not quizzes_response.data:
                formation_progress_list.append(0)
                continue
                
            quiz_ids = [quiz['id'] for quiz in quizzes_response.data]
            total_quizzes_in_formation = len(quiz_ids)
            
            # Obtenir les tentatives de quiz réussies pour cette formation
            successful_attempts_response = supabase.table('user_quiz_attempts').select('quiz_id').eq('user_id', user_id).eq('passed', True).in_('quiz_id', quiz_ids).execute()
            
            # Compter les quiz uniques réussis pour cette formation
            successful_quiz_ids = set(attempt['quiz_id'] for attempt in successful_attempts_response.data)
            successful_quizzes_in_formation = len(successful_quiz_ids)
            
            # Calculer le pourcentage pour cette formation
            formation_progress = round((successful_quizzes_in_formation / total_quizzes_in_formation) * 100) if total_quizzes_in_formation > 0 else 0
            formation_progress_list.append(formation_progress)
        
        # 3. Calculer la moyenne des progressions de toutes les formations
        if not formation_progress_list:
            return 0, "En attente"
            
        average_progress = round(sum(formation_progress_list) / len(formation_progress_list))
        
        # 4. Déterminer le statut
        if average_progress == 100:
            status = "Terminé"
        elif average_progress > 0:
            status = "En cours"
        else:
            status = "En attente"
        
        return average_progress, status
        
    except Exception as e:
        print(f"Erreur lors du calcul de progression pour l'utilisateur {user_id}: {e}")
        return 0, "En attente"


@router.post("/users", response_model=schema.UserProfileResponse, status_code=status.HTTP_201_CREATED)
def create_user_as_admin(
    new_user_data: schema.AdminUserCreate,
    admin_user: dict = Depends(get_current_admin_user)
):
    """
    (Admin only) Creates a new user directly.
    A temporary password is generated and must be communicated to the user.
    """
    admin_id = admin_user.get('sub')
    temp_password = "imadimadimad"

    try:
        # 1. Create the user in Supabase Auth
        created_user_response = supabase.auth.admin.create_user({
            "email": new_user_data.email,
            "password": "tototiti",
            "email_confirm": True
        })
        new_user = created_user_response.user
        new_user_id = new_user.id

        # 2. Use UPSERT to create/update the profile. This is the key fix.
        # It avoids the race condition with the database trigger.
        profile_data = {
            "id": str(new_user_id),
            "prenom": new_user_data.prenom,
            "nom": new_user_data.nom
        }
        supabase.table('profiles').upsert(profile_data).execute()

        # 3. Add the user to the list of users managed by this admin
        supabase.table('managed_users').insert({
            "manager_id": str(admin_id),
            "user_id": str(new_user_id)
        }).execute()
        
        # 4. Construct the final response without an extra SELECT call
        final_profile = {
            "id": new_user_id,
            "prenom": new_user_data.prenom,
            "nom": new_user_data.nom,
            "is_admin": False, # New users are not admins by default
            "email": new_user.email,
            "registrationDate": new_user.created_at.strftime('%d/%m/%Y'),
            "lastActivity": "Jamais"
        }

        print(f"--- TEMPORARY PASSWORD FOR {new_user_data.email} : {temp_password} ---")

        return final_profile

    except Exception as e:
        if 'User already registered' in str(e) or 'duplicate key value' in str(e):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this email already exists.")
        # Provide a more specific error message from Supabase if available
        error_detail = str(e.args[0].message) if e.args and hasattr(e.args[0], 'message') else str(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create user: {error_detail}")

@router.get("/users", response_model=List[schema.UserProfileResponse])
def get_managed_users(admin_user: dict = Depends(get_current_admin_user)):
    """
    (Admin only) Retrieves the list of all users managed by the logged-in admin.
    """
    admin_id = admin_user.get('sub')

    try:
        # --- CORRECTION ICI ---
        managed_users_response = supabase.table('managed_users').select('user_id').eq('manager_id', admin_id).execute()
        print(f"--- MANAGED USERS RESPONSE: {managed_users_response.data} ---")
        
        if not managed_users_response.data:
            return []

        managed_user_ids = [item['user_id'] for item in managed_users_response.data]
        
        # --- CORRECTION ICI ---
        profiles_response = supabase.table('profiles').select('*').in_('id', managed_user_ids).execute()
        profiles = profiles_response.data
        print(f"--- PROFILES FOUND: {len(profiles)} profiles ---")

        enriched_profiles = []
        for profile in profiles:
            try:
                print(f"--- ENRICHING PROFILE: {profile['id']} ---")
                # --- CORRECTION ICI ---
                auth_user_response = supabase.auth.admin.get_user_by_id(profile['id'])
                auth_user = auth_user_response.user
                
                registration_date = auth_user.created_at.strftime('%d/%m/%Y')
                last_activity = "Never"
                if auth_user.last_sign_in_at:
                    last_activity = auth_user.last_sign_in_at.strftime('%d/%m/%Y %H:%M')

                # Calculer la vraie progression basée sur les quiz
                progress_percentage, onboarding_status = calculate_user_quiz_progress(profile['id'])
                print(f"--- PROGRESS FOR {profile['id']}: {progress_percentage}% ({onboarding_status}) ---")

                enriched_profile = {
                    **profile,
                    "email": auth_user.email,
                    "registrationDate": registration_date,
                    "lastActivity": last_activity,
                    "onboardingStatus": onboarding_status,
                    "progress": progress_percentage
                }
                enriched_profiles.append(enriched_profile)
                print(f"--- SUCCESSFULLY ENRICHED USER {profile['id']} ---")
            except Exception as e:
                print(f"Could not enrich profile for user {profile['id']}: {e}")
                import traceback
                print(f"--- TRACEBACK: {traceback.format_exc()} ---")
                continue
        
        print(f"--- FINAL ENRICHED PROFILES COUNT: {len(enriched_profiles)} ---")
        return enriched_profiles

    except Exception as e:
        # Il est bon de logger l'erreur pour le débogage
        print(f"An error occurred while retrieving users: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to retrieve users: {e}")

@router.get("/users/{user_id}/formations", response_model=List[FormationSchema])
def get_user_assigned_formations(user_id: UUID, admin_user: dict = Depends(get_current_admin_user)):
    """
    (Admin only) Gets all formations assigned to a specific user.
    """
    try:
        user_formations_response = supabase.table('user_formations').select('formation_id').eq('user_id', user_id).execute()
        if not user_formations_response.data:
            return []
        
        formation_ids = [item['formation_id'] for item in user_formations_response.data]
        
        formations = supabase.table('formations').select('id, nom').in_('id', formation_ids).execute()
        return formations.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}/progress")
def get_user_detailed_progress(user_id: UUID, admin_user: dict = Depends(get_current_admin_user)):
    """
    (Admin only) Gets detailed progress statistics for a specific user.
    """
    try:
        user_id_str = str(user_id)
        
        # Calculer la progression des quiz
        progress_percentage, status = calculate_user_quiz_progress(user_id_str)
        
        # Obtenir des statistiques détaillées
        user_formations_response = supabase.table('user_formations').select('formation_id').eq('user_id', user_id_str).execute()
        total_formations = len(user_formations_response.data)
        
        if total_formations == 0:
            return {
                "progress_percentage": 0,
                "status": "En attente",
                "total_formations": 0,
                "total_quizzes": 0,
                "completed_quizzes": 0,
                "formations": []
            }
        
        formation_ids = [item['formation_id'] for item in user_formations_response.data]
        
        # Obtenir tous les modules et quiz
        formation_modules_response = supabase.table('formation_modules').select('module_id, formation_id').in_('formation_id', formation_ids).execute()
        module_ids = [item['module_id'] for item in formation_modules_response.data]
        
        quizzes_response = supabase.table('quizzes').select('id, module_id').in_('module_id', module_ids).execute()
        total_quizzes = len(quizzes_response.data)
        
        # Quiz réussis
        quiz_ids = [quiz['id'] for quiz in quizzes_response.data]
        successful_attempts_response = supabase.table('user_quiz_attempts').select('quiz_id').eq('user_id', user_id_str).eq('passed', True).in_('quiz_id', quiz_ids).execute()
        successful_quiz_ids = set(attempt['quiz_id'] for attempt in successful_attempts_response.data)
        completed_quizzes = len(successful_quiz_ids)
        
        # Détails par formation
        formations_response = supabase.table('formations').select('id, nom').in_('id', formation_ids).execute()
        formations_details = []
        
        for formation in formations_response.data:
            formation_modules = [item['module_id'] for item in formation_modules_response.data if item['formation_id'] == formation['id']]
            formation_quizzes = [quiz['id'] for quiz in quizzes_response.data if quiz['module_id'] in formation_modules]
            formation_completed_quizzes = len([qid for qid in formation_quizzes if qid in successful_quiz_ids])
            
            formation_progress = 0
            if len(formation_quizzes) > 0:
                formation_progress = round((formation_completed_quizzes / len(formation_quizzes)) * 100)
            
            formations_details.append({
                "id": formation['id'],
                "nom": formation['nom'],
                "total_quizzes": len(formation_quizzes),
                "completed_quizzes": formation_completed_quizzes,
                "progress_percentage": formation_progress
            })
        
        return {
            "progress_percentage": progress_percentage,
            "status": status,
            "total_formations": total_formations,
            "total_quizzes": total_quizzes,
            "completed_quizzes": completed_quizzes,
            "formations": formations_details
        }
        
    except Exception as e:
        print(f"Erreur lors de la récupération des détails de progression: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/users/{user_id}/formations/{formation_id}", status_code=status.HTTP_204_NO_CONTENT)
def unassign_formation_from_user(user_id: UUID, formation_id: int, admin_user: dict = Depends(get_current_admin_user)):
    """
    (Admin only) Removes an assigned formation from a user.
    """
    try:
        (supabase.table('user_formations')
            .delete()
            .match({'user_id': str(user_id), 'formation_id': formation_id})
            .execute())
        return
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
def get_analytics(admin_user: dict = Depends(get_current_admin_user)):
    """
    (Admin only) Gets analytics data for the dashboard.
    """
    try:
        admin_id = admin_user.get('sub')
        
        # Get managed users for this admin
        managed_users_response = supabase.table('managed_users').select('user_id').eq('manager_id', admin_id).execute()
        if not managed_users_response.data:
            # If no managed users, return empty analytics
            return {
                "kpis": {
                    "total_users": 0,
                    "total_formations": 0,
                    "total_assigned": 0,
                    "completion_rate": 0,
                    "quiz_success_rate": 0
                },
                "formation_completion_stats": [],
                "module_abandonment_stats": []
            }
        
        managed_user_ids = [item['user_id'] for item in managed_users_response.data]
        
        # Get total managed users count
        total_users = len(managed_user_ids)
        
        # Get total formations count (formations created by this admin)
        total_formations_response = supabase.table('formations').select('id', count='exact').eq('creator_id', admin_id).execute()
        total_formations = total_formations_response.count
        
        # Get total assigned formations count for managed users
        total_assigned_response = supabase.table('user_formations').select('id', count='exact').in_('user_id', managed_user_ids).execute()
        total_assigned = total_assigned_response.count
        
        # Get total quiz attempts for managed users
        total_quiz_attempts_response = supabase.table('user_quiz_attempts').select('id', count='exact').in_('user_id', managed_user_ids).execute()
        total_quiz_attempts = total_quiz_attempts_response.count
        
        # Get successful quiz attempts for managed users
        successful_attempts_response = supabase.table('user_quiz_attempts').select('id', count='exact').eq('passed', True).in_('user_id', managed_user_ids).execute()
        successful_attempts = successful_attempts_response.count
        
        # Calculate completion rate
        completion_rate = round((successful_attempts / total_quiz_attempts * 100) if total_quiz_attempts > 0 else 0, 1)
        
        # Get formation completion stats (only for formations created by this admin)
        formations_response = supabase.table('formations').select('id, nom').eq('creator_id', admin_id).execute()
        formation_stats = []
        
        for formation in formations_response.data:
            formation_id = formation['id']
            
            # Get modules for this formation
            modules_response = supabase.table('formation_modules').select('module_id').eq('formation_id', formation_id).execute()
            module_ids = [item['module_id'] for item in modules_response.data]
            
            if module_ids:
                # Get quizzes for these modules
                quizzes_response = supabase.table('quizzes').select('id').in_('module_id', module_ids).execute()
                quiz_ids = [quiz['id'] for quiz in quizzes_response.data]
                
                if quiz_ids:
                    # Get managed users assigned to this formation
                    users_response = supabase.table('user_formations').select('user_id').eq('formation_id', formation_id).in_('user_id', managed_user_ids).execute()
                    assigned_managed_users = [user['user_id'] for user in users_response.data]
                    
                    if assigned_managed_users:
                        # Calculate completion rate for this formation (only for managed users)
                        total_possible_completions = len(assigned_managed_users) * len(quiz_ids)
                        
                        completed_response = supabase.table('user_quiz_attempts').select('user_id, quiz_id', count='exact').eq('passed', True).in_('user_id', assigned_managed_users).in_('quiz_id', quiz_ids).execute()
                        completed_count = completed_response.count
                        
                        completion_percentage = round((completed_count / total_possible_completions * 100) if total_possible_completions > 0 else 0)
                        
                        formation_stats.append({
                            "name": formation['nom'],
                            "Taux de complétion": completion_percentage
                        })
        
        # Get module abandonment stats (only for modules in formations created by this admin)
        admin_formations_response = supabase.table('formations').select('id').eq('creator_id', admin_id).execute()
        admin_formation_ids = [f['id'] for f in admin_formations_response.data]
        
        if admin_formation_ids:
            # Get modules from admin's formations
            admin_modules_response = supabase.table('formation_modules').select('module_id').in_('formation_id', admin_formation_ids).execute()
            admin_module_ids = [item['module_id'] for item in admin_modules_response.data]
            
            if admin_module_ids:
                modules_response = supabase.table('modules').select('id, titre').in_('id', admin_module_ids).execute()
                abandonment_stats = []
                
                for module in modules_response.data:
                    module_id = module['id']
                    
                    # Get quizzes for this module
                    quizzes_response = supabase.table('quizzes').select('id').eq('module_id', module_id).execute()
                    quiz_ids = [quiz['id'] for quiz in quizzes_response.data]
                    
                    if quiz_ids:
                        # Get formations that include this module (from admin's formations)
                        formation_modules_response = supabase.table('formation_modules').select('formation_id').eq('module_id', module_id).in_('formation_id', admin_formation_ids).execute()
                        formation_ids = [item['formation_id'] for item in formation_modules_response.data]
                        
                        if formation_ids:
                            # Get managed users assigned to these formations
                            users_response = supabase.table('user_formations').select('user_id').in_('formation_id', formation_ids).in_('user_id', managed_user_ids).execute()
                            assigned_managed_users = [user['user_id'] for user in users_response.data]
                            
                            if assigned_managed_users and len(assigned_managed_users) > 0:
                                # Calculate abandonment rate for managed users only
                                total_attempts_response = supabase.table('user_quiz_attempts').select('user_id', count='exact').in_('user_id', assigned_managed_users).in_('quiz_id', quiz_ids).execute()
                                total_attempts = total_attempts_response.count
                                
                                failed_attempts_response = supabase.table('user_quiz_attempts').select('user_id', count='exact').eq('passed', False).in_('user_id', assigned_managed_users).in_('quiz_id', quiz_ids).execute()
                                failed_attempts = failed_attempts_response.count
                                
                                abandonment_rate = round((failed_attempts / total_attempts * 100) if total_attempts > 0 else 0)
                                
                                if abandonment_rate > 0:  # Only include modules with some abandonment
                                    # Get formation name
                                    formation_name = "Formation inconnue"
                                    if formation_ids:
                                        formation_response = supabase.table('formations').select('nom').eq('id', formation_ids[0]).execute()
                                        if formation_response.data:
                                            formation_name = formation_response.data[0]['nom']
                                    
                                    abandonment_stats.append({
                                        "module": module['titre'],
                                        "formation": formation_name,
                                        "tauxAbandon": f"{abandonment_rate}%"
                                    })
            else:
                abandonment_stats = []
        else:
            abandonment_stats = []
        
        # Sort by abandonment rate and take top 4
        abandonment_stats.sort(key=lambda x: int(x['tauxAbandon'].replace('%', '')), reverse=True)
        abandonment_stats = abandonment_stats[:4]
        
        return {
            "kpis": {
                "total_users": total_users,
                "total_formations": total_formations,
                "total_assigned": total_assigned,
                "completion_rate": completion_rate,
                "quiz_success_rate": round((successful_attempts / total_quiz_attempts * 100) if total_quiz_attempts > 0 else 0, 1)
            },
            "formation_completion_stats": formation_stats[:5],  # Top 5 formations
            "module_abandonment_stats": abandonment_stats
        }
        
    except Exception as e:
        print(f"Error getting analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: UUID, admin_user: dict = Depends(get_current_admin_user)):
    """
    (Admin only) Deletes a user and all their related data from the application layer.
    """
    try:
        user_id_str = str(user_id)

        # --- Step 1: Clear all known dependencies on the user ---

        # Set creator_id to NULL in 'formations'
        supabase.table('formations').update({'creator_id': None}).eq('creator_id', user_id_str).execute()
        
        # Delete documents created by the user
        supabase.table('documents').delete().eq('profile_id', user_id_str).execute()
        
        # Delete quiz attempts
        supabase.table('user_quiz_attempts').delete().eq('user_id', user_id_str).execute()
        
        # Delete course assignments
        supabase.table('user_formations').delete().eq('user_id', user_id_str).execute()
        
        # Delete management records
        supabase.table('managed_users').delete().eq('user_id', user_id_str).execute()
        supabase.table('managed_users').delete().eq('manager_id', user_id_str).execute()

        # --- Step 2: Delete the user from Supabase Auth ---
        # THE FIX: Ensure user_id is a string for this call.
        supabase.auth.admin.delete_user(user_id_str)
        
        return

    except Exception as e:
        print(f"Error deleting user {str(user_id)}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")