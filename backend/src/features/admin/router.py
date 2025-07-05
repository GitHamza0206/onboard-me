# features/admin/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from src.supabase_client import supabase
from src.features.auth.dependencies import get_current_admin_user
from . import schema
from uuid import UUID
from typing import List

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin_user)] # Protège toutes les routes de ce routeur
)

@router.post("/users", response_model=schema.UserProfileResponse, status_code=status.HTTP_201_CREATED)
def create_user_as_admin(
    new_user_data: schema.AdminUserCreate,
    admin_user: dict = Depends(get_current_admin_user)
):
    """
    (Admin uniquement) Invite un nouvel utilisateur par e-mail.
    Un e-mail d'invitation est envoyé pour que l'utilisateur définisse son propre mot de passe.
    """
    admin_id = admin_user.get('sub')

    try:
        # 1. Invite l'utilisateur via Supabase Auth. Cela envoie un e-mail d'invitation.
        # Cette fonction crée l'utilisateur et envoie un lien pour définir le mot de passe.
        invited_user_response = supabase.auth.admin.invite_user_by_email(
            new_user_data.email
        )
        new_user = invited_user_response.user
        new_user_id = new_user.id

        # 2. Met à jour le profil (qui a été créé par le trigger) avec les nom/prénom
        supabase.table('profiles').update({
            "prenom": new_user_data.prenom,
            "nom": new_user_data.nom
        }).eq('id', new_user_id).execute()

        # 3. Lie le nouvel utilisateur à l'admin dans la table 'managed_users'
        supabase.table('managed_users').insert({
            "manager_id": admin_id,
            "user_id": new_user_id
        }).execute()

        # 4. Récupère le profil final pour le retourner dans la réponse
        final_profile = supabase.table('profiles').select('*').eq('id', new_user_id).single().execute().data
        final_profile['email'] = new_user.email # Ajoute l'email pour une réponse complète

        return final_profile

    except Exception as e:
        # Gère le cas où l'utilisateur existe déjà pour éviter les erreurs
        if 'User already registered' in str(e):
             raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An user with this email already exists.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to invite user: {e}")


@router.get("/users", response_model=List[schema.UserProfileResponse])
def get_managed_users(admin_user: dict = Depends(get_current_admin_user)):
    """
    (Admin uniquement) Récupère la liste de tous les utilisateurs managés par l'admin connecté.
    """
    admin_id = admin_user.get('sub')

    try:
        # 1. Récupérer les IDs de tous les utilisateurs liés à cet admin
        managed_users_response = supabase.table('managed_users').select('user_id').eq('manager_id', admin_id).execute()
        
        if not managed_users_response.data:
            return [] # Retourne une liste vide si l'admin ne manage personne

        managed_user_ids = [item['user_id'] for item in managed_users_response.data]

        # 2. Récupérer les profils complets pour ces IDs
        profiles_response = supabase.table('profiles').select('*').in_('id', managed_user_ids).execute()
        profiles = profiles_response.data

        # 3. Enrichir chaque profil avec l'e-mail depuis Supabase Auth
        for profile in profiles:
            try:
                # Récupère les données d'authentification pour trouver l'e-mail
                auth_user = supabase.auth.admin.get_user_by_id(profile['id']).user
                profile['email'] = auth_user.email
            except Exception:
                # Au cas où l'utilisateur existerait dans profiles mais pas dans auth (improbable)
                profile['email'] = "email.not.found@example.com"
        
        return profiles

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to retrieve users: {e}")