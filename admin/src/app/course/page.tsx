// 📄 front/src/app/course/page.tsx
import { CourseContent } from "@/components/course/course-content";
import { CourseNav } from "@/components/course/course-nav";
import { SupportChat } from "@/components/course/support-chat";

export function OnboardingPage() {
  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Colonne de navigation (gauche) */}
      <CourseNav />
      
      {/* Contenu principal (centre) */}
      <CourseContent />

      {/* Colonne de chat (droite) */}
      <SupportChat />
    </div>
  );
}