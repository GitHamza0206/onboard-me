// src/components/course/course-nav.tsx
import { useState, useEffect } from "react";
import { Circle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LessonData, ModuleData } from "@/api/formations";

interface CourseNavProps {
  className?: string;
  courseTitle: string;
  modules: ModuleData[];
  activeLessonId?: string | null;
  onSelectLesson: (lesson: LessonData) => void;
}

export function CourseNav({
  className,
  courseTitle,
  modules,
  activeLessonId,
  onSelectLesson,
}: CourseNavProps) {
  const [openModuleId, setOpenModuleId] = useState<string | undefined>();

  // Effect to automatically open the accordion for the active lesson's module
  useEffect(() => {
    if (activeLessonId) {
      const parentModule = modules.find((module) =>
        module.lessons.some((lesson) => lesson.id === activeLessonId)
      );
      if (parentModule) {
        setOpenModuleId(parentModule.id);
      }
    }
  }, [activeLessonId, modules]);

  return (
    <div className={cn("flex-shrink-0 w-72 border-r bg-gray-50/75", className)}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1 truncate">{courseTitle}</h2>
        <p className="text-sm text-muted-foreground">Course Content</p>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)] px-2">
        <div className="p-2">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={openModuleId}
            onValueChange={setOpenModuleId}
          >
            {modules.map((module) => (
              <AccordionItem value={module.id} key={module.id}>
                <AccordionTrigger className="text-sm font-semibold hover:no-underline p-2">
                  {module.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-4 mt-1 space-y-1">
                    {module.lessons.map((lesson) => {
                      const isQuiz = lesson.type === 'quiz';
                      return (
                        <li key={lesson.id}>
                          <button
                            onClick={() => onSelectLesson(lesson)}
                            className={cn(
                              "w-full text-left flex items-center gap-2 p-2 rounded-md text-sm",
                              lesson.id === activeLessonId
                                ? isQuiz 
                                  ? "bg-orange-50 text-orange-700 font-medium border border-orange-200"
                                  : "bg-primary/10 text-primary font-medium"
                                : isQuiz
                                  ? "text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                          >
                            {isQuiz ? (
                              <HelpCircle
                                className={cn(
                                  "w-3 h-3",
                                  lesson.id === activeLessonId
                                    ? "text-orange-700"
                                    : "text-orange-500"
                                )}
                              />
                            ) : (
                              <Circle
                                className={cn(
                                  "w-2 h-2",
                                  lesson.id === activeLessonId
                                    ? "text-primary"
                                    : "text-gray-400"
                                )}
                                fill="currentColor"
                              />
                            )}
                            <span className={isQuiz ? "font-medium" : ""}>
                              {lesson.title}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}