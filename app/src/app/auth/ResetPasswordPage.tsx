// src/app/auth/ResetPasswordPage.tsx
import { useState, useEffect } from "react";
import { useAuth } from "./authContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // Assurez-vous d'exporter le client supabase

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase va automatiquement gérer le token dans l'URL et créer une session.
    // Nous écoutons l'événement PASSWORD_RECOVERY pour confirmer que l'utilisateur
    // est bien arrivé via le lien de réinitialisation.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsAuthenticated(true);
        // Le token est maintenant géré par la librairie Supabase,
        // on peut donc appeler les fonctions protégées.
      } else if (session) {
          setIsAuthenticated(true);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await updatePassword(password);
      setMessage("Your password has been reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred while resetting the password.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Verifying reset link...</p>
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
             <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}