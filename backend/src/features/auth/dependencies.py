# features/auth/dependencies.py
from fastapi import Depends, HTTPException, status
# Changez l'import ici
from fastapi.security import HTTPBearer
from src.supabase_client import supabase
import jwt
import os

# Créez une instance de HTTPBearer
scheme = HTTPBearer()

# Récupérez la clé secrète JWT de votre projet Supabase (dans les paramètres API)
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")

# Modifiez la dépendance pour qu'elle utilise le nouveau "scheme"
def get_current_user(credentials: str = Depends(scheme)):
    """
    Valide le token JWT de Supabase et retourne les informations de l'utilisateur.
    """
    token = credentials.credentials # On récupère le token depuis l'objet credentials

    try:
        # Décoder le token avec la clé secrète pour vérifier son authenticité
        payload = jwt.decode(
            token, SUPABASE_JWT_SECRET, algorithms=["HS256"]
        )
        
        # Le payload contient les infos de l'utilisateur, comme son ID (sub)
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )