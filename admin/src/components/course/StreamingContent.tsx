// src/components/course/StreamingContent.tsx
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface StreamingContentProps {
  className?: string;
  content: string;
  currentLesson?: {
    id: string;
    title: string;
    progress: string;
  };
  moduleTitle?: string;
  isStreaming: boolean;
}

// Utility function to extract HTML from markdown code blocks
const extractHtmlFromMarkdown = (content: string): string => {
  if (!content) return '';
  
  // Check if content is wrapped in ```html code block
  const htmlBlockRegex = /^```html\s*\n([\s\S]*?)(?:\n```)?$/;
  const match = content.match(htmlBlockRegex);
  
  if (match) {
    return match[1]; // Return the HTML content inside the code block
  }
  
  // Check for other variations like just ```\n<html>
  const codeBlockRegex = /^```\s*\n([\s\S]*?)(?:\n```)?$/;
  const codeMatch = content.match(codeBlockRegex);
  
  if (codeMatch && codeMatch[1].trim().startsWith('<')) {
    return codeMatch[1]; // Return the HTML-like content
  }
  
  return content; // Return as-is if not wrapped in code block
};

export function StreamingContent({
  className,
  content,
  currentLesson,
  moduleTitle,
  isStreaming,
}: StreamingContentProps) {
  const [displayContent, setDisplayContent] = useState('');

  // Process and update content when it changes
  useEffect(() => {
    if (content) {
      const processedContent = extractHtmlFromMarkdown(content);
      setDisplayContent(processedContent);
    } else {
      setDisplayContent('');
    }
  }, [content]);

  if (!currentLesson) {
    return (
      <div className={cn("flex-1 bg-white flex flex-col h-full", className)}>
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-8 text-center">
            <div className="py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sélectionnez une leçon
              </h3>
              <p className="text-gray-600">
                Choisissez une leçon dans la navigation pour voir son contenu
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 bg-white flex flex-col h-full", className)}>
      {/* Header with lesson info */}
      <div className="flex-shrink-0 border-b bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentLesson.title}
            </h2>
            {moduleTitle && (
              <p className="text-sm text-gray-600">
                {moduleTitle}
              </p>
            )}
          </div>
          {isStreaming && (
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-blue-700 font-medium">
                Génération en cours...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-8">
          {displayContent ? (
            <div 
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentLesson.title}
              </h3>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm">
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Contenu en cours de génération...
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Le contenu sera affiché ici en temps réel pendant la génération
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Streaming indicator at bottom */}
      {isStreaming && displayContent && (
        <div className="flex-shrink-0 border-t bg-blue-50 px-6 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-blue-700">
                Contenu généré en temps réel
              </span>
            </div>
            <span className="text-blue-600">
              {currentLesson.progress}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}