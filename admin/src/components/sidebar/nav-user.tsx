// src/components/nav-user.tsx
"use client"

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
// import { logout } from "@/app/auth/authService";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
// import apiFetch from "@/app/auth/apiFetch.tsx";
// import { useUser } from "@/app/auth/UserContext"; // Import du contexte utilisateur

// Fonction utilitaire pour obtenir les initiales
const getInitials = (name: string): string => {
    if (!name) return "?";

    const words = name.split(' ').filter(Boolean);

    if (words.length === 0) return "?";

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    } else {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
};

export function NavUser() {
    const { isMobile } = useSidebar()
    const navigate = useNavigate();

    // Utiliser le contexte utilisateur au lieu de l'état local
    // const { user, loading } = useUser();

    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const apiUrl = import.meta.env.VITE_API_URL;

    // if (loading || !user) return <SidebarMenu />;

    // // Construit le nom complet pour l'affichage
    // const fullName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
    // const userInitials = getInitials(fullName);
    const fullName = "thomas gossin"; // Placeholder for user initials, replace with actual logic
    const userInitials = getInitials(fullName);
    // const handleOpenBillingPortal = async () => {
    //     try {
    //         setIsLoading(true)

    //         let response = await apiFetch(`${apiUrl}/stripe/billing`, {
    //             method: "GET",
    //             headers: {
    //                 Accept: "application/json"
    //             },
    //         }, navigate)

    //         if (!response.ok) {
    //             throw new Error("Une erreur est survenue lors de la création du portail.");
    //         }

    //         const data = await response.json()
    //         window.location.href = data.url;
    //     } catch (err: any) {
    //         console.error("Erreur lors de la création du portail Stripe", err);
    //         alert("Une erreur est survenue. Veuillez réessayer plus tard.");
    //         setError(err.message)
    //     } finally {
    //         setIsLoading(false)
    //     }
    // };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={"user.avatar"} alt={fullName} />
                                <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{fullName}</span>
                                <span className="truncate text-xs">{"user.email"}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={"user.avatar"} alt={fullName} />
                                    <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{fullName}</span>
                                    <span className="truncate text-xs">{"user.email"}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {/* <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles size={16} />
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator /> */}
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => navigate("/account")}>
                                <BadgeCheck size={16} />
                                Account
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem  disabled={isLoading}>
                                <CreditCard size={16} />
                                Billing
                            </DropdownMenuItem> */}
                            <DropdownMenuItem onClick={() => navigate("/notifications")}>
                                <Bell size={16} />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {}}>
                            <LogOut size={16} />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}