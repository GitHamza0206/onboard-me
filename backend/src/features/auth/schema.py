# features/auth/schema.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID 

class UserCredentials(BaseModel):
    """ Modèle pour les données de connexion. """
    email: EmailStr
    password: str

class AdminSignUpCredentials(UserCredentials):
    """ Modèle pour l'inscription d'un admin, incluant un code secret. """
    prenom: Optional[str] = None
    nom: Optional[str] = None

class SessionResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserProfile(BaseModel):
    """ Modèle pour les informations complètes du profil utilisateur. """
    id: UUID
    prenom: Optional[str] = None
    nom: Optional[str] = None
    is_admin: bool
    email: EmailStr

    class Config:
        # Permet à Pydantic de lire les données depuis des objets non-dict
        from_attributes = True

class PasswordResetRequest(BaseModel):
    """ Modèle pour la demande de réinitialisation de mot de passe. """
    email: EmailStr

class PasswordResetPayload(BaseModel):
    """ Modèle pour la soumission du nouveau mot de passe. """
    password: str
