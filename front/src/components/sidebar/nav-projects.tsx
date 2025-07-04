// 📄 front/src/components/sidebar/nav-projects.tsx
//  --- Content of nav-projects.tsx ---
import React, {useState} from "react"; // Import useState
import {Folder, type LucideIcon, MoreHorizontal, Trash2,} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {useToast} from "@/hooks/use-toast";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import apiFetch from "@/app/auth/apiFetch.tsx";
import { useNavigate } from "react-router-dom";

// Define the Project type matching the one in app-sidebar.tsx
interface Project {
    id: number;
    name: string;
    url: string;
    icon: LucideIcon;
}

export function NavProjects({
                                projects,
                                onProjectDeleted,
                            }: {
    projects: Project[];
    onProjectDeleted: (id: number) => void;
}) {
    const {isMobile} = useSidebar();
    const apiUrl = import.meta.env.VITE_API_URL;
    const {toast} = useToast();
    const navigate = useNavigate();

    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const handleDeleteProject = async (projectId: number, projectName: string) => {
        if (!projectToDelete || projectToDelete.id !== projectId) return; // Safety check

        console.log(`Confirmed deletion for project ID: ${projectId}`);

        try {
            const response = await apiFetch(`${apiUrl}/campaigns/${projectId}`, {
                method: 'DELETE',
            }, navigate);

            if (response.ok) {
                console.log(`Successfully deleted project ${projectId}. API response status: ${response.status}`);
                onProjectDeleted(projectId); // Update parent state
                toast({ // Success toast
                    title: "Campagne Supprimée",
                    description: `La campagne "${projectName}" a été supprimée avec succès.`,
                });
            } else {
                console.error(`Failed to delete project ${projectId}. Status: ${response.status}`);
                const errorData = await response.json().catch(() => ({detail: 'Unknown error structure'}));
                toast({ // Error toast
                    variant: "destructive",
                    title: "Erreur de Suppression",
                    description: `Échec: ${errorData.detail || response.statusText}`,
                });
            }
        } catch (error) {
            console.error(`Error deleting project ${projectId}:`, error);
            let errorMessage = "Une erreur inattendue est survenue.";

            toast({ // Error toast
                variant: "destructive",
                title: "Erreur de Suppression",
                description: errorMessage,
            });
        } finally {
            setProjectToDelete(null);
        }
    };


    return (
        <>
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                <SidebarGroupLabel>Campagnes</SidebarGroupLabel>
                <SidebarMenu>
                    {projects.map((item) => (
                        <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton asChild>
                                <a href={item.url}>
                                    <item.icon size={16}/>
                                    <span>{item.name}</span>
                                </a>
                            </SidebarMenuButton>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuAction showOnHover>
                                        <MoreHorizontal size={16}/>
                                        <span className="sr-only">Options pour {item.name}</span>
                                    </SidebarMenuAction>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-48 rounded-lg"
                                    side={isMobile ? "bottom" : "right"}
                                    align={isMobile ? "end" : "start"}
                                >
                                    <DropdownMenuItem asChild>
                                        <a href={item.url}>
                                            <Folder className="text-muted-foreground mr-2" size={16}/>
                                            <span>Voir la Campagne</span>
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault(); // Prevent menu closing immediately
                                            setProjectToDelete(item); // Set state to open dialog for this item
                                        }}
                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                    >
                                        <Trash2 className="text-destructive mr-2" size={16}/>
                                        <span>Supprimer</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    ))}
                    {projects.length > 0 && (
                        <SidebarMenuItem>
                            <a href={"/campagnes"} className="flex items-center gap-2">
                                <SidebarMenuButton className="text-sidebar-foreground/70">
                                    <MoreHorizontal className="text-sidebar-foreground/70" size={16}/>
                                    <span>More</span>
                                </SidebarMenuButton>
                            </a>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroup>

            <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la Suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la campagne "{projectToDelete?.name}" ?
                            Cette action est irréversible et supprimera toutes les données associées à cette campagne.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setProjectToDelete(null)}>
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (projectToDelete) {
                                    handleDeleteProject(projectToDelete.id, projectToDelete.name);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90" // Destructive styling
                        >
                            Supprimer Définitivement
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}