// 📄 front/src/app/auth/authContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from "react"; // Ajouter useCallback
import { useNavigate } from "react-router-dom";

// Interface pour décrire la structure de l'objet utilisateur (basée sur UserInDB du backend)
interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  registration_date: string; // ou Date si vous la parsez
  subscription_type: string;
  // Ajoutez d'autres champs si nécessaire depuis UserInDB
}

// Interface pour le contexte
interface AuthContextType {
  user: UserProfile | null;
  token: string | null; // Gardons le token accessible aussi
  login: (token: string) => Promise<void>; // Rendre login asynchrone
  logout: () => void;
  loading: boolean; // Ajouter un état de chargement
}

// Donner un type plus précis au contexte créé
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) { // Typer children
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token")); // Gérer le token séparément
  const [loading, setLoading] = useState<boolean>(true); // Initialiser à true
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const extensionId = import.meta.env.VITE_CHROME_EXTENSION_ID || "hpabpplocejflbbidmillajegdfjinhd";

  // Fonction pour envoyer le token à l'extension Chrome
  const sendTokenToExtension = useCallback((jwt: string | null) => {
    if (!jwt) return;
    if (typeof chrome !== "undefined" && chrome.runtime) {
      console.log("🚀 Tentative d'envoi du JWT à l'extension...");
      chrome.runtime.sendMessage(
        extensionId,
        { action: "storeJwt", jwt: jwt },
        (response) => {
          console.log("Réponse reçue de l'extension :", response);
          if (chrome.runtime.lastError) {
            console.warn("⚠️ Impossible de contacter l'extension :", chrome.runtime.lastError.message);
          } else if (response?.status === "success") {
            console.log("✅ JWT stocké avec succès dans l'extension !");
          }
        }
      );
    } else {
      console.log("❌ API Chrome non disponible, stockage local uniquement.");
    }
  }, [extensionId]);


  // Fonction pour récupérer le profil utilisateur
  const fetchUserProfile = useCallback(async (currentToken: string): Promise<UserProfile | null> => {
    if (!currentToken) return null;
    try {
      const response = await fetch(`${apiUrl}/myprofile/`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${currentToken}`,
        },
      });
      if (!response.ok) {
        // Si le token est invalide (401 Unauthorized par exemple), déconnecter
        if (response.status === 401) {
            console.warn("Token invalide ou expiré lors de la récupération du profil.");
            return null; // Indique que le profil n'a pas pu être récupéré
        }
        throw new Error(`Erreur ${response.status} lors de la récupération du profil`);
      }
      const profileData: UserProfile = await response.json();
      return profileData;
    } catch (error) {
      console.error("Erreur fetchUserProfile:", error);
      return null; // Retourne null en cas d'erreur réseau ou autre
    }
  }, [apiUrl]); // Dépendances de useCallback

  // Effet pour vérifier le token au montage et récupérer le profil
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const profile = await fetchUserProfile(storedToken);
        if (profile) {
          setUser(profile);
          setToken(storedToken); // Mettre à jour l'état du token
          sendTokenToExtension(storedToken); // Envoyer à l'extension si valide
        } else {
          // Si le profil n'a pas pu être récupéré (token invalide/expiré)
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        }
      } else {
          setUser(null);
          setToken(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, [fetchUserProfile, sendTokenToExtension]); 


  // Fonction de connexion mise à jour
  const login = useCallback(async (newToken: string) => {
    setLoading(true);
    localStorage.setItem("token", newToken);
    setToken(newToken); // Mettre à jour l'état du token

    const profile = await fetchUserProfile(newToken);

    if (profile) {
      setUser(profile); // Mettre à jour l'état user avec le profil complet
      sendTokenToExtension(newToken); // Envoyer à l'extension après succès
       navigate("/check-extension");
    } else {
      console.error("Impossible de récupérer le profil après la connexion.");
      localStorage.removeItem("token"); // Nettoyer
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, [fetchUserProfile, navigate, sendTokenToExtension]); // Ajouter sendTokenToExtension


  // Fonction de déconnexion
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null); // Vider l'état du token
    navigate("/auth"); // Rediriger vers la page de connexion
    setLoading(false); // Assurer que loading est false après logout
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // sendTokenToExtension retiré si non utilisé pour le logout


  // Fournir la valeur au contexte
  const contextValue = {
    user,
    token, // Fournir aussi le token
    login,
    logout,
    loading, // Fournir l'état de chargement
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}