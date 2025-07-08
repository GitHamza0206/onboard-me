import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SendHorizonal, Check, X } from "lucide-react";
import { invokeAgent, applyChanges } from "@/app/api/cursor";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CursorChatProps {
  formationId: number;
}

export function CursorChat({ formationId }: CursorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm here to help you edit this course. What would you like to change?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  
  const [diff, setDiff] = useState<string | null>(null);
  const [proposedStructure, setProposedStructure] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, diff]);

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    setMessages(prev => [...prev, { role: "user", content: trimmedInput }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const result = await invokeAgent(formationId, trimmedInput, threadId);
      
      setThreadId(result.thread_id);
      
      const finalState = result.final_state;
      if (finalState.diff) {
        setDiff(finalState.diff);
        setProposedStructure(finalState.proposed_structure);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "I encountered an issue processing your request. Please try again." }]);
      }

    } catch (error) {
      console.error("Failed to invoke agent:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, formationId, threadId]);

  const handleAccept = async () => {
    if (!proposedStructure) return;
    setIsLoading(true);
    try {
      await applyChanges(formationId, proposedStructure);
      setMessages(prev => [...prev, { role: "assistant", content: "Changes applied successfully!" }]);
      setDiff(null);
      setProposedStructure(null);
    } catch (error) {
      console.error("Failed to apply changes:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages(prev => [...prev, { role: "assistant", content: `Error applying changes: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReject = () => {
    setDiff(null);
    setProposedStructure(null);
    setMessages(prev => [...prev, { role: "assistant", content: "Changes rejected. What would you like to do next?" }]);
  };

  const cleanDiff = (rawDiff: string) => {
    if (!rawDiff) return "";
    // Split by lines, remove the first two lines (file paths), and rejoin
    return rawDiff.split('\n').slice(2).join('\n');
  };

  return (
    <div className="flex-shrink-0 w-96 border-l flex flex-col h-full">
      <header className="p-4 border-b flex items-center gap-3">
        <h2 className="text-lg font-semibold flex-1">Cursor Assistant</h2>
        <div className="flex items-center gap-2">
          <span className={cn("relative flex h-2.5 w-2.5", isLoading ? "animate-pulse" : "")}>
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-sm text-muted-foreground">{isLoading ? "Processing..." : "Online"}</span>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' && 'justify-end')}>
              {message.role === 'assistant' && <Avatar className="w-8 h-8"><AvatarFallback>AI</AvatarFallback></Avatar>}
              <div className={cn("max-w-[85%] p-3 rounded-lg text-sm", message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                <p>{message.content}</p>
              </div>
              {message.role === 'user' && <Avatar className="w-8 h-8"><AvatarFallback>U</AvatarFallback></Avatar>}
            </div>
          ))}
          {diff && (
            <div className="p-4 border rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">Proposed Changes:</h3>
                <ScrollArea className="max-h-64">
                    <pre className="text-xs whitespace-pre-wrap font-mono bg-background p-2 rounded-md overflow-x-auto">
                        {cleanDiff(diff)}
                    </pre>
                </ScrollArea>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={handleReject} disabled={isLoading}><X className="h-4 w-4 mr-1" /> Reject</Button>
                    <Button size="sm" onClick={handleAccept} disabled={isLoading}><Check className="h-4 w-4 mr-1" /> Accept</Button>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <footer className="p-4 border-t">
        <div className="relative">
          <Input
            placeholder="e.g., Change the title of the first lesson"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            disabled={isLoading || !!diff}
            className="pr-12"
          />
          <Button
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={handleSendMessage}
            disabled={isLoading || !!diff || !inputValue.trim()}
            aria-label="Send message"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
} 