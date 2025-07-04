// 📄 front/src/components/course/support-chat.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatProps {
  className?: string;
}

export function SupportChat({ className }: ChatProps) {
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

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>OC</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="font-semibold text-sm">Onboarding course</p>
                <p className="text-xs text-muted-foreground">12:28</p>
              </div>
              <div className="mt-1 bg-gray-100 p-3 rounded-lg rounded-tl-none">
                <p className="text-sm">
                  Hello! Welcome to our onboarding course. I'm here to help you
                  with any questions you might have.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
             <Avatar className="w-8 h-8">
              <AvatarFallback>OC</AvatarFallback>
            </Avatar>
            <div className="flex-1">
               <div className="flex items-baseline gap-2">
                <p className="font-semibold text-sm">Onboarding course</p>
                <p className="text-xs text-muted-foreground">12:29</p>
              </div>
              <div className="mt-1 bg-gray-100 p-3 rounded-lg rounded-tl-none">
                <p className="text-sm">
                  Feel free to ask me about any of the course content, platform
                  features, or if you need clarification on anything.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <footer className="p-4 border-t">
        <Input placeholder="Type your message..." />
      </footer>
    </div>
  );
}