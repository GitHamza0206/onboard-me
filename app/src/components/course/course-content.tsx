// src/components/course/course-content.tsx
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { LessonData } from "@/api/formations";
import { QuizComponent } from "./quiz/QuizComponent";
import { generateSampleQuiz } from "./quiz/sampleQuizData";

interface CourseContentProps {
  className?: string;
  lesson: LessonData | null;
  onQuizComplete?: () => void;
  onNextLesson?: () => void;
  onPreviousLesson?: () => void;
}

export function CourseContent({ 
  className, 
  lesson, 
  onQuizComplete,
  onNextLesson,
  onPreviousLesson 
}: CourseContentProps) {
  return (
    <div className={cn("flex-1 bg-white", className)}>
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto p-8">
          {lesson ? (
            lesson.type === 'quiz' ? (
              // Render Quiz Component
              <div className="py-4">
                <QuizComponent
                  title={lesson.title}
                  questions={generateSampleQuiz(lesson.title).questions}
                  onComplete={() => {
                    console.log('Quiz completed for:', lesson.title);
                    if (onQuizComplete) {
                      onQuizComplete();
                    }
                    if (onNextLesson) {
                      onNextLesson();
                    }
                  }}
                  onRetry={() => {
                    console.log('Quiz retry for:', lesson.title);
                  }}
                />
              </div>
            ) : (
              // Render regular lesson content
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
                  {/* Render the HTML content from the lesson */}
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.content || "<p>This lesson has no content yet.</p>" }}
                  />
                </main>
              </>
            )
          ) : (
            // Display a placeholder if no lesson is selected
            <div className="text-center py-20">
              <h1 className="text-2xl font-semibold">Welcome!</h1>
              <p className="mt-4 text-muted-foreground">
                Select a lesson from the navigation on the left to get started.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      {/* Footer for lesson navigation - hidden during quiz */}
      {lesson && lesson.type !== 'quiz' && (
        <footer className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t p-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            disabled={!lesson}
            onClick={onPreviousLesson}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Lesson
          </Button>
          <Button 
            disabled={!lesson}
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