// src/app/editor/page.tsx

"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { TextEditor } from "@/components/editor/TextEditor";
import { EditableTitle } from "@/components/editor/EditableTitle";
import { TagsManager } from "@/components/editor/TagsManager";
import { useToast } from "@/hooks/use-toast";

// Simule la structure de votre objet TagRequest
interface TagRequest {
  tag: string;
  color?: string;
}

export function EditorPage() {
  const [title, setTitle] = useState("Mon Super Document");
  const [tags, setTags] = useState<TagRequest[]>([
    { tag: 'React' }, { tag: 'Tiptap' }
  ]);
  const [content, setContent] = useState(
    `<h2>Bonjour !</h2><p>Ceci est un exemple de contenu pour l'éditeur Tiptap adapté avec Tailwind CSS et shadcn/ui.</p><pre><code class="language-javascript">console.log("Hello, World!");</code></pre>`
  );

  const { toast } = useToast();

  const handleSave = (htmlContent: string) => {
    console.log("--- Contenu Sauvegardé ---");
    console.log("Titre:", title);
    console.log("Tags:", tags);
    console.log("Contenu HTML:", htmlContent);
    // Ici, vous appelleriez votre API pour sauvegarder les données.
    
    toast({
        title: "✅ Document Sauvegardé",
        description: "Vos modifications ont été enregistrées avec succès."
    })
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      <SidebarInset>
        <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <TagsManager tags={tags} setTags={setTags} />
                <EditableTitle text={title} setText={setTitle} placeholder="Titre de votre document..."/>
                <TextEditor 
                    initialContent={content}
                    onSave={handleSave}
                    onContentChange={setContent}
                />
            </div>
        </main>
      </SidebarInset>
    </div>
  );
}