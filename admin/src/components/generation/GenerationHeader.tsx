// src/components/generation/GenerationHeader.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ChevronLeft } from "lucide-react";
import { useAuth } from "@/app/auth/authContext";
import { useParams } from "react-router-dom";

/**
 * The header for the course generation page.
 * Displays a back button, the course title, lesson count, usage limit, and an upgrade button.
 */
export function GenerationHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { courseId } = useParams();

  async function handleGenerateClick() {
  if (!token || !courseId) return;

  try {
    const res = await fetch(`http://localhost:8000/formations/${courseId}/structure`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Impossible de récupérer la structure");

    const structure = await res.json();

    const genRes = await fetch("http://localhost:8000/agent/content", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ structure }),
    });

    if (!genRes.ok) throw new Error("Erreur lors de la génération du contenu");
    alert("✅ Contenu généré !");
    // Optionnel : reload ou navigate
    window.location.reload();
  } catch (err: any) {
    alert("❌ " + err.message);
  }
}

  return (
    <header className="flex flex-col flex-shrink-0 border-b bg-background">
      {/* Section supérieure avec le bouton de retour */}
      <Button variant="ghost" className="flex items-center justify-start px-4 py-2 border-b text-muted-foreground" onClick={() => navigate(-1)}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      {/* Section inférieure avec les informations du cours */}
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-xl font-semibold">{title || "Course"}</h1>
          <p className="text-sm text-muted-foreground">7 modules • 35 lessons</p>
        </div>
        <div>
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handleGenerateClick}
          >
            <Zap className="h-4 w-4 text-yellow-500" />
            Generate
          </Button>
        </div>

      </div>
    </header>
  );
}
