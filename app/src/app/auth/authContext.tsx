// app/auth/authContext.tsx
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "@/api/auth"; // Assurez-vous que l'import est correct
import { supabase } from "@/lib/supabase";

// L'interface doit correspondre à la réponse de votre route /auth/me
interface UserProfile {
  id: string;
  prenom: string | null;
  nom: string | null;
  is_admin: boolean;
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchUserProfile = useCallback(async (currentToken: string): Promise<UserProfile | null> => {
    if (!currentToken) return null;
    try {
      // On appelle la route /auth/me du backend
      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: { "Authorization": `Bearer ${currentToken}` },
      });
      if (!response.ok) {
        throw new Error("Token invalide ou expiré");
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur fetchUserProfile:", error);
      localStorage.removeItem("token");
      return null;
    }
  }, [apiUrl]);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        const profile = await fetchUserProfile(token);
        setUser(profile);
      }
      setLoading(false);
    };
    checkAuth();
  }, [token, fetchUserProfile]);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    try {
      // On appelle la route /auth/signin du backend
      const response = await fetch(`${apiUrl}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "La connexion a échoué");
      }
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      const profile = await fetchUserProfile(data.access_token);
      setUser(profile);
      navigate("/courses");
    } catch (error) {
      console.error(error);
      // Gérer l'affichage de l'erreur à l'utilisateur
    } finally {
      setLoading(false);
    }
  }, [apiUrl, fetchUserProfile, navigate]);

 

  const signOut = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    navigate("/auth");
  }, [navigate]);

  const updatePassword = useCallback(async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
          throw error;
      }
      // Après la mise à jour, on déconnecte pour forcer une reconnexion
      await signOut();
  }, [signOut]);

  const value = { user, token, signIn, signOut, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
