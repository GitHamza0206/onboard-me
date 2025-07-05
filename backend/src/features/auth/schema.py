# features/auth/schema.py
from pydantic import BaseModel, EmailStr
from typing import Optional

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
    id: str
    email: Optional[EmailStr] = None