// src/components/course/course-content.tsx

import React, { useEffect } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { LessonData } from "@/api/formations";
import { QuizComponent } from "./quiz/QuizComponent";
import { useQuiz } from "@/hooks/useQuiz";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Gardez tous vos imports et configurations Tiptap ici ---
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
import { lowlight } from 'lowlight/lib/core';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import { CodeBlockComponent } from "../editor/CodeBlockComponent";

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
  lesson: LessonData | null;
  onQuizComplete?: (passed: boolean) => void;
  onNextLesson?: () => void;
  onPreviousLesson?: () => void;
  canNavigateNext?: () => boolean;
  canNavigatePrevious?: () => boolean;
}

export function CourseContent({
  className,
  lesson,
  onQuizComplete,
  onNextLesson,
  onPreviousLesson,
  canNavigateNext = () => true,
  canNavigatePrevious = () => true
}: CourseContentProps) {
  // Hook pour charger les quiz réels
  const { quiz, quizId, loading, error, hasQuiz } = useQuiz(
    lesson?.type === 'quiz' ? lesson.moduleId : undefined
  );

  const editor = useEditor({
    editable: false,
    extensions: tiptapExtensions,
    content: lesson?.content || "",
    editorProps: {
      attributes: {
        class: 'focus:outline-none max-w-none',
      },
    },
  });

  useEffect(() => {
    if (!editor || !lesson || lesson.type === 'quiz') {
      return;
    }
    if (editor.getHTML() !== lesson.content) {
      editor.commands.setContent(lesson.content, false);
    }
  }, [lesson, editor]);

  return (
    <div className={cn("flex-1 flex flex-col min-h-0 overflow-hidden bg-white", className)}>
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-8 tiptap-editor">
          {lesson ? (
            lesson.type === 'quiz' ? (
              // Render Quiz Component
              <div className="py-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p>Chargement du quiz...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Erreur lors du chargement du quiz: {error}</p>
                  </div>
                ) : hasQuiz && quiz && quizId ? (
                  <QuizComponent
                    title={quiz.title}
                    questions={quiz.questions}
                    quizId={quizId}
                    onComplete={(passed: boolean) => {
                      if (onQuizComplete) {
                        onQuizComplete(passed);
                      }
                    }}
                    onRetry={() => {
                      // Recharger la page pour recommencer le quiz
                      window.location.reload();
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun quiz disponible pour ce module.</p>
                  </div>
                )}
              </div>
            ) : (
              // Render regular lesson content using Tiptap
              <>
                <header>
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                    {lesson.title}
                  </h1>
                  <p className="mt-2 text-lg text-muted-foreground">
                    {lesson.description}
                  </p>
                </header>
                <Separator className="my-8" />
                <main>
                  <EditorContent editor={editor} />
                </main>
              </>
            )
          ) : (
            // Display a placeholder if no lesson is selected
            <div className="text-center py-20">
              <h1 className="text-2xl font-semibold">Bienvenue !</h1>
              <p className="mt-4 text-muted-foreground">
                Sélectionnez une leçon pour commencer.
              </p>
            </div>
           )}
        </div>
      </ScrollArea>
      {/* Footer for lesson navigation - hidden during quiz */}
      {lesson && lesson.type !== 'quiz' && (
        <footer className="flex-shrink-0 border-t p-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            disabled={!lesson || !canNavigatePrevious()}
            onClick={onPreviousLesson}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Lesson
          </Button>
          <Button 
            disabled={!lesson || !canNavigateNext()}
            onClick={onNextLesson}
          >
            Next Lesson
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </footer>
      )}
    </div>
  );
}