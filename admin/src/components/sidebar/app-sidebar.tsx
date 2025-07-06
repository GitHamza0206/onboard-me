import * as React from "react";
import { useState, useEffect } from "react";
import {
  Sparkles ,
  BarChart3,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  icons,
  LayoutDashboard,
  Map,
  PieChart,
  Search,
  Send,
  Settings2,
  SquareTerminal,
  Users,
  Plus, 
  FileText,
  BarChart,
  Settings,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarMenu } from "../ui/sidebar";
import Logo from "@/assets/logo.png";

// import apiFetch from "@/app/auth/apiFetch.tsx";
import { useNavigate } from "react-router-dom";
import { NavAdmin } from "./nav-admin";

interface Project {
  id: number;
  name: string;
  url: string;
  icon: React.ElementType; // Use ElementType for Lucide icons
}

// Fonction utilitaire pour générer un slug à partir du nom d'un projet
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // remplace les espaces par des tirets
    .replace(/[^\w\-]+/g, "") // supprime les caractères non alphanumériques
    .replace(/\-\-+/g, "-"); // remplace plusieurs tirets consécutifs par un seul
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Déclaration de l'état pour les projets
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Exemple d'autres données statiques
  const data = {
    navMain: [
      {
        title: "Create with AI",
        url: "/create",
        icon: Sparkles,
      },
      {
        title: "Trainings",
        url: "/courses",
        icon: BookOpen,
      },
      {
        title: "Documents",
        url: "/documents",
        icon: FileText ,
      },
    ],
    navAdmin: [
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart ,
      },
      {
        title: "Users",
        url: "/users",
        icon: Users,
      },
      {
        title: "Settings",
        url: "/settings ",
        icon: Settings ,
      },
    ],
  };


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <a href="/">
            <div className="flex flex-row items-center justify-center gap-2 m-2">
              <div className="flex aspect-square size-6 items-center justify-center rounded-lg text-sidebar-primary-foreground p-2">
                <img src={Logo} alt="Recrut'Auto" className="w-8 h-8" />
              </div>
              <div className="grid flex-1 text-left text-lm leading-tight">
                <span className="truncate font-semibold">OnboardMe</span>
              </div>
            </div>
          </a>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavAdmin items={data.navAdmin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
