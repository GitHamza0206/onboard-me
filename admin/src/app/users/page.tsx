import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/auth/authContext";
import { AddUserModal } from "@/components/admin/AddUserModal";
import { UserDetailsDrawer } from "@/components/admin/UserDetailsDrawer";

import {
    Avatar, AvatarFallback, AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type User = {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    onboardingStatus: "Terminé" | "En cours" | "En attente";
    registrationDate: string;
    lastActivity: string;
    progress: number;
    prenom?: string;
    nom?: string;
};

const getStatusBadgeVariant = (status: User["onboardingStatus"]): "default" | "secondary" | "destructive" => {
    switch (status) {
        case "Terminé": return "default";
        case "En cours": return "secondary";
        case "En attente": return "destructive";
        default: return "secondary";
    }
};

const getInitials = (name: string) => {
    const names = name.split(" ");
    return names.map((n) => n[0]).join("").toUpperCase();
};

export function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);

    // State for the details drawer
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    const { token } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const fetchUsers = useCallback(async () => {
        if (!token) {
            console.log("No token available, skipping user fetch");
            setIsLoading(false);
            setHasError(false);
            return;
        }
        
        setIsLoading(true);
        setHasError(false);
        try {
            const response = await fetch(`${apiUrl}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    console.error("Token expired or invalid, redirecting to auth");
                    // Le contexte d'auth devrait gérer ça automatiquement
                    return;
                }
                throw new Error("Failed to fetch users");
            }
            const data = await response.json();
            console.log("--- FRONTEND: Received users data:", data);
            const formattedUsers = data.map((u: any) => ({
                ...u,
                fullName: `${u.prenom || ''} ${u.nom || ''}`.trim(),
            }));
            console.log("--- FRONTEND: Formatted users:", formattedUsers);
            setUsers(formattedUsers);
            setHasError(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setHasError(true);
            // En cas d'erreur de connexion, on garde les utilisateurs vides
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setIsDrawerOpen(true);
    };

    const handleUserDeleted = () => {
        fetchUsers(); // Refresh the list after a user is deleted
    };
    
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main className="flex-1 p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <Button onClick={() => setAddUserModalOpen(true)}>Add User</Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                 <TableRow>
                                    <TableHead className="w-[300px]">Full Name</TableHead>
                                    <TableHead>Onboarding Status</TableHead>
                                    <TableHead>Progress (%)</TableHead>
                                    <TableHead>Registration Date</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        {!token ? "Authentification requise" : hasError ? (
                                            <div className="space-y-2">
                                                <p>Server connection error</p>
                                                <Button variant="outline" size="sm" onClick={fetchUsers}>
                                                Retry
                                                </Button>
                                            </div>
                                        ) : "Aucun utilisateur trouvé"}
                                    </TableCell></TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} onClick={() => handleUserClick(user)} className="cursor-pointer">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={user.avatarUrl} />
                                                        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.fullName}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant={getStatusBadgeVariant(user.onboardingStatus)}>{user.onboardingStatus}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={user.progress} className="w-24" />
                                                    <span className="text-muted-foreground text-sm">{user.progress}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.registrationDate}</TableCell>
                                            <TableCell>{user.lastActivity}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </main>
            </SidebarInset>
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setAddUserModalOpen(false)}
                onUserAdded={fetchUsers}
            />
            {/* Render the new Drawer */}
            <UserDetailsDrawer
                user={selectedUser}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onUserDeleted={handleUserDeleted}
            />
        </SidebarProvider>
    );
}