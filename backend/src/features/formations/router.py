# features/formations/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from src.supabase_client import supabase
from src.features.auth.dependencies import get_current_user
from . import schema

router = APIRouter(
    prefix="/formations",
    tags=["Formations"]
)

@router.get("/", response_model=List[schema.Formation])
def get_all_formations(
    current_user: dict = Depends(get_current_user) # Protège la route
):
    """
    Récupère la liste de toutes les formations.
    Accessible uniquement aux utilisateurs connectés.
    """
    try:
        response = supabase.table('formations').select('*').execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/assign")
def assign_formation_to_user(
    assignment: schema.UserFormationAssign,
    current_user: dict = Depends(get_current_user) # Protège la route
):
    """
    Assigne une formation à un utilisateur.
    Pour l'instant, tout utilisateur connecté peut le faire.
    On ajoutera la logique d'admin/manager plus tard.
    """
    try:
        # On pourrait ajouter une vérification ici: l'utilisateur est-il un admin ou le manager de user_id ?
        # if not is_admin_or_manager(current_user['sub'], assignment.user_id):
        #     raise HTTPException(status_code=403, detail="Not authorized")

        response = supabase.table('user_formations').insert({
            'user_id': str(assignment.user_id),
            'formation_id': assignment.formation_id
        }).execute()
        
        return {"message": "Formation assigned successfully", "data": response.data}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))