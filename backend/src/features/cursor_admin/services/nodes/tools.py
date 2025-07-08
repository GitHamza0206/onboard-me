from src.supabase_client import supabase
from uuid import UUID
from typing import List, Dict, Any

def get_user_formations(user_id: str) -> List[Dict[str, Any]]:
    """
    Récupère toutes les formations assignées à un utilisateur spécifique.

    Args:
        user_id (str): L'UUID de l'utilisateur sous forme de chaîne.

    Returns:
        List[Dict[str, Any]]: Une liste de dictionnaires, où chaque dictionnaire 
                               représente une formation assignée.
                               Retourne une liste vide si aucune formation n'est trouvée 
                               ou en cas d'erreur.
    """
    try:
        # 1. Récupérer les IDs des formations assignées depuis la table `user_formations`
        user_formations_response = (
            supabase.table("user_formations")
            .select("formation_id")
            .eq("user_id", user_id)
            .execute()
        )

        if not user_formations_response.data:
            return []

        # Extraire les IDs de formation de la réponse
        formation_ids = [
            item["formation_id"] for item in user_formations_response.data
        ]

        # 2. Récupérer les détails des formations correspondantes depuis la table `formations`
        formations_response = (
            supabase.table("formations")
            .select("id, nom")
            .in_("id", formation_ids)
            .execute()
        )

        return formations_response.data

    except Exception as e:
        # En cas d'erreur (par exemple, problème de connexion à la base de données),
        # afficher l'erreur et retourner une liste vide.
        print(f"Erreur lors de la récupération des formations de l'utilisateur: {e}")
        return []
