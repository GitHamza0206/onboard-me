// 📄 front/src/components/course/course-content.tsx
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TextEditor } from "@/components/editor/TextEditor";

interface CourseContentProps {
  className?: string;
  content: string;
  setContent: (content: string) => void;
  onSave: (htmlContent: string) => void;
}

export function CourseContent({
  className,
  content,
  setContent,
  onSave,
}: CourseContentProps) {
  return (
    <div className={cn("flex-1 bg-gray-50/50 flex flex-col", className)}>
      <ScrollArea className="flex-1">
        <div className="mx-auto">
          <TextEditor
            initialContent={content}
            onSave={onSave}
            onContentChange={setContent}
          />
        </div>
      </ScrollArea>
      <footer className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t p-4 flex justify-between items-center">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous Lesson
        </Button>
        <Button>
          Next Lesson
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}