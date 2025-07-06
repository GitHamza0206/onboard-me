// src/components/generation/HomeHeader.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, RefreshCw } from "lucide-react";
import { EditableTitle } from "../editor/EditableTitle";

interface HomeHeaderProps {
  title: string;
  setTitle: (title: string) => void;
  onSave: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function HomeHeader({ title, setTitle, onSave, isRefreshing, onRefresh }: HomeHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex-shrink-0 border-b bg-background px-4 py-2">
      <div className="relative flex items-center justify-between h-9">
        {/* Left Aligned Button */}
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

        {/* Right Aligned Buttons */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
          <Button variant="outline" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            <span>Save</span>
          </Button>
        </div>
      </div>
    </header>
  );
}