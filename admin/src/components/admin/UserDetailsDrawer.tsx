import { useState, useEffect } from 'react';
// 1. Import Sheet components instead of Drawer components
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, Trash2, PlusCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '@/app/auth/authContext';
import { useToast } from "@/hooks/use-toast";
import { AssignFormationModal } from './AssignFormationModal';

// Define types for clarity
interface User {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    prenom?: string;
    nom?: string;
}

interface Formation {
    id: number;
    nom: string;
}

interface ProgressDetails {
    progress_percentage: number;
    status: string;
    total_formations: number;
    total_quizzes: number;
    completed_quizzes: number;
    formations: {
        id: number;
        nom: string;
        total_quizzes: number;
        completed_quizzes: number;
        progress_percentage: number;
    }[];
}

interface UserDetailsDrawerProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onUserDeleted: () => void; // Callback to refresh the user list
}

const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.map((n) => n[0]).join("").toUpperCase();
};

export const UserDetailsDrawer = ({ user, isOpen, onClose, onUserDeleted }: UserDetailsDrawerProps) => {
    const { token } = useAuth();
    const { toast } = useToast();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const [assignedFormations, setAssignedFormations] = useState<Formation[]>([]);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [progressDetails, setProgressDetails] = useState<ProgressDetails | null>(null);

    const fetchAssignedFormations = async () => {
        if (!user || !token) return;
        try {
            const response = await fetch(`${apiUrl}/admin/users/${user.id}/formations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch user's formations.");
            const data = await response.json();
            setAssignedFormations(data);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    const fetchProgressDetails = async () => {
        if (!user || !token) return;
        try {
            const response = await fetch(`${apiUrl}/admin/users/${user.id}/progress`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch user's progress.");
            const data = await response.json();
            setProgressDetails(data);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    useEffect(() => {
        if (isOpen && user) {
            fetchAssignedFormations();
            fetchProgressDetails();
        }
    }, [isOpen, user]);

    const handleRemoveFormation = async (formationId: number) => {
        if (!user) return;
        try {
            const response = await fetch(`${apiUrl}/admin/users/${user.id}/formations/${formationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to remove formation.");
            toast({ title: "✅ Success", description: "Formation has been unassigned." });
            fetchAssignedFormations(); // Refresh the list
            fetchProgressDetails(); // Refresh progress details
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    const handleDeleteUser = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${apiUrl}/admin/users/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to delete user.");
            toast({ title: "✅ Success", description: `${user.fullName} has been deleted.` });
            onUserDeleted(); // Trigger refresh on the main page
            onClose(); // Close the drawer
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    }

    if (!user) return null;

    return (
        <>
            {/* 2. Use Sheet instead of Drawer */}
            <Sheet open={isOpen} onOpenChange={onClose}>
                {/* 3. Add side="right" to position the panel */}
                <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
                    <SheetHeader className="p-6 text-left border-b">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <SheetTitle className="text-2xl">{user.fullName}</SheetTitle>
                                <SheetDescription>{user.email}</SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="flex-grow p-6 overflow-y-auto">
                        {/* Section Progression */}
                        <div className="mb-6">
                            <h3 className="mb-4 font-semibold text-lg flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5" />
                                Quiz Progress
                            </h3>
                            {progressDetails ? (
                                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Overall Progress</span>
                                        <Badge variant={progressDetails.status === "Terminé" ? "default" : progressDetails.status === "En cours" ? "secondary" : "destructive"}>
                                            {progressDetails.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={progressDetails.progress_percentage} className="flex-1" />
                                        <span className="text-sm text-muted-foreground">{progressDetails.progress_percentage}%</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-muted-foreground">Formations</div>
                                            <div className="font-medium">{progressDetails.total_formations}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground">Quizzes</div>
                                            <div className="font-medium">{progressDetails.completed_quizzes}/{progressDetails.total_quizzes}</div>
                                        </div>
                                    </div>
                                    {progressDetails.formations.length > 0 && (
                                        <div className="mt-4">
                                            <div className="text-sm font-medium mb-2">By Formation:</div>
                                            <div className="space-y-2">
                                                {progressDetails.formations.map(formation => (
                                                    <div key={formation.id} className="flex items-center justify-between text-xs">
                                                        <span className="truncate max-w-[150px]">{formation.nom}</span>
                                                        <span className="text-muted-foreground">{formation.completed_quizzes}/{formation.total_quizzes} ({formation.progress_percentage}%)</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Loading progress details...</p>
                                </div>
                            )}
                        </div>

                        <h3 className="mb-4 font-semibold text-lg">Assigned Formations</h3>
                        <div className="space-y-2">
                            {assignedFormations.length > 0 ? (
                                assignedFormations.map(formation => (
                                    <div key={formation.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <span className="text-sm font-medium">{formation.nom}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFormation(formation.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No formations assigned.</p>
                            )}
                        </div>
                         <Button variant="outline" className="w-full mt-4" onClick={() => setAssignModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Assign New Formation
                        </Button>
                    </div>

                    <SheetFooter className="p-6 border-t">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">Delete User</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete {user.fullName}'s account and all of their associated data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteUser}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <AssignFormationModal 
                isOpen={isAssignModalOpen}
                onClose={() => {
                    setAssignModalOpen(false);
                    fetchAssignedFormations(); // Refresh list after closing assign modal
                    fetchProgressDetails(); // Refresh progress details after closing assign modal
                }}
                userId={user.id}
                userName={user.fullName}
            />
        </>
    );
};