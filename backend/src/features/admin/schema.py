# features/admin/schema.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID

class AdminUserCreate(BaseModel):
    """ Modèle pour les données requises pour créer un utilisateur en tant qu'admin. """
    email: EmailStr
    prenom: Optional[str] = None
    nom: Optional[str] = None
    password: Optional[str] = None

class UserProfileResponse(BaseModel):
    """ Modèle pour la réponse contenant le profil complet d'un utilisateur. """
    id: UUID
    prenom: Optional[str] = None
    nom: Optional[str] = None
    is_admin: bool
    email: EmailStr
    # --- AJOUTS ---
    onboardingStatus: str = "En attente" # Default value
    progress: int = 0 # Default value
    registrationDate: str # Will be a formatted string
    lastActivity: str # Will be a formatted string

    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    users: List[UserProfileResponse]