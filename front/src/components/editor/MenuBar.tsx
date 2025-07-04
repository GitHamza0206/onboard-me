// src/components/editor/MenuBar.tsx

import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Undo, Redo, Bold, Italic, Underline, Strikethrough, Code, List, ListOrdered, 
  Quote, Minus, Image as ImageIcon, Pilcrow, Type, Palette, AlignLeft, 
  AlignCenter, AlignRight, Table, ChevronDown, Highlighter, Eraser 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';

interface MenuBarProps {
  editor: Editor;
  onSave: () => void;
}

const commonButtonClasses = "h-8 px-2";
const iconSize = 16;

export const MenuBar: React.FC<MenuBarProps> = ({ editor, onSave }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
      {/* Undo/Redo */}
      <Button variant="ghost" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={commonButtonClasses}>
        <Undo size={iconSize} />
      </Button>
      <Button variant="ghost" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={commonButtonClasses}>
        <Redo size={iconSize} />
      </Button>
      <Separator orientation="vertical" className="h-6" />

      {/* Text Styles */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={commonButtonClasses}>
            <Type size={iconSize} /> <ChevronDown size={14} className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>Paragraphe</DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>Titre 1</DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Titre 2</DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>Titre 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="h-6" />

      {/* Formatting */}
      <Button variant={editor.isActive('bold') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleBold().run()} className={commonButtonClasses}>
        <Bold size={iconSize} />
      </Button>
      <Button variant={editor.isActive('italic') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleItalic().run()} className={commonButtonClasses}>
        <Italic size={iconSize} />
      </Button>
      <Button variant={editor.isActive('underline') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleUnderline().run()} className={commonButtonClasses}>
        <Underline size={iconSize} />
      </Button>
       <Button variant={editor.isActive('strike') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleStrike().run()} className={commonButtonClasses}>
        <Strikethrough size={iconSize} />
      </Button>
      <Button variant={editor.isActive('highlight') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleHighlight().run()} className={commonButtonClasses}>
        <Highlighter size={iconSize} />
      </Button>
      <div className="relative flex items-center">
         <Button variant="ghost" className={commonButtonClasses} onClick={() => editor.chain().focus().setColor((document.getElementById('colorPicker') as HTMLInputElement)?.value).run()}>
            <Palette size={iconSize}/>
         </Button>
        <input id="colorPicker" type="color" defaultValue="#000000" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} className="absolute w-full h-full opacity-0 cursor-pointer" />
      </div>
      
      <Button variant="ghost" onClick={() => editor.chain().focus().unsetAllMarks().run()} className={commonButtonClasses}>
        <Eraser size={iconSize} />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Alignment */}
      <Button variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().setTextAlign('left').run()} className={commonButtonClasses}>
        <AlignLeft size={iconSize} />
      </Button>
      <Button variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().setTextAlign('center').run()} className={commonButtonClasses}>
        <AlignCenter size={iconSize} />
      </Button>
      <Button variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().setTextAlign('right').run()} className={commonButtonClasses}>
        <AlignRight size={iconSize} />
      </Button>
      <Separator orientation="vertical" className="h-6" />

      {/* Block Elements */}
       <Button variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleBulletList().run()} className={commonButtonClasses}>
        <List size={iconSize} />
      </Button>
      <Button variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={commonButtonClasses}>
        <ListOrdered size={iconSize} />
      </Button>
       <Button variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={commonButtonClasses}>
        <Code size={iconSize} />
      </Button>
       <Button variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'} onClick={() => editor.chain().focus().toggleBlockquote().run()} className={commonButtonClasses}>
        <Quote size={iconSize} />
      </Button>
      <Button variant="ghost" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={commonButtonClasses}>
        <Minus size={iconSize} />
      </Button>
       <Button variant="ghost" onClick={addImage} className={commonButtonClasses}>
        <ImageIcon size={iconSize} />
      </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={commonButtonClasses}>
                    <Table size={iconSize} /> <ChevronDown size={14} className="ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Insérer un tableau</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>Ajouter colonne avant</DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>Ajouter colonne après</DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()} className="text-red-500">Supprimer colonne</DropdownMenuItem>
                 <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>Ajouter ligne avant</DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>Ajouter ligne après</DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()} className="text-red-500">Supprimer ligne</DropdownMenuItem>
                 <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => editor.chain().focus().mergeCells().run()}>Fusionner les cellules</DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().splitCell().run()}>Diviser la cellule</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()} className="text-red-500">Supprimer tableau</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

      {/* Save */}
      <div className="flex-grow" />
      <Button onClick={onSave} className="bg-green-500 hover:bg-green-600 text-white">
        Sauvegarder
      </Button>
    </div>
  );
};