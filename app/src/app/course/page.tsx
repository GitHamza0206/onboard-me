// src/app/course/page.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/app/auth/authContext";
import { CourseContent } from "@/components/course/course-content";
import { CourseNav } from "@/components/course/course-nav";
import { SupportChat } from "@/components/course/support-chat";
import { getFormationWithProgression, FormationWithProgression, LessonData, ProgressionSummary } from "@/api/formations";
import { BackHeader } from "@/components/layout/BackHeader"; // Import du header

export function OnboardingPage() {
  // Get courseId from the URL and auth token
  const { courseId } = useParams<{ courseId: string }>();
  const { token } = useAuth();

  // State for loading, error handling, and course data
  const [formation, setFormation] = useState<FormationWithProgression | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progression, setProgression] = useState<ProgressionSummary | null>(null);

  // Helper function to get all lessons in order from accessible modules
  const getAllLessons = (): LessonData[] => {
    if (!formation) return [];
    return formation.modules.flatMap(module => module.lessons);
  };

  // Helper function to check if a lesson is accessible
  const isLessonAccessible = (lessonId: string): boolean => {
    if (!formation) return false;
    
    for (const module of formation.modules) {
      if (module.is_accessible !== false && module.lessons.some(lesson => lesson.id === lessonId)) {
        return true;
      }
    }
    return false;
  };

  // Navigation functions with progression control
  const navigateToNextLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(lesson => lesson.id === activeLesson?.id);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      if (isLessonAccessible(nextLesson.id)) {
        setActiveLesson(nextLesson);
      }
    }
  };

  const navigateToPreviousLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(lesson => lesson.id === activeLesson?.id);
    if (currentIndex > 0) {
      const previousLesson = allLessons[currentIndex - 1];
      if (isLessonAccessible(previousLesson.id)) {
        setActiveLesson(previousLesson);
      }
    }
  };

  const handleQuizComplete = async (passed: boolean) => {
    if (passed) {
      const updatedFormation = await refreshFormationData();
      
      if (updatedFormation) {
        navigateToNextLessonWithFormation(updatedFormation);
      }
    } 
  };

  // Function to refresh formation data (after quiz completion)
  const refreshFormationData = async () => {
    if (!token || !courseId) return null;
    
    try {
      const data = await getFormationWithProgression(token, courseId);
      setFormation(data);
      setProgression(data.progression);
      return data;
    } catch (err) {
      console.error('Error refreshing formation data:', err);
      return null;
    }
  };

  // Navigation function that uses provided formation data
  const navigateToNextLessonWithFormation = (formationData: FormationWithProgression) => {
    const allLessons = formationData.modules.flatMap(module => module.lessons);
    
    const currentIndex = allLessons.findIndex(lesson => lesson.id === activeLesson?.id);
    
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      
      // Vérifier si le module suivant est accessible dans les nouvelles données
      const isNextLessonAccessible = formationData.modules.some(module => 
        module.is_accessible !== false && module.lessons.some(lesson => lesson.id === nextLesson.id)
      );
      
      if (isNextLessonAccessible) {
        setActiveLesson(nextLesson);
      }
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!token || !courseId) {
        setError("Missing authentication token or course ID.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getFormationWithProgression(token, courseId);
        setFormation(data);
        setProgression(data.progression);

        // Automatically select the first lesson of the first accessible module as active
        if (data.modules.length > 0 && data.modules[0].lessons.length > 0) {
          setActiveLesson(data.modules[0].lessons[0]);
        } else {
          setActiveLesson(null); // No lessons available
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, token]);

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl">Loading course...</p>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }
  
  // Display a message if no course data could be loaded
  if (!formation) {
      return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl">Could not load the course data.</p>
      </div>
    );
  }

  // 👇 MODIFICATION: La structure de la page inclut maintenant le header
  return (
    <div className="flex h-screen w-full flex-col">
      <BackHeader />
      <main className="flex flex-1 min-h-0 w-full">
        {/* Course Navigation (Left) */}
        <CourseNav
          courseTitle={formation.title}
          modules={formation.modules}
          activeLessonId={activeLesson?.id}
          onSelectLesson={(lesson) => {
            if (isLessonAccessible(lesson.id)) {
              setActiveLesson(lesson);
            }
          }}
          progression={progression}
        />
        
        {/* Main Content (Center) */}
        <CourseContent
          lesson={activeLesson}
          onQuizComplete={handleQuizComplete}
          onNextLesson={navigateToNextLesson}
          onPreviousLesson={navigateToPreviousLesson}
          canNavigateNext={() => {
            const allLessons = getAllLessons();
            const currentIndex = allLessons.findIndex(lesson => lesson.id === activeLesson?.id);
            if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
              const nextLesson = allLessons[currentIndex + 1];
              return isLessonAccessible(nextLesson.id);
            }
            return false;
          }}
          canNavigatePrevious={() => {
            const allLessons = getAllLessons();
            const currentIndex = allLessons.findIndex(lesson => lesson.id === activeLesson?.id);
            if (currentIndex > 0) {
              const previousLesson = allLessons[currentIndex - 1];
              return isLessonAccessible(previousLesson.id);
            }
            return false;
          }}
        />

        {/* Support Chat (Right) */}
        <SupportChat />
      </main>
    </div>
  );
}