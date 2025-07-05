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
print("--- JWT SECRET LOADED ---")
print(SUPABASE_JWT_SECRET)
print("-------------------------")

# Modifiez la dépendance pour qu'elle utilise le nouveau "scheme"
def get_current_user(credentials: str = Depends(scheme)):
    """
    Valide le token JWT de Supabase et retourne les informations de l'utilisateur.
    """
    token = credentials.credentials # On récupère le token depuis l'objet credentials

    try:
        # Décoder le token avec la clé secrète pour vérifier son authenticité
        payload = jwt.decode(
            token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated"
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
        
def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    """
    Vérifie si l'utilisateur actuel est un admin.
    S'appuie sur get_current_user puis interroge la table des profils.
    """
    user_id = current_user.get('sub')
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user token")

    try:
        # Interroge la table 'profiles' pour vérifier le statut d'administrateur
        response = supabase.table('profiles').select('is_admin').eq('id', user_id).single().execute()
        profile = response.data
        
        # Si le profil n'existe pas ou si is_admin est false, l'accès est refusé
        if not profile or not profile.get('is_admin'):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not an administrator")
        
        # Si l'utilisateur est bien un admin, on retourne ses informations
        return current_user
    except Exception as e:
        # Gère les erreurs potentielles lors de la requête à la base de données
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not verify admin status: {e}")
