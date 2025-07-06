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
async def get_managed_users(admin_user: dict = Depends(get_current_admin_user)):
    """
    (Admin only) Retrieves the list of all users managed by the logged-in admin.
    """
    admin_id = admin_user.get('sub')

    try:
        managed_users_response = supabase.table('managed_users').select('user_id').eq('manager_id', admin_id).execute()
        print(f"--- MANAGED USERS RESPONSE: {managed_users_response.data} ---")
        
        if not managed_users_response.data:
            return []

        managed_user_ids = [item['user_id'] for item in managed_users_response.data]
        profiles_response = supabase.table('profiles').select('*').in_('id', managed_user_ids).execute()
        profiles = profiles_response.data

        enriched_profiles = []
        for profile in profiles:
            try:
                auth_user = supabase.auth.admin.get_user_by_id(profile['id']).user
                
                # --- CORRECTION HERE ---
                # `auth_user.created_at` and `auth_user.last_sign_in_at` are already datetime objects.
                registration_date = auth_user.created_at.strftime('%d/%m/%Y')
                last_activity = "Never"
                if auth_user.last_sign_in_at:
                    last_activity = auth_user.last_sign_in_at.strftime('%d/%m/%Y %H:%M')

                enriched_profile = {
                    **profile,
                    "email": auth_user.email,
                    "registrationDate": registration_date,
                    "lastActivity": last_activity,
                    "onboardingStatus": "En cours",
                    "progress": 50
                }
                enriched_profiles.append(enriched_profile)
            except Exception as e:
                print(f"Could not enrich profile for user {profile['id']}: {e}")
                continue
        
        return enriched_profiles

    except Exception as e:
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