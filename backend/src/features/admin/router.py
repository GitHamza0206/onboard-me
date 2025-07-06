# features/admin/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from src.supabase_client import supabase
from src.features.auth.dependencies import get_current_admin_user
from . import schema
from uuid import UUID
from typing import List
import secrets 
import string 
from datetime import datetime

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
    temp_password = generate_temporary_password()

    try:
        print("--- CREATING USER AS ADMIN ---")
        created_user_response = supabase.auth.admin.create_user({
            "email": new_user_data.email,
            "password": "tototiti",
            "email_confirm": False
        })
        
        new_user = created_user_response.user
        new_user_id = new_user.id
        print(f"--- NEW USER ID: {new_user_id} ---")
        supabase.table('profiles').update({
            "prenom": new_user_data.prenom,
            "nom": new_user_data.nom
        }).eq('id', new_user_id).execute()

        # Associate the new user with the admin
        print(f"--- ASSOCIATING USER {new_user_id} WITH ADMIN {admin_id}")
        supabase.table('managed_users').insert({
            "manager_id": admin_id,
            "user_id": new_user_id
        }).execute()

        final_profile = supabase.table('profiles').select('*').eq('id', new_user_id).single().execute().data
        final_profile['email'] = new_user.email

        # --- CORRECTION HERE ---
        # `new_user.created_at` is already a datetime object.
        final_profile['registrationDate'] = new_user.created_at.strftime('%d/%m/%Y')
        final_profile['lastActivity'] = "Jamais"

        print(f"--- TEMPORARY PASSWORD FOR {new_user_data.email} : {temp_password} ---")

        return final_profile

    except Exception as e:
        if 'User already registered' in str(e) or 'duplicate key value' in str(e):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this email already exists.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to create user: {e}")


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