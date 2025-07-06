// src/app/generation/content.tsx
import { useState, useEffect } from "react";
import { CourseContent } from "@/components/course/course-content";
import { CourseNav } from "@/components/course/course-nav";
import { SupportChat } from "@/components/course/support-chat";
import { StreamingContent } from "@/components/course/StreamingContent";
import { HomeHeader } from "@/components/generation/HomeHeader";
import { useToast } from "@/hooks/use-toast";
import { useContentStreaming } from "@/hooks/useContentStreaming";

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
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [courseTitle, setCourseTitle] = useState(formation.title);
  // Injecter les quiz dans les modules pour l'affichage
  const [modules, setModules] = useState(injectQuizLessonsForAdmin(formation).modules);
  const [activeLesson, setActiveLesson] = useState<LessonData | null>(null);
  const { toast } = useToast();

  // Initialize streaming hook
  const streaming = useContentStreaming(token, apiUrl);

  // Function to refresh course data
  const refreshCourseData = async () => {
    if (!courseId || !token) return;

    try {
      const res = await fetch(`${apiUrl}/formations/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Impossible de récupérer la formation");

      const data = await res.json();
      const updatedFormation = injectQuizLessonsForAdmin(data);
      setModules(updatedFormation.modules);
      setCourseTitle(data.title);
      
      // Update active lesson if it exists in the refreshed data
      if (activeLesson) {
        const updatedLesson = updatedFormation.modules
          .flatMap(m => m.lessons)
          .find(l => l.id === activeLesson.id);
        if (updatedLesson) {
          setActiveLesson(updatedLesson);
        }
      }
    } catch (error: any) {
      console.error("Failed to refresh course data:", error);
      toast({
        variant: "destructive",
        title: "Erreur de mise à jour",
        description: "Impossible de récupérer les dernières données du cours",
      });
    }
  };

  // Start streaming if content generation is needed
  useEffect(() => {
    const hasEmptyLessons = modules.some(module => 
      module.lessons.some(lesson => !lesson.content || lesson.content.trim() === '')
    );

    // Start streaming only if there are empty lessons and streaming isn't already active
    if (hasEmptyLessons && !streaming.progress.isGenerating && !streaming.isConnected) {
      // Show toast to inform user
      toast({
        title: "Génération de contenu",
        description: "Démarrage de la génération automatique du contenu...",
      });
      
      // Start streaming with the formation structure
      streaming.startStreaming(formation);
    }
  }, [formation, modules, streaming, toast]);

  // Auto-refresh data when streaming completes
  useEffect(() => {
    if (streaming.progress.isCompleted) {
      toast({
        title: "✅ Génération terminée",
        description: "Tout le contenu du cours a été généré avec succès!",
      });
      
      // Refresh course data to get the updated content
      refreshCourseData();
    }
  }, [streaming.progress.isCompleted]);

  // Show progress messages and auto-switch to lesson being generated
  useEffect(() => {
    if (streaming.progress.currentLesson) {
      toast({
        title: "📚 Leçon générée",
        description: `${streaming.progress.currentLesson.title} (${streaming.progress.currentLesson.progress})`,
      });
      
      // Auto-switch to the lesson being generated if no lesson is currently active
      // or if a different lesson is being generated
      if (!activeLesson || activeLesson.id !== streaming.progress.currentLesson.id) {
        const currentLessonData = modules
          .flatMap(m => m.lessons)
          .find(l => l.id === streaming.progress.currentLesson?.id);
        
        if (currentLessonData) {
          setActiveLesson(currentLessonData);
        }
      }
    }
  }, [streaming.progress.currentLesson, activeLesson, modules, toast]);

  // Show errors
  useEffect(() => {
    if (streaming.progress.error) {
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: streaming.progress.error,
      });
    }
  }, [streaming.progress.error, toast]);

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
      <HomeHeader 
        title={courseTitle} 
        setTitle={setCourseTitle} 
        onSave={handleSave}
        isRefreshing={streaming.progress.isGenerating}
        onRefresh={refreshCourseData}
      />
      {/* Streaming Progress Bar */}
      {streaming.progress.isGenerating && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-blue-700 font-medium">
                Génération en cours...
              </span>
              {streaming.progress.currentLesson && (
                <span className="text-blue-600">
                  {streaming.progress.currentLesson.title}
                </span>
              )}
            </div>
            {streaming.progress.completedLessons !== undefined && streaming.progress.totalLessons && (
              <div className="text-blue-600">
                {streaming.progress.completedLessons}/{streaming.progress.totalLessons} leçons
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-hidden flex">
        <CourseNav
          modules={modules}
          activeLessonId={activeLesson?.id}
          onSelectLesson={setActiveLesson}
        />
        
        {/* Show streaming content if currently generating and lesson is selected */}
        {streaming.progress.isGenerating && activeLesson && 
         streaming.progress.currentLesson?.id === activeLesson.id ? (
          <StreamingContent
            content={streaming.progress.currentStreamingContent}
            currentLesson={streaming.progress.currentLesson}
            moduleTitle={activeLesson ? getModuleTitle(activeLesson.id) : ''}
            isStreaming={true}
          />
        ) : (
          <CourseContent
            // Fournir le contenu de la leçon active ou une chaîne vide
            content={activeLesson?.content || "<h1>Sélectionnez une leçon pour commencer.</h1>"}
            setContent={handleContentChange}
            currentLesson={activeLesson}
            moduleTitle={activeLesson ? getModuleTitle(activeLesson.id) : ''}
          />
        )}
        
        <SupportChat />
      </div>
    </div>
  );
}