// src/components/generation/GenerationHeader.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

/**
 * The header for the course generation page.
 * Displays a back button, the course title, lesson count, usage limit, and an upgrade button.
 */
export function BackHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col flex-shrink-0 border-b bg-background">
      {/* Section supérieure avec le bouton de retour */}
      <Button variant="ghost" className="flex items-center justify-start px-4 py-2 text-muted-foreground "  onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
    </header>
  );
}
