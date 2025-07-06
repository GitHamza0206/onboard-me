// src/app/generation/content.tsx
import { useState, useEffect } from "react";
import { CourseContent } from "@/components/course/course-content";
import { CourseNav } from "@/components/course/course-nav";
import { SupportChat } from "@/components/course/support-chat";
import { HomeHeader } from "@/components/generation/HomeHeader";
import { useToast } from "@/hooks/use-toast";

// Interfaces pour typer nos données
interface LessonData {
  id: string;
  title: string;
  description: string;
  content: string; // Le contenu HTML de la leçon
}

interface ModuleData {
  id: string;
  title: string;
  lessons: LessonData[];
}

interface FormationData {
  title: string;
  modules: ModuleData[];
}

interface OnboardingPageProps {
  formation: FormationData;
}

export function OnboardingPage({ formation }: OnboardingPageProps) {
  const [courseTitle, setCourseTitle] = useState(formation.title);
  const [modules, setModules] = useState(formation.modules);
  const [activeLesson, setActiveLesson] = useState<LessonData | null>(null);
  const { toast } = useToast();

  // Au chargement, sélectionner la première leçon du premier module
  useEffect(() => {
    if (modules.length > 0 && modules[0].lessons.length > 0) {
      setActiveLesson(modules[0].lessons[0]);
    }
  }, [modules]); // Se déclenche si les modules changent

  // Mettre à jour le contenu de la leçon active quand Tiptap l'édite
  const handleContentChange = (newContent: string) => {
    if (!activeLesson) return;

    setActiveLesson(prev => prev ? { ...prev, content: newContent } : null);

    // Mettre à jour l'état global des modules pour la sauvegarde éventuelle
    setModules(currentModules => 
      currentModules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => 
          lesson.id === activeLesson.id ? { ...lesson, content: newContent } : lesson
        )
      }))
    );
  };

  const handleSave = () => {
    // Ici, vous pourriez appeler une API pour sauvegarder les changements
    // sur `courseTitle` et `modules` (qui contient le contenu mis à jour).
    console.log("--- Sauvegarde de la formation ---");
    console.log("Titre:", courseTitle);
    console.log("Leçon active modifiée:", activeLesson);
    toast({
      title: "✅ Leçon Sauvegardée",
      description: "Vos modifications ont été enregistrées avec succès.",
    });
  };

  return (
    <div className="flex h-screen bg-white text-gray-800 flex-col">
      <HomeHeader title={courseTitle} setTitle={setCourseTitle} onSave={handleSave} />
      <div className="flex-1 overflow-hidden flex">
        <CourseNav 
          modules={modules}
          activeLessonId={activeLesson?.id}
          onSelectLesson={setActiveLesson}
        />
        <CourseContent
          // Fournir le contenu de la leçon active ou une chaîne vide
          content={activeLesson?.content || "<h1>Sélectionnez une leçon pour commencer.</h1>"}
          setContent={handleContentChange}
        />
        <SupportChat />
      </div>
    </div>
  );
}