// src/components/layout/Header.tsx

import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Importez votre logo
import AppLogo from "@/assets/logo.png";
import { useAuth } from "@/app/auth/authContext"

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

export function Header() {
  const { user, signOut, loading } = useAuth();

  // Génère les initiales de l'utilisateur pour l'AvatarFallback
  const fullName =  `${user.prenom || ''} ${user.nom || ''}`.trim();
  const userInitials = getInitials(fullName);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* === Côté gauche : Logo === */}
        <div className="flex items-center">
          <Link to="/home" className="flex items-center gap-2">
            <img src={AppLogo} alt="Logo de l'application" className="h-8 w-8" />
            <span className="hidden font-bold sm:inline-block">
              OnboardMe
            </span>
          </Link>
        </div>

        {/* === Côté droit : Menu Utilisateur === */}
        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  {/* Remplacez par une URL d'image de profil si disponible dans votre objet 'user' */}
                  <AvatarImage src="/placeholder-user.jpg" alt={fullName} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {fullName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}