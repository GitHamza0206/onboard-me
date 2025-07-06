// 📄 front/src/components/course/course-content.tsx
import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AdminQuizViewer } from "@/components/quiz/AdminQuizViewer";
import { useQuiz } from "@/hooks/useQuiz";
import { isQuizLesson } from "@/utils/quizUtils";

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
  currentLesson?: {
    id: string;
    title: string;
    type?: 'lesson' | 'quiz';
    moduleId?: string;
  };
  moduleTitle?: string;
}

// Utility function to extract HTML from markdown code blocks
const extractHtmlFromMarkdown = (content: string): string => {
  // Check if content is wrapped in ```html code block
  const htmlBlockRegex = /^```html\s*\n([\s\S]*?)\n```$/;
  const match = content.match(htmlBlockRegex);
  
  if (match) {
    return match[1]; // Return the HTML content inside the code block
  }
  
  // Check for other variations like just ```\n<html>
  const codeBlockRegex = /^```\s*\n([\s\S]*?)\n```$/;
  const codeMatch = content.match(codeBlockRegex);
  
  if (codeMatch && codeMatch[1].trim().startsWith('<')) {
    return codeMatch[1]; // Return the HTML-like content
  }
  
  return content; // Return as-is if not wrapped in code block
};

// Check if lesson content is empty or just placeholder
const isContentEmpty = (content: string | null | undefined): boolean => {
  if (!content) return true;
  
  const trimmed = content.trim();
  if (!trimmed) return true;
  
  // Check for default placeholder content
  const placeholderPatterns = [
    /^<h1>Sélectionnez une leçon pour commencer\.?<\/h1>$/i,
    /^<p>.*?placeholder.*?<\/p>$/i,
    /^null$/i,
  ];
  
  return placeholderPatterns.some(pattern => pattern.test(trimmed));
};

export function CourseContent({
  className,
  content,
  setContent,
  currentLesson,
  moduleTitle,
}: CourseContentProps) {
  // Hook pour charger les quiz réels
  const { quiz, loading, error, hasQuiz } = useQuiz(
    currentLesson && isQuizLesson(currentLesson) ? currentLesson.moduleId : undefined,
    moduleTitle || ''
  );

  // Process content to extract HTML if it's wrapped in markdown
  const processedContent = content ? extractHtmlFromMarkdown(content) : '';
  const isEmpty = isContentEmpty(content);

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: processedContent,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  // Synchroniser le contenu si la prop change (ex: navigation entre leçons)
  useEffect(() => {
    if (editor && editor.getHTML() !== processedContent) {
      editor.commands.setContent(processedContent);
    }
  }, [processedContent, editor]);

  if (!editor) {
    return null;
  }

  // Vérifier si on affiche un quiz
  const isCurrentLessonQuiz = currentLesson && isQuizLesson(currentLesson);

  if (isCurrentLessonQuiz) {
    return (
      <div className={cn("flex-1 bg-gray-50 flex flex-col h-full", className)}>
        <ScrollArea className="flex-1">
          <div className="p-8">
            {loading ? (
              <div className="text-center py-8">
                <p>Chargement du quiz...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">Erreur lors du chargement du quiz: {error}</p>
              </div>
            ) : hasQuiz && quiz ? (
              <AdminQuizViewer quiz={quiz} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun quiz disponible pour ce module.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Le quiz sera généré automatiquement lors de la création de contenu via l'IA.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Show placeholder when content is empty
  if (isEmpty && currentLesson) {
    return (
      <div className={cn("flex-1 bg-white flex flex-col h-full", className)}>
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-8 text-center">
            <div className="py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentLesson.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {currentLesson.description}
              </p>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm">
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Contenu en cours de génération...
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Le contenu de cette leçon sera généré automatiquement et apparaîtra ici une fois prêt.
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
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