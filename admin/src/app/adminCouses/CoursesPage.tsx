// src/pages/admin/CoursesPage.tsx
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/admin/CourseCard";
import { RecentActivityList } from "@/components/admin/RecentActivityList";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth/authContext";
import { useNavigate } from "react-router-dom";

interface Formation {
  id: number;
  nom: string;
  has_content: boolean;
  updated_at?: string;
  cover_url?: string;
}

export function CoursesPage() {
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [courses, setCourses] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${apiUrl}/formations/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Impossible de récupérer les formations");
        return res.json();
      })
      .then(setCourses)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [apiUrl, token]);

  useEffect(() => {
    console.log("Courses loaded:", courses);
  }, [courses]);

  const placeholder =
    "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Courses</h1>
            <Button onClick={() => navigate("/create")}>Create New Course</Button>
          </div>

          {/* onglets de filtre éventuels … */}

          {loading ? (
            <p className="text-muted-foreground">Chargement…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(c => (
                <CourseCard
                  key={c.id}
                  title={c.nom}
                  lastUpdated={
                    c.updated_at ? new Date(c.updated_at).toLocaleDateString() : ""
                  }
                  imageUrl={c.cover_url || placeholder}
                  onClick={() => navigate(`/generation/${c.id}`)}
                />
              ))}
            </div>
          )}

          {/* <RecentActivityList /> */}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}