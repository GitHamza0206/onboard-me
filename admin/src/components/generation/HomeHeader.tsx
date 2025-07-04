// src/components/generation/HomeHeader.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { EditableTitle } from "../editor/EditableTitle";

interface HomeHeaderProps {
  title: string;
  setTitle: (title: string) => void;
}

export function HomeHeader({ title, setTitle }: HomeHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex-shrink-0 border-b bg-background px-4 py-1">
      <div className="relative flex items-center justify-between h-9">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="flex items-center text-muted-foreground hover:bg-transparent hover:text-accent-foreground"
          onClick={() => navigate("/")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          <span>Back to Home</span>
        </Button>

        {/* Centered Editable Title */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm">
          <EditableTitle
            text={title}
            setText={setTitle}
            className="text-center text-lg font-semibold !my-0"
          />
        </div>

        {/* Spacer to keep title perfectly centered */}
        <div />
      </div>
    </header>
  );
}