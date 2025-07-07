import { useState } from "react";
import { useAuth } from "@/app/auth/authContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void; // Pour rafraîchir la liste
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const [email, setEmail] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [password, setPassword] = useState(""); // <-- Add state for password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        // Include password in the request body
        body: JSON.stringify({ email, prenom, nom, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to add user.");
      }

      toast({ title: "✅ Utilisateur ajouté", description: `Le compte pour ${email} a été créé.` });
      onUserAdded(); // Rafraîchit la liste des utilisateurs
      onClose(); // Ferme la modale
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset fields on close
  const handleClose = () => {
      setEmail("");
      setPrenom("");
      setNom("");
      setPassword("");
      setError(null);
      onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
          <DialogDescription>
             L'utilisateur sera créé directement avec le mot de passe fourni.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label htmlFor="prenom">Prénom</Label><Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="nom">Nom</Label><Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          {/* Add password input field */}
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
        </div>
         {error && <p className="text-sm text-red-500">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Ajout..." : "Ajouter l'utilisateur"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};