// src/app/users/page.tsx
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MoreHorizontal, Pencil, Rocket, Trash2, User } from "lucide-react";

type User = {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    onboardingStatus: "Terminé" | "En cours" | "En attente";
    registrationDate: string;
    lastActivity: string;
    progress: number;
};

const users: User[] = [
    {
        id: "usr_001",
        fullName: "Alice Dubois",
        email: "alice.dubois@example.com",
        avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        onboardingStatus: "Terminé",
        registrationDate: "15/06/2024",
        lastActivity: "Il y a 2 heures",
        progress: 100,
    },
    {
        id: "usr_002",
        fullName: "Bob Martin",
        email: "bob.martin@example.com",
        avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
        onboardingStatus: "En cours",
        registrationDate: "22/06/2024",
        lastActivity: "Il y a 1 jour",
        progress: 60,
    },
    {
        id: "usr_003",
        fullName: "Carole Leroy",
        email: "carole.leroy@example.com",
        avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
        onboardingStatus: "En attente",
        registrationDate: "01/07/2024",
        lastActivity: "Jamais",
        progress: 0,
    },
    {
        id: "usr_004",
        fullName: "David Petit",
        email: "david.petit@example.com",
        onboardingStatus: "En cours",
        registrationDate: "18/06/2024",
        lastActivity: "Il y a 5 heures",
        progress: 25,
    },
];

const getStatusBadgeVariant = (
    status: User["onboardingStatus"]
): "default" | "secondary" | "destructive" => {
    switch (status) {
        case "Terminé":
            return "default";
        case "En cours":
            return "secondary";
        case "En attente":
            return "destructive";
        default:
            return "secondary";
    }
};

const getInitials = (name: string) => {
    const names = name.split(" ");
    return names
        .map((n) => n[0])
        .join("")
        .toUpperCase();
};

export function UsersPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main className="flex-1 p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
                        <Button>Ajouter un utilisateur</Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Nom complet</TableHead>
                                    <TableHead>Statut d'onboarding</TableHead>
                                    <TableHead>Progression (%)</TableHead>
                                    <TableHead>Date d'inscription</TableHead>
                                    <TableHead>Dernière activité</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatarUrl} />
                                                    <AvatarFallback>
                                                        {getInitials(user.fullName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(user.onboardingStatus)}>
                                                {user.onboardingStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={user.progress} className="w-24" />
                                                <span className="text-muted-foreground text-sm">
                                                    {user.progress}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.registrationDate}</TableCell>
                                        <TableCell>{user.lastActivity}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <User className="mr-2 h-4 w-4" />
                                                        Voir le profil
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Éditer
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Rocket className="mr-2 h-4 w-4" />
                                                        Relancer l'onboarding
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Désactiver
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}