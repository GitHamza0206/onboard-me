import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/auth/authContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Formation {
    id: number;
    nom: string;
}

interface AssignFormationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    userName: string;
}

export const AssignFormationModal: React.FC<AssignFormationModalProps> = ({ isOpen, onClose, userId, userName }) => {
    const [formations, setFormations] = useState<Formation[]>([]);
    const [selectedFormationId, setSelectedFormationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth();
    const { toast } = useToast();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    useEffect(() => {
        if (!isOpen || !token) return;

        const fetchFormations = async () => {
            const response = await fetch(`${apiUrl}/formations/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFormations(data);
            }
        };

        fetchFormations();
    }, [isOpen, token, apiUrl]);

    const handleAssign = async () => {
        if (!userId || !selectedFormationId) {
            toast({ variant: "destructive", title: "Error", description: "Please select a formation." });
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/formations/assign`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ user_id: userId, formation_id: parseInt(selectedFormationId) }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to assign formation.");
            }

            toast({ title: "✅ Success", description: `Formation assigned to ${userName}.` });
            onClose();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Formation to {userName}</DialogTitle>
                    <DialogDescription>
                        Select a formation from the list to assign to this user.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedFormationId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a formation" />
                        </SelectTrigger>
                        <SelectContent>
                            {formations.map((f) => (
                                <SelectItem key={f.id} value={f.id.toString()}>
                                    {f.nom}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleAssign} disabled={isLoading || !selectedFormationId}>
                        {isLoading ? "Assigning..." : "Assign Formation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};