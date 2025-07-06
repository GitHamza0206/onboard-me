// src/components/course/course-content.tsx

import React, { useEffect } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { LessonData } from "@/api/formations";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
import { CodeBlockComponent } from "../../../../admin/src/components/editor/CodeBlockComponent";

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
}

export function CourseContent({ className, lesson }: CourseContentProps) {
  const editor = useEditor({
    editable: false,
    extensions: tiptapExtensions,
    content: lesson?.content || "",
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none max-w-none',
      },
    },
  });

  useEffect(() => {
    if (!editor || !lesson) {
      editor?.commands.setContent("");
      return;
    }
    if (editor.getHTML() !== lesson.content) {
      editor.commands.setContent(lesson.content, false);
    }
  }, [lesson, editor]);

  return (
    // 1. THE PARENT CONTAINER
    // This div must be a vertical flex column that can shrink.
    <div className={cn("flex-1 flex flex-col min-h-0 overflow-hidden bg-white", className)}>

      {/* 2. THE SCROLLING CONTENT */}
      {/* This div grows to fill the space and adds a scrollbar when its content is too tall. */}
      <div className="flex-1 overflow-y-auto tiptap-editor">
        <div className="max-w-4xl mx-auto p-8">
          {lesson ? (
            <>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">{lesson.title}</h1>
              <p className="text-lg text-muted-foreground mb-8">{lesson.description}</p>
              <EditorContent editor={editor} />
            </>
          ) : (
            <div className="text-center py-20">
              <h1 className="text-2xl font-semibold">Bienvenue !</h1>
              <p className="mt-4 text-muted-foreground">
                Sélectionnez une leçon pour commencer.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. THE FOOTER */}
      {/* This footer has a fixed height and stays at the bottom. */}
      <footer className="flex-shrink-0 border-t p-4 flex justify-between items-center">
        <Button variant="outline" disabled={!lesson}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous Lesson
        </Button>
        <Button disabled={!lesson}>
          Next Lesson
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}