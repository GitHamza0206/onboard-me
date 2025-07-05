// src/app/generation/page.tsx
"use client";

import { useParams } from "react-router-dom";
import { GenerationContent } from "@/components/generation/GenerationContent";
import { GenerationHeader } from "@/components/generation/GenerationHeader";
import { useState } from "react";

/**
 * Represents the main page for displaying a generated course.
 * It combines the header, sidebar, and content components into a cohesive layout.
 */
export function GenerationPage() {
  const { courseId } = useParams();
  const [title, setTitle] = useState("");
  return (
    <div className="flex flex-col h-screen bg-muted/40">
      <GenerationHeader title={title} />
      <div className="flex flex-1 overflow-hidden">
        {/* passe l’id + callback pour mettre à jour le titre */}
        <GenerationContent courseId={courseId!} onTitle={setTitle} />
      </div>
    </div>
  );
}
