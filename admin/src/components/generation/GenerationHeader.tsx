// src/components/generation/GenerationHeader.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, ChevronLeft } from "lucide-react";

/**
 * The header for the course generation page.
 * Displays a back button, the course title, lesson count, usage limit, and an upgrade button.
 */
export function GenerationHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col flex-shrink-0 border-b bg-background">
      {/* Section supérieure avec le bouton de retour */}
      <Button variant="ghost" className="flex items-center justify-start px-4 py-2 border-b text-muted-foreground"  onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

      {/* Section inférieure avec les informations du cours */}
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-xl font-semibold">Mastering Model Predictive Control (MPC)</h1>
          <p className="text-sm text-muted-foreground">7 modules • 35 lessons</p>
        </div>
        <div>
          <Button variant="outline" className="flex items-center" onClick={() => navigate("/courseGeneration/coucou")}>
            <Zap className="h-4 w-4 text-yellow-500" />
            Generate
          </Button>
        </div>

      </div>
    </header>
  );
}
