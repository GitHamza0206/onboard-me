// src/app/generation/content.tsx
import { useState, useEffect } from "react";
import { CourseContent } from "@/components/course/course-content";
import { CourseNav } from "@/components/course/course-nav";
import { SupportChat } from "@/components/course/support-chat";
import { HomeHeader } from "@/components/generation/HomeHeader";
import { useToast } from "@/hooks/use-toast";

import { useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { updateFormationContent } from "@/lib/api";
import { injectQuizLessonsForAdmin, filterQuizFromFormation } from "@/utils/quizUtils";

// Interfaces pour typer nos données
interface LessonData {
  id: string;
  title: string;
  description: string;
  content: string; // Le contenu HTML de la leçon
  type?: 'lesson' | 'quiz';
  moduleId?: string;
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
  const { courseId } = useParams(); // Obtenir l'ID du cours depuis l'URL
  const { token } = useAuth();

  const [courseTitle, setCourseTitle] = useState(formation.title);
  // Injecter les quiz dans les modules pour l'affichage
  const [modules, setModules] = useState(injectQuizLessonsForAdmin(formation).modules);
  const [activeLesson, setActiveLesson] = useState<LessonData | null>(null);
  const { toast } = useToast();

  // Fonction pour obtenir le titre du module d'une leçon
  const getModuleTitle = (lessonId: string): string => {
    for (const module of modules) {
      if (module.lessons.some(lesson => lesson.id === lessonId)) {
        return module.title;
      }
    }
    return '';
  };

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

  const handleSave = async () => {
    if (!token || !courseId) {
      toast({ variant: "destructive", title: "Erreur", description: "Non authentifié." });
      return;
    }

    // Filtrer les quiz avant la sauvegarde (on ne sauvegarde que les vraies leçons)
    const formationToSave = filterQuizFromFormation({
      title: courseTitle,
      modules: modules,
    });

    try {
      await updateFormationContent(token, courseId, formationToSave);
      toast({
        title: "✅ Formation Sauvegardée",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de sauvegarde",
        description: error.message,
      });
    }
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
          currentLesson={activeLesson}
          moduleTitle={activeLesson ? getModuleTitle(activeLesson.id) : ''}
        />
        <SupportChat />
      </div>
    </div>
  );
}