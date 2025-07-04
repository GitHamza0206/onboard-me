// src/app/create/page.tsx
"use client";

import { useState } from "react";
import { Book, FileText, Map } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

type FormatOption = "Course" | "Guide" | "Roadmap";

export function CreatePage() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<FormatOption>("Course");
  const [wantsBetterCourse, setWantsBetterCourse] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = () => {
    console.log({ topic, format, wantsBetterCourse });
    if (topic.trim()) {
        navigate(`/generation/${encodeURIComponent(topic.trim())}`);
    } else {
        console.error("Topic cannot be empty");
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex items-center justify-center p-4 h-screen">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Create Your Custom Onboarding</h1>
            <p className="text-muted-foreground mt-2">
              Enter a topic below to generate a onboarding on it
            </p>
          </div>

          <div className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic-input" className="sr-only">
                What can I help you learn?
              </Label>
              <Input
                id="topic-input"
                type="text"
                placeholder="Enter a topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-11 text-base"
              />
            </div>


            {/* Additional Questions Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="better-course"
                checked={wantsBetterCourse}
                onCheckedChange={(checked) => setWantsBetterCourse(!!checked)}
              />
              <Label
                htmlFor="better-course"
                className="font-normal text-muted-foreground"
              >
                Answer the following questions for a better course
              </Label>
            </div>

            {/* Generate Button */}
            <Button
              size="lg"
              className="w-full h-11 text-base font-semibold"
              onClick={handleGenerate}
            >
              Generate
            </Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
