// src/components/generation/GenerationHeader.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ChevronLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/app/auth/authContext";

export function GenerationHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { courseId } = useParams();

  const [isGenerating, setIsGenerating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup sur démontage du composant
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const pollGenerationStatus = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    
    fetch(`${apiUrl}/formations/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.has_content === true) {
          console.log("Génération terminée, rechargement...");
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsGenerating(false);
          window.location.reload();
        } else {
          console.log("Génération en cours...");
        }
      })
      .catch(err => {
        console.error("Erreur de polling:", err);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsGenerating(false);
        alert("Une erreur est survenue lors de la vérification du statut.");
      });
  };

  async function handleGenerateClick() {
    if (!token || !courseId || isGenerating) return;

    // Nettoyer l'ancien interval s'il existe
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsGenerating(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      const structureRes = await fetch(`${apiUrl}/formations/${courseId}/structure`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!structureRes.ok) throw new Error("Impossible de récupérer la structure");
      const structure = await structureRes.json();

      const genRes = await fetch(`${apiUrl}/agent/content`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ structure }),
      });

      if (genRes.status !== 202) {
          const errorData = await genRes.json();
          throw new Error(errorData.detail || "La tâche de génération n'a pas pu être lancée.");
      }
      
      // Stocker la référence de l'interval
      intervalRef.current = setInterval(pollGenerationStatus, 5000);
      
    } catch (err: any) {
      alert("❌ " + err.message);
      setIsGenerating(false);
    }
  }

  return (
    // On utilise un fragment <> pour pouvoir retourner l'overlay au même niveau que le header
    <>
      {/* 👇 NOUVEL OVERLAY DE CHARGEMENT 👇 */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-8 shadow-2xl">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
                <p className="text-lg font-medium text-foreground">Génération du contenu en cours...</p>
                <p className="text-sm text-muted-foreground">Cette opération peut prendre plusieurs minutes. Veuillez ne pas fermer cette page.</p>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col flex-shrink-0 border-b bg-background">
        <Button variant="ghost" className="flex items-center justify-start px-4 py-2 border-b text-muted-foreground" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-semibold">{title || "Course"}</h1>
            <p className="text-sm text-muted-foreground">7 modules • 35 lessons</p>
          </div>
          <div>
            {/* Le bouton est maintenant juste désactivé, l'indicateur est l'overlay */}
            <Button
              variant="outline"
              className="flex items-center"
              onClick={handleGenerateClick}
              disabled={isGenerating}
            >
              <Zap className="mr-2 h-4 w-4 text-yellow-500" />
              Generate
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}