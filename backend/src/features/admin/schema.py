# features/admin/schema.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID

class AdminUserCreate(BaseModel):
    """ Modèle pour les données requises pour créer un utilisateur en tant qu'admin. """
    email: EmailStr
    prenom: Optional[str] = None
    nom: Optional[str] = None

class UserProfileResponse(BaseModel):
    """ Modèle pour la réponse contenant le profil complet d'un utilisateur. """
    id: UUID
    prenom: Optional[str] = None
    nom: Optional[str] = None
    is_admin: bool
    email: EmailStr

    class Config:
        # Permet à Pydantic de lire les données depuis des objets non-dict
        from_attributes = True

class UserListResponse(BaseModel):
    users: List[UserProfileResponse]