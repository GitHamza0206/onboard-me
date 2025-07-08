// src/app/editor/page.tsx

//"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { TextEditor } from "@/components/editor/TextEditor";
import { EditableTitle } from "@/components/editor/EditableTitle";
import { TagsManager } from "@/components/editor/TagsManager";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";
import { CursorChat } from "@/components/editor/CursorChat";
import { FormationStructure } from "@/types/formation";

// Mock data simulating a full formation structure
const MOCK_FORMATION: FormationStructure = {
  title: "Titre de la Formation Complète",
  modules: [
    {
      id: "module_1",
      title: "Module 1: Introduction",
      lessons: [
        { id: "lesson_1", title: "Leçon 1.1", description: "Desc 1.1", content: "<p>Contenu de la leçon 1.1...</p>" },
        { id: "lesson_2", title: "Leçon 1.2", description: "Desc 1.2", content: "<p>Contenu de la leçon 1.2...</p>" },
      ]
    },
    {
      id: "module_2",
      title: "Module 2: Concepts Avancés",
      lessons: [
        { id: "lesson_3", title: "Leçon 2.1", description: "Desc 2.1", content: "<p>Contenu de la leçon 2.1...</p>" },
      ]
    }
  ]
};

export default function EditorPage() {
  const { id } = useParams(); // We'll use this later to select the active lesson
  const [formation, setFormation] = useState<FormationStructure | null>(null);
  const [activeLesson, setActiveLesson] = useState<{ moduleIndex: number; lessonIndex: number; } | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    // In a real app, you would fetch the full formation structure from your API
    // GET /api/formations/{id}
    if (id) {
      setFormation(MOCK_FORMATION);
      // For now, let's default to the first lesson of the first module
      setActiveLesson({ moduleIndex: 0, lessonIndex: 0 });
    }
  }, [id]);

  const handleSave = () => {
    if (!formation) return;
    console.log("--- Formation Sauvegardée ---");
    console.log("Données à sauvegarder:", formation);
    // Here you would call your API to save the entire formation structure
    // e.g., api.saveFormation(id, formation)
    
    toast({
        title: "✅ Formation Sauvegardée",
        description: "La structure de votre cours a été enregistrée."
    });
  };

  const handleAiUpdate = (newFormation: FormationStructure) => {
    setFormation(newFormation);
    toast({
      title: "📝 Changements Pris en Compte",
      description: "Les modifications de l'IA ont été appliquées localement. N'oubliez pas de sauvegarder.",
      variant: "default"
    });
  };

  const handleContentChange = (htmlContent: string) => {
    if (formation && activeLesson) {
      const newFormation = { ...formation };
      newFormation.modules[activeLesson.moduleIndex].lessons[activeLesson.lessonIndex].content = htmlContent;
      setFormation(newFormation);
    }
  };

  const currentLesson = formation && activeLesson ? formation.modules[activeLesson.moduleIndex].lessons[activeLesson.lessonIndex] : null;

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-auto">
          {formation && currentLesson ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              <EditableTitle initialTitle={currentLesson.title} onSave={(title) => { /* TODO: update title in state */ }} />
              {/* <TagsManager tags={currentLesson.tags} onSave={(tags) => {}} /> Tags might not be part of the new model */}
              <TextEditor
                content={currentLesson.content || ""}
                onSave={handleContentChange}
              />
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Chargement du contenu...</p>
          )}
        </div>
      </div>
      {id && formation && (
        <CursorChat 
          formationId={parseInt(id, 10)} 
          formation={formation}
          onFormationUpdate={handleAiUpdate}
        />
      )}
    </div>
  );
}