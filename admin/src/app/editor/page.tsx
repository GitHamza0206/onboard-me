// src/app/editor/page.tsx

//"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { TextEditor } from "@/components/editor/TextEditor";
import { EditableTitle } from "@/components/editor/EditableTitle";
import { TagsManager } from "@/components/editor/TagsManager";
import { useToast } from "@/hooks/use-toast";
import { SimbaContent } from "@/types/document";
import { useParams } from "react-router-dom";
import { CursorChat } from "@/components/editor/CursorChat";

// Simule la structure de votre objet TagRequest
interface TagRequest {
  tag: string;
  color?: string;
}

export default function EditorPage() {
  const { id } = useParams();
  const [content, setContent] = useState<SimbaContent | null>(null);

  const { toast } = useToast();

  const handleSave = (data: Partial<SimbaContent>) => {
    console.log("--- Contenu Sauvegardé ---");
    console.log("Données à sauvegarder:", data);
    // Ici, vous appelleriez votre API pour sauvegarder les données.
    
    toast({
        title: "✅ Document Sauvegardé",
        description: "Vos modifications ont été enregistrées avec succès."
    })
  };

  const handleSaveContent = (htmlContent: string) => {
    handleSave({ content: htmlContent });
  };

  useEffect(() => {
    // Fetch content based on id
    // Example: fetch(`/api/content/${id}`).then(res => res.json()).then(setContent);
    // For now, we'll simulate a load to avoid a blank screen
    if(id) {
        setContent({
            id: parseInt(id, 10),
            title: "Titre du Cours Chargé",
            tags: [{ tag: 'Example' }],
            content: "<p>Contenu du cours chargé...</p>"
        });
    }
  }, [id]);

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-auto">
          {content ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              <EditableTitle initialTitle={content.title} onSave={(title) => handleSave({ title })} />
              <TagsManager tags={content.tags} onSave={(tags) => handleSave({ tags })} />
              <TextEditor
                content={content.content}
                onSave={handleSaveContent}
              />
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Loading content...</p>
          )}
        </div>
      </div>
      {id && <CursorChat formationId={parseInt(id, 10)} />}
    </div>
  );
}