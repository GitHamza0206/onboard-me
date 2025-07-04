// 📄 front/src/app/auth/page.tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../auth/authContext";
import { Link } from "react-router-dom"; // <-- Importer Link

export function AuthPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // Type explicite pour error
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { // Type explicite pour event
    event.preventDefault();
    setError(null);

    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", email);
    formData.append("password", password);
    formData.append("scope", "");
    formData.append("client_id", "string");
    formData.append("client_secret", "string");

    try {
      const response = await fetch(`${apiUrl}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
         // Utiliser data.detail s'il existe, sinon un message générique
        throw new Error(data.detail || "Login failed");
      }

      login(data.access_token);
    } catch (err: any) { // Type explicite pour err
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh)]">
      <div className={cn("flex flex-col gap-6 w-full max-w-md p-4")}> {/* Consistance du style */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4"> {/* Consistance du style */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full mt-2"> {/* Consistance du style */}
                  Login
                </Button>
              </div>
            </form>
            {/* --- Début de l'ajout --- */}
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="underline">
                Register here
              </Link>
            </div>
             {/* --- Fin de l'ajout --- */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}