// 📄 front/src/app/auth/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) { // Typer children
  const { user, loading } = useAuth(); // Récupérer user et loading

  // Afficher un indicateur de chargement pendant la vérification initiale
  if (loading) {
    // Vous pouvez mettre un spinner ou un composant de chargement plus élaboré ici
    return <p>Loading authentication...</p>;
  }

  // Si le chargement est terminé et qu'il n'y a pas d'utilisateur, rediriger vers la connexion
  if (!user) {
    return <Navigate to="/auth" replace />; // Ajouter replace pour une meilleure gestion de l'historique
  }

  // Si l'utilisateur est connecté, afficher le contenu protégé
  return children;
}