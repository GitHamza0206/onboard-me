// src/app/generation/page.tsx
"use client";

import { GenerationContent } from "@/components/generation/GenerationContent";
import { GenerationHeader } from "@/components/generation/GenerationHeader";

/**
 * Represents the main page for displaying a generated course.
 * It combines the header, sidebar, and content components into a cohesive layout.
 */
export function GenerationPage() {
  return (
    <div className="flex flex-col h-screen bg-muted/40">
      <GenerationHeader />
      <div className="flex flex-1 overflow-hidden">
        <GenerationContent />
      </div>
    </div>
  );
}
