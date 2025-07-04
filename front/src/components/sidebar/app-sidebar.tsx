import * as React from "react";
import { useState, useEffect } from "react";
import {
  AudioWaveform,
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
// import Logo from "@/assets/logo.svg";

// import apiFetch from "@/app/auth/apiFetch.tsx";
import { useNavigate } from "react-router-dom";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(true);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Exemple d'autres données statiques
  const data = {
    navMain: [
      {
        title: "Rechercher",
        url: "/search",
        icon: Search,
      },
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Campagnes",
        url: "/campagnes",
        icon: Send,
      },
      {
        title: "Prospects",
        url: "/prospects",
        icon: Users,
        // items: [
        //   { title: "Ajouter un prospect", url: "/prospects/add" },
        //   { title: "Gérer les prospects", url: "/prospects/manage" },
        // ],
      },
      // {
      //   title: "Suivi des campagnes",
      //   url: "/suivi",
      //   icon: BarChart3,
      //   items: [
      //     { title: "Statistiques", url: "/suivi/stats" },
      //     { title: "Résultats", url: "/suivi/results" },
      //   ],
      // },
    ],
    // La propriété "projects" sera remplie dynamiquement
    projects: projects,
  };

  console.log("projects", projects);

  // Récupération des projets depuis l'API lors du montage du composant
  // useEffect(() => {
  //   async function fetchProjects() {
  //     try {
  //       const response = await apiFetch(`${apiUrl}/campaigns/`, {
  //         headers: {
  //           "Accept": "application/json",
  //         },
  //       }, navigate);
  //       if (!response.ok) {
  //         throw new Error("Erreur lors de la récupération des projets");
  //       }
  //       const projectsData = await response.json();

  //       const mappedProjects: Project[] = projectsData
  //         .filter(
  //           (project: any) =>
  //             project &&
  //             typeof project.id === "number" &&
  //             typeof project.name === "string"
  //         ) // Basic validation
  //         .map((project: any) => ({
  //           id: project.id, // <-- Include the ID
  //           name: project.name,
  //           url: `/campagne/${project.id}`, // Dynamic URL based on ID
  //           icon: Frame, // Use the imported Frame icon component
  //         }));

  //       setProjects(mappedProjects);
  //     } catch (error: any) {
  //       console.error("Erreur de récupération des projets :", error.message);
  //       setProjects([]); // Vider les projets en cas d'erreur
  //     } finally {
  //       setLoadingProjects(false);
  //     }
  //   }
  //   fetchProjects();
  // }, [apiUrl]); // Dépendances : lancer si l'état d'auth ou le token change

  // const handleProjectDeleted = (deletedProjectId: number) => {
  //   setProjects((currentProjects) =>
  //     currentProjects.filter((project) => project.id !== deletedProjectId)
  //   );
  //   console.log(
  //     `Project with id ${deletedProjectId} removed from sidebar state.`
  //   );
  // };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <a href="/">
            <div className="flex flex-row items-center justify-center gap-2 m-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground p-2">
                {/* <img src={Logo} alt="Recrut'Auto" className="w-4 h-4" /> */}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Recrut'Auto</span>
              </div>
            </div>
          </a>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* {!loadingProjects && data.projects.length > 0 && (
          // <NavProjects
          //   projects={data.projects}
          //   onProjectDeleted={handleProjectDeleted}
          // />
        )} */}
        {loadingProjects && (
          <div className="p-4 text-xs text-muted-foreground">
            Chargement des projets...
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
