# features/formations/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from src.supabase_client import supabase
from src.features.auth.dependencies import get_current_user, get_current_admin_user
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
    

@router.post("/", response_model=schema.Formation, status_code=status.HTTP_201_CREATED)
def create_formation_from_structure(
    formation_data: schema.FormationStructureCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """
    Crée une nouvelle formation en appelant la fonction RPC de Supabase.
    """
    try:
        # Appelle la fonction PostgreSQL avec le JSON de la formation
        print("Payload envoyé à Supabase RPC:", formation_data.model_dump(by_alias=True))
        result = supabase.rpc('create_formation_from_structure', {
            'structure_json': formation_data.model_dump(by_alias=True) # Utilise .model_dump() pour pydantic v2
        }).execute()
        
        new_formation_id = result.data
        if not new_formation_id:
            raise HTTPException(status_code=500, detail="La création de la formation a échoué en base de données.")

        return {"id": new_formation_id, "nom": formation_data.title}

    except Exception as e:
        print(f"Erreur lors de la création de la formation : {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur RPC lors de la création de la formation : {str(e)}"
        )

@router.get("/{formation_id}", response_model=schema.FormationStructureCreate)
def get_formation_details(formation_id: int):
    """
    Récupère la structure complète d'une formation en utilisant les requêtes imbriquées de Supabase.
    """
    try:
        # C'est la manière idiomatique de Supabase pour faire des "joins"
        response = supabase.table('formations').select(
            'nom, modules(id, titre, index, submodules(id, titre, description, index))'
        ).eq('id', formation_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Formation non trouvée")
        
        data = response.data
        
        # Formatter la réponse pour correspondre au schéma Pydantic
        formatted_modules = []
        for module in sorted(data.get('modules', []), key=lambda m: m.get('index', 0)):
            formatted_lessons = []
            for lesson in sorted(module.get('submodules', []), key=lambda l: l.get('index', 0)):
                formatted_lessons.append({
                    "id": f"lesson_{lesson['id']}",
                    "title": lesson['titre'],
                    "description": lesson['description']
                })
            
            formatted_modules.append({
                "id": f"module_{module['id']}",
                "title": module['titre'],
                "lessons": formatted_lessons
            })

        return {
            "title": data['nom'],
            "modules": formatted_modules
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de récupération : {str(e)}")