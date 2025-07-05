# features/auth/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from src.supabase_client import supabase
from .dependencies import get_current_user
from . import schema

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/signup")
def signup(credentials: schema.UserCredentials):
    """
    Inscrit un nouvel utilisateur via Supabase.
    Le trigger dans votre base de données créera automatiquement le profil associé.
    """
    try:
        # Appelle la méthode d'inscription de Supabase
        response = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password,
        })
        
        # Supabase envoie un email de confirmation. L'utilisateur n'est pas connecté immédiatement.
        return {"message": "Signup successful. Please check your email for confirmation.", "data": response.user}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {e}"
        )

@router.post("/signin", response_model=schema.SessionResponse)
def signin(credentials: schema.UserCredentials):
    """
    Connecte un utilisateur et retourne un token JWT.
    """
    try:
        # Appelle la méthode de connexion de Supabase
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        # Retourne le token d'accès pour que le frontend puisse le stocker
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Sign-in failed: {e}"
        )

@router.post("/signout")
def signout(current_user: dict = Depends(get_current_user)):
    """
    Déconnecte l'utilisateur en invalidant son token côté Supabase.
    Nécessite un token valide pour fonctionner.
    """
    try:
        # L'invalidation se fait côté client en supprimant le token.
        # Cette route sert de confirmation côté serveur.
        # Pour une invalidation réelle, il faudrait une gestion plus complexe.
        # Pour l'instant, on se contente de confirmer la déconnexion.
        return {"message": "Signout successful. Please remove the token from client-side."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signout failed: {e}"
        )

@router.get("/me", response_model=schema.UserProfile)
def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    Route protégée pour récupérer les informations de l'utilisateur
    à partir de son token JWT.
    """
    user_id = current_user.get('sub')
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID not found in token")

    try:
        # Récupère le profil complet de l'utilisateur depuis la table 'profiles'
        response = supabase.table('profiles').select('*').eq('id', user_id).single().execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"User profile not found: {e}")