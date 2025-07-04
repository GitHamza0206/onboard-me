// 📄 front/src/components/course/course-nav.tsx
import {
    ChevronDown,
    ChevronRight,
    Circle,
    LayoutDashboard,
  } from "lucide-react";
  import { cn } from "@/lib/utils";
  import { Button } from "@/components/ui/button";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import React from "react";
  
  // Données de navigation (peuvent être passées en props plus tard)
  const courseSections = [
    {
      title: "Getting Started",
      items: [
        { name: "Welcome to the Platform", active: true },
        { name: "Account Setup" },
        { name: "Platform Navigation" },
      ],
    },
    {
      title: "Platform Basics",
      items: [],
    },
    {
      title: "Key Features",
      items: [],
    },
    {
      title: "Advanced Topics",
      items: [],
    },
  ];
  
  interface CourseNavProps {
    className?: string;
  }
  
  export function CourseNav({ className }: CourseNavProps) {
    return (
      <div className={cn("flex-shrink-0 w-64 border-r", className)}>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-1">Course Content</h2>
          <p className="text-sm text-muted-foreground">Platform Onboarding</p>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)] px-2">
          <div className="flex flex-col gap-2 p-2">
            {courseSections.map((section, index) => (
              <div key={index}>
                <button className="flex items-center justify-between w-full text-left p-2 rounded-md hover:bg-muted">
                  <span className="font-semibold text-sm">{section.title}</span>
                  <ChevronDown size={16} />
                </button>
                <ul className="pl-4 mt-1 space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a
                        href="#"
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md text-sm",
                          item.active
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <Circle
                          className={cn(
                            "w-2 h-2",
                            item.active ? "text-primary" : "text-gray-400"
                          )}
                          fill="currentColor"
                        />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }