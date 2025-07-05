// 📄 front/src/app/register/page.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Link } from "react-router-dom";
import { registerUser } from "@/api/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  // --- États mis à jour ---
  const [firstName, setFirstName] = useState(""); // Nouveau
  const [lastName, setLastName] = useState("");   // Nouveau
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // --- Corps de la requête mis à jour ---
    const requestBody = {
      first_name: firstName, // Correspond au schéma UserCreate
      last_name: lastName,   // Correspond au schéma UserCreate
      email,
      password,
    };

    try {
      await registerUser(requestBody);

      setSuccessMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/auth");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh)]">
      <div className={cn("flex flex-col gap-6 w-full max-w-md p-4")}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>
              Create a new account by filling out the form below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* --- Champs du formulaire mis à jour --- */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4"> {/* Met Prénom et Nom sur la même ligne */}
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="John"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Doe"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

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
                    placeholder="••••••••" // Ajout placeholder pour mot de passe
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
                    placeholder="••••••••" // Ajout placeholder pour mot de passe
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

                <Button type="submit" className="w-full mt-2">
                  Register
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/auth" className="underline">
                Login here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}