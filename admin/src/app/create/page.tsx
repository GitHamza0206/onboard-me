// src/app/create/page.tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import {
  ErrorPayload,
  streamAgentResponse,
  StreamCallbacks,
  UpdatePayload,
  ValuesPayload,
} from "@/app/api/agent";

export function CreatePage() {
  const [topic, setTopic] = useState("");
  const [wantsBetterCourse, setWantsBetterCourse] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      console.error("Topic cannot be empty");
      return;
    }

    /**
     * These are the callback functions that will handle the data
     * as it streams from the backend.
     *
     * For now, we are simply logging the events to the console.
     * In a later step, we can use this data to update the UI in real-time.
     */
    const callbacks: StreamCallbacks = {
      onMessage: (token: string) => {
        console.log("SSE Message:", token);
      },
      onUpdate: (update: UpdatePayload) => {
        console.log("SSE Update:", update);
      },
      onValues: (values: ValuesPayload) => {
        console.log("SSE Values:", values);
      },
      onError: (error: ErrorPayload) => {
        console.error("SSE Error:", error);
      },
      onClose: () => {
        console.log("SSE Stream closed.");
        // Once the stream is finished, we navigate to the generation page.
        // This page would presumably show the final generated course.
        //navigate(`/generation/${encodeURIComponent(trimmedTopic)}`);
      },
    };

    console.log(`Requesting stream for topic: ${trimmedTopic}`);
    // We call the stream function. Note that this is an async function
    // that we don't await here. It runs in the background, and our
    // callbacks will handle the events as they arrive.
    streamAgentResponse(trimmedTopic, callbacks);

    // The navigation now happens in the `onClose` callback,
    // once the stream has finished. If we were to navigate immediately,
    // this component would unmount and the stream would be cancelled.
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
