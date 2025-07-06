// src/app/course/page.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/app/auth/authContext";
import { CourseContent } from "@/components/course/course-content";
import { CourseNav } from "@/components/course/course-nav";
import { SupportChat } from "@/components/course/support-chat";
import { getFormationDetails, FormationData, LessonData } from "@/api/formations";
import { BackHeader } from "@/components/layout/BackHeader"; // Import du header

export function OnboardingPage() {
  // Get courseId from the URL and auth token
  const { courseId } = useParams<{ courseId: string }>();
  const { token } = useAuth();

  // State for loading, error handling, and course data
  const [formation, setFormation] = useState<FormationData | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!token || !courseId) {
        setError("Missing authentication token or course ID.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getFormationDetails(token, courseId);
        setFormation(data);

        // Automatically select the first lesson of the first module as active
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
          onSelectLesson={setActiveLesson}
        />
        
        {/* Main Content (Center) */}
        <CourseContent
          lesson={activeLesson}
        />

        {/* Support Chat (Right) */}
        <SupportChat />
      </main>
    </div>
  );
}