// 📄 front/src/components/course/course-content.tsx
import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// --- Imports pour l'éditeur Tiptap ---
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Dropcursor from '@tiptap/extension-dropcursor';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { lowlight } from 'lowlight'
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import { CodeBlockComponent } from "@/components/editor/CodeBlockComponent";
import { MenuBar } from "@/components/editor/MenuBar";
import { FloatingMenuBar } from "@/components/editor/FloatingMenuBar";

// --- Configuration de l'éditeur ---
lowlight.registerLanguage('html', html);
lowlight.registerLanguage('css', css);
lowlight.registerLanguage('js', js);
lowlight.registerLanguage('ts', ts);

const tiptapExtensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight,
  StarterKit.configure({
    bulletList: { keepMarks: true, keepAttributes: false },
    orderedList: { keepMarks: true, keepAttributes: false },
  }),
  CodeBlockLowlight
    .extend({
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent);
      },
    })
    .configure({ lowlight }),
  Underline,
  Image,
  Dropcursor,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];

// --- Interface et Composant ---
interface CourseContentProps {
  className?: string;
  content: string;
  setContent: (content: string) => void;
}

export function CourseContent({
  className,
  content,
  setContent,
}: CourseContentProps) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  // Synchroniser le contenu si la prop change (ex: navigation entre leçons)
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("flex-1 bg-white flex flex-col h-full", className)}>
      {/* Barre d'outils fixe (sans le bouton Sauvegarder) */}
      <div className="flex-shrink-0 border-b">
        <MenuBar editor={editor} onSave={() => { }} showSaveButton={false} />
      </div>

      {/* Contenu éditable avec défilement */}
      <ScrollArea className="flex-1 tiptap-editor">
        <div className="max-w-4xl mx-auto p-8">
          <FloatingMenuBar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </ScrollArea>

      {/* Pied de page fixe */}
      <footer className="flex-shrink-0 sticky bottom-0 bg-white/80 backdrop-blur-sm border-t p-4 flex justify-between items-center">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous Lesson
        </Button>
        <Button>
          Next Lesson
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}