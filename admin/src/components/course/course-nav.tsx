// 📄 front/src/components/course/course-nav.tsx

// 👇 1. Importer useState et useEffect
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Circle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { isQuizLesson } from "@/utils/quizUtils";

// Interfaces (étendues pour les quiz)
interface LessonData { 
  id: string; 
  title: string; 
  description: string; // Required description field to match content.tsx interface
  type?: 'lesson' | 'quiz';
  content: string; // Required content field to match other interfaces
}
interface ModuleData { id: string; title: string; lessons: LessonData[]; }

interface CourseNavProps {
  className?: string;
  modules: ModuleData[];
  activeLessonId?: string | null;
  onSelectLesson: (lesson: LessonData) => void;
}

// Utility function to check if lesson content is empty or loading
const isLessonContentEmpty = (content: string): boolean => {
  if (!content) return true;
  
  const trimmed = content.trim();
  if (!trimmed) return true;
  
  // Check for placeholder content
  const placeholderPatterns = [
    /^<h1>Sélectionnez une leçon pour commencer\.?<\/h1>$/i,
    /^<p>.*?placeholder.*?<\/p>$/i,
    /^null$/i,
  ];
  
  return placeholderPatterns.some(pattern => pattern.test(trimmed));
};
 
export function CourseNav({ className, modules, activeLessonId, onSelectLesson }: CourseNavProps) {
  
  // 👇 2. Ajouter un état pour contrôler l'élément ouvert de l'accordéon
  const [openModuleId, setOpenModuleId] = useState<string | undefined>();

  // 👇 3. Utiliser useEffect pour synchroniser l'accordéon avec la leçon active
  useEffect(() => {
    // Si une leçon est active, on cherche son module parent
    if (activeLessonId) {
      const parentModule = modules.find(module => 
        module.lessons.some(lesson => lesson.id === activeLessonId)
      );
      // Si on trouve le module parent, on définit son ID comme étant celui qui doit être ouvert
      if (parentModule) {
        setOpenModuleId(parentModule.id);
      }
    }
  }, [activeLessonId, modules]); // Ce code s'exécute quand la leçon active change

  return (
    <div className={cn("flex-shrink-0 w-64 border-r", className)}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1">Contenu du cours</h2>
        <p className="text-sm text-muted-foreground">Platform Onboarding</p>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)] px-2">
        <div className="p-2">
          {/* 👇 4. Lier l'état au composant Accordion */}
          <Accordion 
            type="single" 
            collapsible 
            className="w-full"
            value={openModuleId}
            onValueChange={setOpenModuleId}
          >
            {modules.map((module) => (
              <AccordionItem value={module.id} key={module.id}>
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  {module.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-4 mt-1 space-y-1">
                    {module.lessons.map((lesson) => {
                      const isQuiz = isQuizLesson(lesson);
                      const isEmpty = isLessonContentEmpty(lesson.content);
                      const isLoading = !isQuiz && isEmpty;
                      
                      return (
                        <li key={lesson.id}>
                          <button
                            onClick={() => onSelectLesson(lesson)}
                            className={cn(
                              "w-full text-left flex items-center gap-2 p-2 rounded-md text-sm relative",
                              lesson.id === activeLessonId
                                ? isQuiz 
                                  ? "bg-orange-50 text-orange-700 font-medium border border-orange-200"
                                  : isLoading
                                    ? "bg-amber-50 text-amber-700 font-medium border border-amber-200"
                                    : "bg-primary/10 text-primary font-medium"
                                : isQuiz
                                  ? "text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                  : isLoading
                                    ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
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
                            ) : isLoading ? (
                              <svg
                                className={cn(
                                  "w-3 h-3 animate-spin",
                                  lesson.id === activeLessonId
                                    ? "text-amber-700"
                                    : "text-amber-500"
                                )}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                            ) : (
                              <Circle
                                className={cn("w-2 h-2", lesson.id === activeLessonId ? "text-primary" : "text-green-500")}
                                fill="currentColor"
                              />
                            )}
                            <span className={cn(
                              isQuiz || isLoading ? "font-medium" : "",
                              isLoading ? "italic" : ""
                            )}>
                              {lesson.title}
                            </span>
                            {isLoading && (
                              <span className="text-xs text-amber-600 ml-auto">
                                Génération...
                              </span>
                            )}
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