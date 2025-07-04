// src/components/editor/EditableTitle.tsx

import React, { FC, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TitleProps {
  text: string;
  setText: (text: string) => void;
  placeholder?: string;
}

export const EditableTitle: FC<TitleProps> = ({ text, setText, placeholder = "Mon Titre" }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Synchronise le contenu de l'élément avec l'état externe si nécessaire
  useEffect(() => {
    if (titleRef.current && titleRef.current.innerText !== text) {
      titleRef.current.innerText = text;
    }
  }, [text]);

  const handleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    setText(e.currentTarget.innerText);
  };

  return (
    <h1
      ref={titleRef}
      contentEditable
      data-placeholder={placeholder}
      onInput={handleInput}
      suppressContentEditableWarning={true}
      className={cn(
        "text-4xl font-bold tracking-tight text-gray-900",
        "w-full min-h-[48px] bg-transparent border-none outline-none cursor-text my-5",
        "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
      )}
    />
  );
};