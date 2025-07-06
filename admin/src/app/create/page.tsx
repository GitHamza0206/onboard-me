// src/app/create/page.tsx
"use client";

import { useState, useEffect, useRef } from "react"; // Ajout de useRef
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { Send, Bot, User, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ErrorPayload,
  streamAgentResponse,
  StreamCallbacks,
  ValuesPayload,
} from "@/app/api/agent";
import { cn } from "@/lib/utils";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import { ContextPopup } from "@/components/create/ContextPopup";
import { useDocumentManagement } from "@/hooks/useDocumentManagement";


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
  const [threadId, setThreadId] = useState<string | null>(null);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [showContextPopup, setShowContextPopup] = useState(false);
  const [contextQuery, setContextQuery] = useState("");
  const { token } = useAuth();
  const { documents } = useDocumentManagement();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const navigate = useNavigate();

  // Ref pour le conteneur des messages afin de scroller automatiquement
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("Confidence score updated:", confidenceScore);
    if (confidenceScore >= 8 && !isStreaming) {
      setShowGenerateButton(true);
    } else {
      setShowGenerateButton(false);
    }
  }, [confidenceScore, isStreaming]);

  // Effet pour scroller vers le bas quand un nouveau message arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTopic(value);
    const atIndex = value.lastIndexOf("@");

    if (atIndex !== -1) {
      const query = value.substring(atIndex + 1);
      if (!query.includes(" ")) {
        setShowContextPopup(true);
        setContextQuery(query);
      } else {
        setShowContextPopup(false);
      }
    } else {
      setShowContextPopup(false);
    }
  };

  const handleContextSelect = (item: string) => {
    const atIndex = topic.lastIndexOf("@");
    if (atIndex !== -1) {
      const newTopic = `${topic.substring(0, atIndex)}@${item} `;
      setTopic(newTopic);
    }
    setShowContextPopup(false);
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { id: uuidv4(), sender: "user", text };
    const aiMessageId = uuidv4();
    const aiPlaceholder: Message = { id: aiMessageId, sender: "ai", text: "" };

    setMessages((prev) => [...prev, userMessage, aiPlaceholder]);

    setNewMessage("");
    setIsStreaming(true);
    setShowGenerateButton(false);

    const callbacks: StreamCallbacks = {
      onMessage: (token: string) => {
        if (token === "") return; // Ignore empty tokens to prevent unnecessary updates
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.id !== aiMessageId) return msg;

            // If the incoming token contains the current text as a prefix, replace instead of append
            const shouldReplace = token.startsWith(msg.text);
            const newText = shouldReplace ? token : msg.text + token;
            return { ...msg, text: newText };
          })
        );
      },
      onValues: (values: ValuesPayload & { thread_id?: string }) => {
        if (typeof values.confidence_score === 'number') {
          setConfidenceScore(values.confidence_score);
          console.log("Confidence score received:", values.confidence_score);
        }
        if (values.thread_id && !threadId) {
          setThreadId(values.thread_id);
        }
      },
      onError: (error: ErrorPayload) => {
        console.error("SSE Error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, text: `Error: ${"message" in error ? error.message : "An unknown error occurred"}` }
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

    streamAgentResponse(text, threadId, callbacks);
  };

  const handleGenerate = () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) return;
    setIsChatVisible(true);
    sendMessage(trimmedTopic);
    setTopic("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };


  async function fetchStructure(threadId: string) {
    const res = await fetch(`${apiUrl}/agent/structure`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ thread_id: threadId, prompt: "PROCEED_TO_GENERATION" })
    });
    if (!res.ok) throw new Error("Generation failed");
    return res.json();           // {title:"...", modules:[...]}
  }

  async function saveFormation(structure:  Record<string, unknown>) {
    const res = await fetch(`${apiUrl}/formations/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(structure)
    });
    if (!res.ok) throw new Error("DB insert failed");
    return res.json();           // { id: …, nom: … }
  }

  const handleProceedToGeneration = async () => {
    try {
      setIsStreaming(true);                         // simple spinner
      const structure = await fetchStructure(threadId!);
      const created = await saveFormation(structure);
      navigate(`/generation/${created.id}`);


      console.log({
        title: "Formation créée",
        description: `ID #${created.id} – ${created.nom}`
      });
    } catch (e: unknown) {
      console.log({ variant: "destructive", title: "Erreur", description: e instanceof Error ? e.message : "An unknown error occurred" });
    } finally {
      setIsStreaming(false);
    }
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
                    Enter a topic below to generate an onboarding on it
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="topic-input" className="sr-only">
                      Describe your idea
                    </Label>
                    <div className="relative flex flex-col w-full rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring">
                      <Textarea
                        id="topic-input"
                        placeholder="describe your idea here..."
                        value={topic}
                        onChange={handleTopicChange}
                        className="h-56 text-base border-0 shadow-none focus-visible:ring-0"
                      />
                      {showContextPopup && (
                        <ContextPopup
                          onSelect={handleContextSelect}
                          query={contextQuery}
                          documents={documents}
                        />
                      )}
                      <div className="px-3 py-2 text-sm text-muted-foreground border-t">
                        @reference your context
                      </div>
                    </div>
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
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
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
                        "prose prose-sm prose-slate dark:prose-invert",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text || "..."}
                      </ReactMarkdown>
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
                {showGenerateButton && (
                  <div className="mb-4">
                    <Button
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      onClick={handleProceedToGeneration}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Course Structure (Confidence: {confidenceScore}/10)
                    </Button>
                  </div>
                )}
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