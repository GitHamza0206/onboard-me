# features/auth/router.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
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
    Route protégée pour récupérer le profil complet de l'utilisateur
    en combinant les données du token et de la base de données.
    """
    user_id = current_user.get('sub')
    user_email = current_user.get('email')

    if not user_id:
        raise HTTPException(status_code=400, detail="User ID not found in token")

    try:
        # 1. Récupérer les données de la table 'profiles'
        profile_response = supabase.table('profiles').select(
            'id, prenom, nom, is_admin'
        ).eq('id', user_id).single().execute()
        
        profile_data = profile_response.data
        if not profile_data:
            raise HTTPException(status_code=404, detail="User profile not found")

        # 2. Combiner les données du profil avec l'email du token
        # pour correspondre au schéma UserProfile
        full_profile = {
            "id": profile_data.get('id'),
            "prenom": profile_data.get('prenom'),
            "nom": profile_data.get('nom'),
            "is_admin": profile_data.get('is_admin'),
            "email": user_email 
        }
        
        return full_profile

    except Exception as e:
        # Gère les erreurs, y compris si le profil n'est pas trouvé
        raise HTTPException(status_code=404, detail=f"Could not retrieve user profile: {e}")

    
@router.post("/signup/admin", status_code=status.HTTP_201_CREATED)
def signup_admin(credentials: schema.AdminSignUpCredentials):
    """
    Inscrit un nouvel utilisateur directement en tant qu'ADMINISTRATEUR.
    Cette route est maintenant publique.
    """
    try:
        # 1. Crée l'utilisateur dans Supabase Auth
        response = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password,
        })
        new_user = response.user
        new_user_id = new_user.id

        # 2. Met à jour le profil (créé par le trigger) pour le passer admin
        supabase.table('profiles').update({
            "is_admin": True,
            "prenom": credentials.prenom,
            "nom": credentials.nom
        }).eq('id', new_user_id).execute()
        
        return {"message": "Admin user created successfully."}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Admin signup failed: {e}"
        )
        
@router.post("/signin/admin", response_model=schema.SessionResponse)
def signin_admin(credentials: schema.UserCredentials):
    """
    Connecte un utilisateur et retourne un token SEULEMENT si c'est un ADMIN.
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email, "password": credentials.password
        })
        user, session = response.user, response.session
        
        profile_response = supabase.table('profiles').select('is_admin').eq('id', user.id).single().execute()
        profile = profile_response.data

        if not profile or not profile.get('is_admin'):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access reserved for administrators.")

        return {"access_token": session.access_token, "token_type": "bearer"}
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign-in failed: Invalid credentials.")

@router.post("/signin/user", response_model=schema.SessionResponse)
def signin_user(credentials: schema.UserCredentials):
    """
    Connecte un utilisateur standard et retourne un token JWT.
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email, "password": credentials.password
        })
        return {"access_token": response.session.access_token, "token_type": "bearer"}
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign-in failed: Invalid credentials.")
    

@router.post("/request-password-reset")
async def request_password_reset(
    req: schema.PasswordResetRequest,
    http_request: Request
):
    """
    Déclenche l'envoi d'un e-mail de réinitialisation de mot de passe à l'utilisateur.
    """
    # L'URL de redirection doit être configurée dans vos templates d'email Supabase.
    # Par exemple : http://localhost:5173/reset-password
    try:
        supabase.auth.reset_password_for_email(
            email=req.email,
        )
        # Pour le développement, vous pouvez logger un message. 
        # En production, l'e-mail est envoyé par Supabase.
        print(f"Password reset email requested for: {req.email}")
        return {"message": "Si un compte avec cet e-mail existe, un lien de réinitialisation a été envoyé."}
    except Exception as e:
        # Ne révélez pas si l'email existe ou non pour des raisons de sécurité.
        print(f"Error during password reset request: {e}")
        return {"message": "Si un compte avec cet e-mail existe, un lien de réinitialisation a été envoyé."}


@router.post("/reset-password", dependencies=[Depends(get_current_user)])
def reset_password(
    req: schema.PasswordResetPayload,
    current_user: dict = Depends(get_current_user)
):
    """
    Met à jour le mot de passe de l'utilisateur.
    Cette route est protégée et ne fonctionne que si l'utilisateur a un token de session valide
    (obtenu en cliquant sur le lien de réinitialisation).
    """
    try:
        # Le `get_current_user` garantit que nous avons un utilisateur authentifié
        # via le token obtenu après avoir cliqué sur le lien de réinitialisation.
        supabase.auth.update_user({
            "password": req.password
        })
        return {"message": "Votre mot de passe a été mis à jour avec succès."}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to reset password: {e}")


