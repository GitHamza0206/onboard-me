// src/components/editor/FloatingMenuBar.tsx

import { BubbleMenu, FloatingMenu, Editor } from "@tiptap/react";
import React from 'react';
import { Bold, Italic, Strikethrough, Code, Eraser, Heading1, Heading2, List, ListOrdered } from "lucide-react";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingMenuBarProps {
  editor: Editor;
}

const commonButtonClasses = "h-8 w-8 p-0";

export const FloatingMenuBar: React.FC<FloatingMenuBarProps> = ({ editor }) => {
  if (!editor) return null;

  return (
    <>
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="flex items-center gap-1 p-1 bg-background border rounded-lg shadow-md"
      >
        <Button variant={editor.isActive('bold') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleBold().run()} className={commonButtonClasses}>
          <Bold size={16} />
        </Button>
        <Button variant={editor.isActive('italic') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleItalic().run()} className={commonButtonClasses}>
          <Italic size={16} />
        </Button>
        <Button variant={editor.isActive('strike') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleStrike().run()} className={commonButtonClasses}>
          <Strikethrough size={16} />
        </Button>
         <Button variant={editor.isActive('code') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleCode().run()} className={commonButtonClasses}>
          <Code size={16} />
        </Button>
      </BubbleMenu>

      <FloatingMenu
        editor={editor}
        tippyOptions={{ duration: 100 }}
        className="flex items-center gap-1 p-1 bg-background border rounded-lg shadow-md"
      >
        <Button variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cn(commonButtonClasses, "w-auto px-2")}>
            <Heading1 size={16} />
        </Button>
        <Button variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn(commonButtonClasses, "w-auto px-2")}>
            <Heading2 size={16} />
        </Button>
        <Button variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn(commonButtonClasses, "w-auto px-2")}>
            <List size={16} />
        </Button>
         <Button variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn(commonButtonClasses, "w-auto px-2")}>
            <ListOrdered size={16} />
        </Button>
      </FloatingMenu>
    </>
  );
};