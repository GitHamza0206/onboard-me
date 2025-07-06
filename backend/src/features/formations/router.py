# features/formations/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from src.supabase_client import supabase
from src.features.auth.dependencies import get_current_user, get_current_admin_user
from postgrest.exceptions import APIError
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
        response = (
            supabase.table("formations")
            .select("""
                nom,
                has_content,
                formation_modules(
                    modules(
                        id, titre, index,
                        submodules(id, titre, description, index)
                    )
                )
            """)
            .eq("id", formation_id)
            .execute()
        )
        rows = response.data
        if not rows:
            raise HTTPException(status_code=404, detail="Formation non trouvée")

        data = rows[0]
        
        
        # Formatter la réponse pour correspondre au schéma Pydantic
        modules_src = [
            fm["modules"]
            for fm in data.get("formation_modules", [])
            if fm.get("modules") is not None
        ]

        formatted_modules = []
        for module in sorted(modules_src, key=lambda m: m.get("index", 0)):
            formatted_lessons = [
                {
                    "id": f"lesson_{lesson['id']}",
                    "title": lesson['titre'],
                    "description": lesson['description'],
                }
                for lesson in sorted(module.get("submodules", []), key=lambda l: l.get("index", 0))
            ]

            formatted_modules.append(
                {
                    "id": f"module_{module['id']}",
                    "title": module['titre'],
                    "lessons": formatted_lessons,
                }
            )
            
        print("Modules formatés :", data)

        return {
            "title": data['nom'],
            "has_content": data["has_content"],
            "modules": formatted_modules
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de récupération : {str(e)}")
    
    
    
router_modules = APIRouter(prefix="/modules", tags=["Modules"])

@router_modules.put("/{module_id}", status_code=204)
def update_module(module_id: int, payload: schema.ModuleUpdate,
                  current_user: dict = Depends(get_current_admin_user)):
    to_update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not to_update:
        return
    print("Payload de mise à jour :", to_update)
    try:
        supabase.table("modules") \
                .update(to_update) \
                .eq("id", module_id) \
                .execute()
    except APIError as e:
        raise HTTPException(status_code=500, detail=e.message)

router_sb = APIRouter(prefix="/submodules", tags=["Submodules"])

@router_sb.put("/{sub_id}", status_code=204)
def update_sub(sub_id: int, payload: schema.SubmoduleUpdate,
               current_user: dict = Depends(get_current_admin_user)):
    to_update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not to_update:
        return
    print("Payload de mise à jour :", to_update)
    try:
        supabase.table("submodules") \
                .update(to_update) \
                .eq("id", sub_id) \
                .execute()
    except APIError as e:
        raise HTTPException(500, detail=e.message)
    
@router.get("/{formation_id}/structure", response_model=schema.FormationStructureCreate)
def get_structure(formation_id: int, current_user=Depends(get_current_user)):
    """
    Alias explicite pour retourner juste la structure de formation.
    Utilisé par le bouton 'Generate'.
    """
    return get_formation_details(formation_id)