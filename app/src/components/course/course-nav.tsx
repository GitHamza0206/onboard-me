// src/components/course/course-nav.tsx
import { useState, useEffect } from "react";
import { Circle, HelpCircle, Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LessonData, ModuleData, ProgressionSummary } from "@/api/formations";

interface CourseNavProps {
  className?: string;
  courseTitle: string;
  modules: ModuleData[];
  activeLessonId?: string | null;
  onSelectLesson: (lesson: LessonData) => void;
  progression?: ProgressionSummary | null;
}

export function CourseNav({
  className,
  courseTitle,
  modules,
  activeLessonId,
  onSelectLesson,
  progression,
}: CourseNavProps) {
  const [openModuleId, setOpenModuleId] = useState<string | undefined>();

  useEffect(() => {
    if (activeLessonId) {
      const parentModule = modules.find((module) =>
        module.lessons.some((lesson) => lesson.id === activeLessonId)
      );
      if (parentModule) {
        setOpenModuleId(parentModule.id);
      }
    } else if (modules.length > 0) {
      setOpenModuleId(modules[0].id);
    }
  }, [activeLessonId, modules]);

  return (
    // 👇 MODIFICATION 1 : Le conteneur principal devient flex et vertical
    <div className={cn("flex-shrink-0 w-72 border-r bg-gray-50/75 flex flex-col", className)}>
      <div className="p-4 flex-shrink-0">
        <h2 className="text-lg font-semibold mb-1 truncate">{courseTitle}</h2>
        <p className="text-sm text-muted-foreground">Course Content</p>
      </div>
      
      {/* 👇 MODIFICATION 2 : La ScrollArea prend l'espace restant et n'a plus de hauteur fixe */}
      <ScrollArea className="flex-1 px-2">
        <div className="p-2">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={openModuleId}
            onValueChange={setOpenModuleId}
          >
<<<<<<< HEAD
            {modules.map((module) => {
              const isModuleAccessible = module.is_accessible !== false;
              return (
                <AccordionItem value={module.id} key={module.id} className="border-b-0">
                  <AccordionTrigger 
                    className={cn(
                      "text-sm font-semibold hover:no-underline p-2 text-left flex items-center gap-2",
                      !isModuleAccessible && "text-gray-400"
                    )}
                    disabled={!isModuleAccessible}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {!isModuleAccessible && (
                        <Lock className="w-3 h-3 text-gray-400" />
                      )}
                      <span>{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="pl-4 mt-1 space-y-1">
                      {module.lessons.map((lesson) => {
                        const isQuiz = lesson.type === 'quiz';
                        const isLessonAccessible = isModuleAccessible;
                        
                        return (
                          <li key={lesson.id}>
                            <button
                              onClick={() => isLessonAccessible && onSelectLesson(lesson)}
                              disabled={!isLessonAccessible}
                              className={cn(
                                "w-full text-left flex items-center gap-2 p-2 rounded-md text-sm",
                                !isLessonAccessible && "cursor-not-allowed opacity-50",
                                isLessonAccessible && "cursor-pointer",
                                lesson.id === activeLessonId
                                  ? isQuiz 
                                    ? "bg-orange-50 text-orange-700 font-medium border border-orange-200"
                                    : "bg-primary/10 text-primary font-medium"
                                  : isLessonAccessible
                                    ? isQuiz
                                      ? "text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    : "text-gray-400"
                              )}
                            >
                              {!isLessonAccessible ? (
                                <Lock className="w-3 h-3 text-gray-400" />
                              ) : isQuiz ? (
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
                                    "w-2 h-2 shrink-0",
                                    lesson.id === activeLessonId
                                      ? "text-primary"
                                      : "text-gray-400"
                                  )}
                                  fill="currentColor"
                                />
                              )}
                              <span className={cn(
                                isQuiz ? "font-medium" : "",
                                !isLessonAccessible && "text-gray-400"
                              )}>
                                {lesson.title}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
>>>>>>> feat/generate_quizz
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}