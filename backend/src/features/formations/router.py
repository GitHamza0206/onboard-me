# features/formations/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from src.supabase_client import supabase
from src.features.auth.dependencies import get_current_user, get_current_admin_user
from postgrest.exceptions import APIError
from . import schema
from .progression_service import ProgressionService

router = APIRouter(
    prefix="/formations",
    tags=["Formations"]
)

@router.get("/", response_model=List[schema.Formation])
def get_all_formations(
    current_user: dict = Depends(get_current_user) # On récupère l'utilisateur connecté
):
    """
    Récupère la liste des formations CRÉÉES PAR l'utilisateur connecté.
    """
    try:
        # 1. Récupérer l'ID de l'utilisateur connecté depuis le token
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=401, detail="Token utilisateur invalide")

        response = supabase.table('formations').select('*').eq('creator_id', user_id).execute()
        
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
        # print("Payload envoyé à Supabase RPC:", formation_data.model_dump(by_alias=True))
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
    ATTENTION: Cette route ne gère pas la progression utilisateur. Utiliser /formations/{formation_id}/with-progression pour les utilisateurs.
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
                        submodules(id, titre, description, index, content)
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
                    "content": lesson.get('content', '')
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
            
        # print("Modules formatés :", data)

        return {
            "title": data['nom'],
            "has_content": data["has_content"],
            "modules": formatted_modules
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de récupération : {str(e)}")


@router.get("/{formation_id}/with-progression", response_model=schema.FormationWithProgression)
def get_formation_with_progression(
    formation_id: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Récupère la formation avec seulement les modules accessibles basés sur la progression de l'utilisateur.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=401, detail="Token utilisateur invalide")

        # 1. Vérifier que l'utilisateur a accès à cette formation
        user_formation_response = supabase.table('user_formations').select('*').eq(
            'user_id', user_id
        ).eq('formation_id', formation_id).execute()
        
        if not user_formation_response.data:
            raise HTTPException(status_code=403, detail="Formation non assignée à cet utilisateur")

        # 2. Récupérer les modules accessibles
        accessible_module_ids = ProgressionService.get_accessible_modules(user_id, formation_id)
        
        if not accessible_module_ids:
            raise HTTPException(status_code=404, detail="Aucun module accessible trouvé")

        # 3. Récupérer la structure complète de la formation
        response = (
            supabase.table("formations")
            .select("""
                nom,
                has_content,
                formation_modules(
                    modules(
                        id, titre, index,
                        submodules(id, titre, description, index, content)
                    )
                )
            """)
            .eq("id", formation_id)
            .execute()
        )
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Formation non trouvée")

        data = response.data[0]
        
        # 4. Récupérer tous les modules et marquer leur accessibilité
        all_modules = [
            fm["modules"]
            for fm in data.get("formation_modules", [])
            if fm.get("modules") is not None
        ]

        # 5. Formatter la réponse avec tous les modules
        formatted_modules = []
        for module in sorted(all_modules, key=lambda m: m.get("index", 0)):
            is_accessible = module['id'] in accessible_module_ids
            
            formatted_lessons = [
                {
                    "id": f"lesson_{lesson['id']}",
                    "title": lesson['titre'],
                    "description": lesson['description'],
                    "content": lesson.get('content', '')
                }
                for lesson in sorted(module.get("submodules", []), key=lambda l: l.get("index", 0))
            ]

            formatted_modules.append(
                {
                    "id": f"module_{module['id']}",
                    "title": module['titre'],
                    "lessons": formatted_lessons,
                    "is_accessible": is_accessible
                }
            )

        # 6. Obtenir le résumé de progression
        progress_summary = ProgressionService.get_user_progress_summary(user_id, formation_id)

        return {
            "title": data['nom'],
            "has_content": data["has_content"],
            "modules": formatted_modules,
            "progression": progress_summary
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur de récupération : {str(e)}")
    
    
    
router_modules = APIRouter(prefix="/modules", tags=["Modules"])

@router_modules.put("/{module_id}", status_code=204)
def update_module(module_id: int, payload: schema.ModuleUpdate,
                  current_user: dict = Depends(get_current_admin_user)):
    to_update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not to_update:
        return
    # print("Payload de mise à jour :", to_update)
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
    # print("Payload de mise à jour :", to_update)
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


@router.put("/{formation_id}/content", status_code=status.HTTP_204_NO_CONTENT)
def update_formation_content(
    formation_id: int,
    data: schema.FormationStructureCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """
    Met à jour le contenu complet d'une formation : titre, modules et leçons.
    """
    try:
        # 1. Mettre à jour le nom de la formation
        supabase.table("formations").update({"nom": data.title}).eq("id", formation_id).execute()

        # 2. Parcourir les modules et leçons pour mettre à jour leur contenu
        for module_data in data.modules:
            for lesson_data in module_data.lessons:
                # Extrait l'ID numérique ("lesson_42" -> 42)
                numeric_lesson_id = int(lesson_data.id.split('_')[1])
                
                # Prépare les données à mettre à jour
                update_payload = {
                    "titre": lesson_data.title,
                    "description": lesson_data.description,
                    "content": lesson_data.content
                }
                
                # Exécute la mise à jour pour chaque leçon
                supabase.table("submodules").update(update_payload).eq("id", numeric_lesson_id).execute()

    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Erreur Supabase: {e.message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne du serveur: {str(e)}")
    

@router.get("/users/me/formations", response_model=List[schema.FormationWithProgressionSummary])
def get_my_formations(
    current_user: dict = Depends(get_current_user)
):
    """
    Récupère la liste de toutes les formations assignées à l'utilisateur connecté avec leur progression.
    """
    try:
        user_id = current_user.get('sub')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in token")

        # 1. Récupérer les IDs des formations assignées à l'utilisateur
        user_formations_response = supabase.table('user_formations').select('formation_id').eq('user_id', user_id).execute()
        
        assigned_formation_ids = [item['formation_id'] for item in user_formations_response.data]

        if not assigned_formation_ids:
            return []

        # 2. Récupérer les détails de ces formations
        formations_response = supabase.table('formations').select('*').in_('id', assigned_formation_ids).execute()
        
        # 3. Ajouter les informations de progression pour chaque formation
        formations_with_progression = []
        for formation in formations_response.data:
            progression = ProgressionService.get_user_progress_summary(user_id, formation['id'])
            formations_with_progression.append({
                "id": formation['id'],
                "nom": formation['nom'],
                "progression": progression
            })
        
        return formations_with_progression
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))