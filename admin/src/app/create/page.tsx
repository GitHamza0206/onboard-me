// src/app/create/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { Send, Bot, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ErrorPayload,
  streamAgentResponse,
  StreamCallbacks,
  UpdatePayload,
  ValuesPayload,
} from "@/app/api/agent";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export function CreatePage() {
  const [topic, setTopic] = useState("");
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { id: uuidv4(), sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsStreaming(true);

    const aiMessageId = uuidv4();
    // Add a placeholder for the AI response
    setMessages((prev) => [...prev, { id: aiMessageId, sender: "ai", text: "" }]);

    const callbacks: StreamCallbacks = {
      onMessage: (token: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, text: msg.text + token } : msg
          )
        );
      },
      onUpdate: (update: UpdatePayload) => {
        console.log("SSE Update:", update);
      },
      onValues: (values: ValuesPayload) => {
        console.log("SSE Values:", values);
      },
      onError: (error: ErrorPayload) => {
        console.error("SSE Error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, text: `Error: ${error.message}` }
              : msg
          )
        );
        setIsStreaming(false);
      },
      onClose: () => {
        console.log("SSE Stream closed.");
        setIsStreaming(false);
      },
    };

    console.log(`Requesting stream for: ${text}`);
    streamAgentResponse(text, callbacks);
  };

  const handleGenerate = () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      console.error("Topic cannot be empty");
      return;
    }
    setIsChatVisible(true);
    sendMessage(trimmedTopic);
    setTopic("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen p-4 bg-background">
        <AnimatePresence>
          {!isChatVisible ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center flex-1"
            >
              <div className="w-full max-w-2xl space-y-8">
                <div className="text-center">
                  <h1 className="text-4xl font-bold">
                    Create Your Custom Onboarding
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Enter a topic below to generate a onboarding on it
                  </p>
                </div>
                <div className="space-y-6">
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
                      onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                      className="h-11 text-base"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="w-full h-11 text-base font-semibold"
                    onClick={handleGenerate}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col flex-1 w-full max-w-4xl mx-auto overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-start gap-4",
                      message.sender === "user" && "justify-end"
                    )}
                  >
                    {message.sender === "ai" && (
                      <Avatar>
                        <AvatarFallback>
                          <Bot />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-3 max-w-lg",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text || "..."}</p>
                    </div>
                    {message.sender === "user" && (
                      <Avatar>
                        <AvatarFallback>
                          <User />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="p-4 bg-background border-t">
                <form
                  onSubmit={handleFormSubmit}
                  className="flex items-center gap-4"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isStreaming}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim() || isStreaming}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarInset>
    </SidebarProvider>
  );
}
