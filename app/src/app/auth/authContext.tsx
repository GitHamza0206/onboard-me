// 📄 front/src/app/auth/authContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from "react"; // Ajouter useCallback
import { useNavigate } from "react-router-dom";
import {
  fetchUserProfile as fetchUserProfileApi,
  signoutUser,
} from "@/api/auth";

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

  

  // Effet pour vérifier le token au montage et récupérer le profil
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const profile = await fetchUserProfileApi(storedToken);
          setUser(profile);
          setToken(storedToken);
          sendTokenToExtension(storedToken);
        } catch (error) {
          console.warn("Failed to fetch profile with stored token.", error);
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
  }, [sendTokenToExtension]); 


  
  const login = useCallback(async (newToken: string) => {
      setLoading(true);
      localStorage.setItem("token", newToken);
      setToken(newToken);

      try {
        const profile = await fetchUserProfileApi(newToken);
        setUser(profile);
        sendTokenToExtension(newToken);
        navigate("/dashboard");
      } catch (error) {
          console.error("Impossible de récupérer le profil après la connexion.", error);
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
      }
      setLoading(false);
  }, [navigate, sendTokenToExtension]);

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      await signoutUser();
    } catch (error) {
      console.error("Signout failed on the server, clearing local session.", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      sendTokenToExtension(null);
      navigate("/auth", { replace: true });
    }
  }, [navigate, sendTokenToExtension]);


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