// 📄 front/src/components/course/support-chat.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SendHorizonal } from "lucide-react";
import { streamAgentResponse, StreamCallbacks, ErrorPayload } from "@/api/agent";

// Define the structure for a chat message
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Set up initial messages for the chat
const initialMessages: Message[] = [
  {
    role: "assistant",
    content: "Hello! Welcome to the onboarding course. I'm here to help with any questions you might have."
  },
  {
    role: "assistant",
    content: "Feel free to ask me about any of the course content, platform features, or if you need clarification on anything."
  }
];

interface ChatProps {
  className?: string;
}

export function SupportChat({ className }: ChatProps) {
  // State for managing the list of messages
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  // State for the user's current input
  const [inputValue, setInputValue] = useState("");
  // State to track if the AI is currently responding
  const [isLoading, setIsLoading] = useState(false);
  // Ref to automatically scroll the chat to the latest message
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the bottom whenever a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handles sending a message to the AI agent and streaming the response.
   */
  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    // Add the user's message to the chat history
    const newUserMessage: Message = { role: "user", content: trimmedInput };
    // Add a placeholder for the assistant's response to be populated by the stream
    setMessages(prev => [...prev, newUserMessage, { role: "assistant", content: "" }]);
    setInputValue("");
    setIsLoading(true);

    // Define callbacks to handle events from the streaming API
    const callbacks: StreamCallbacks = {
      onMessage: (token: string) => {
        // Append each incoming token to the assistant's message content
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === "assistant") {
            const updatedLastMessage = { ...lastMessage, content: lastMessage.content + token };
            return [...prev.slice(0, -1), updatedLastMessage];
          }
          return prev;
        });
      },
      onError: (error: ErrorPayload) => {
        console.error("SSE Error:", error);
        // Display an error message in the chat
        setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === "assistant") {
                const updatedLastMessage = { ...lastMessage, content: "Sorry, I encountered an error. Please try again." };
                return [...prev.slice(0, -1), updatedLastMessage];
            }
            return prev;
        });
        setIsLoading(false);
      },
      onClose: () => {
        // Reset loading state when the stream is finished
        setIsLoading(false);
      },
    };

    // Call the streaming API with the user's message and the defined callbacks
    await streamAgentResponse(trimmedInput, callbacks);

  }, [inputValue, isLoading]);

  return (
    <div className={cn("flex-shrink-0 w-80 border-l flex flex-col", className)}>
      <header className="p-4 border-b flex items-center gap-3">
        <h2 className="text-lg font-semibold flex-1">Support Chat</h2>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-sm text-muted-foreground">Online</span>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' && 'justify-end')}>
              {/* Assistant's avatar on the left */}
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              {/* Message bubble */}
              <div className={cn(
                "max-w-[85%] p-3 rounded-lg text-sm",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted rounded-bl-none"
              )}>
                <p>
                  {message.content}
                  {/* Show a pulsing cursor while the AI is typing */}
                  {isLoading && message.role === 'assistant' && index === messages.length - 1 && (
                     <span className="animate-pulse inline-block w-2 h-4 bg-current ml-1" />
                  )}
                </p>
              </div>
              {/* User's avatar on the right */}
              {message.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {/* Empty div to act as a scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <footer className="p-4 border-t">
        <div className="relative">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="pr-12"
          />
          <Button
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
