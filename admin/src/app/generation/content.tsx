// src/app/generation/content.tsx
import { useState } from "react";
import { CourseContent } from "@/components/course/course-content";
import { CourseNav } from "@/components/course/course-nav";
import { SupportChat } from "@/components/course/support-chat";
import { HomeHeader } from "@/components/generation/HomeHeader";
import { useToast } from "@/hooks/use-toast";

export function OnboardingPage() {
  const [title, setTitle] = useState("Welcome to the Platform");
  const [content, setContent] = useState(
    `<h1>👋 Welcome aboard!</h1><p>We're excited to have you join our platform. This onboarding course will guide you through all the essential features and help you get the most out of your experience.</p><h2>What you'll learn</h2><ul><li>How to navigate the platform efficiently</li><li>Setting up your profile and preferences</li><li>Using key features for maximum productivity</li><li>Advanced tips and best practices</li></ul>`
  );
  const { toast } = useToast();

  const handleSave = () => {
    console.log("--- Contenu Sauvegardé ---");
    console.log("Titre:", title);
    console.log("Contenu HTML:", content); // Le contenu est lu depuis l'état
    toast({
      title: "✅ Leçon Sauvegardée",
      description: "Vos modifications ont été enregistrées avec succès.",
    });
  };

  return (
    <div className="flex h-screen bg-white text-gray-800 flex-col">
      <HomeHeader title={title} setTitle={setTitle} onSave={handleSave} />
      <div className="flex-1 overflow-hidden flex">
        <CourseNav />
        <CourseContent
          content={content}
          setContent={setContent}
        />
        <SupportChat />
      </div>
    </div>
  );
}