// 📄 front/src/components/course/course-content.tsx
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const features = [
  "How to navigate the platform efficiently",
  "Setting up your profile and preferences",
  "Using key features for maximum productivity",
  "Advanced tips and best practices",
];

const helpTopics = [
  "Ask questions about any topic",
  "Get clarification on features",
  "Request additional resources",
  "Connect with our support team",
];

interface CourseContentProps {
  className?: string;
}

export function CourseContent({ className }: CourseContentProps) {
  return (
    <div className={cn("flex-1 bg-gray-50/50", className)}>
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto p-8">
          <header>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Welcome to the Platform
            </h1>
          </header>

          <main className="mt-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-2xl">👋 Welcome aboard!</p>
              <p className="text-muted-foreground">
                We're excited to have you join our platform. This onboarding
                course will guide you through all the essential features and
                help you get the most out of your experience.
              </p>
            </div>

            <Separator className="my-10" />

            <section>
              <h2 className="text-xl font-semibold mb-4">What you'll learn</h2>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            <Separator className="my-10" />

            <section>
              <h2 className="text-xl font-semibold mb-4">Getting Help</h2>
              <p className="text-muted-foreground mb-4">
                Need assistance while going through the course? Use the chat
                panel on the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {helpTopics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </section>
          </main>
        </div>
      </ScrollArea>
       <footer className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t p-4 flex justify-between items-center">
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