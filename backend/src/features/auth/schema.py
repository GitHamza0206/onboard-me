# features/auth/schema.py
from pydantic import BaseModel
from typing import Optional

class UserCredentials(BaseModel):
    """ Modèle pour valider les données de connexion et d'inscription. """
    email: str
    password: str

class SessionResponse(BaseModel):
    """ Modèle pour la réponse de session, incluant le token. """
    access_token: str
    token_type: str = "bearer"

class UserProfile(BaseModel):
    """ Modèle pour les informations de l'utilisateur. """
    id: str
    email: Optional[str] = None
    # Ajoutez d'autres champs du profil si nécessaire