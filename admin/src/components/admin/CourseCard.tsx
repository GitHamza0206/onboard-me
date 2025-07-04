// src/components/admin/CourseCard.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface CourseCardProps {
  title: string;
  lastUpdated: string;
  imageUrl: string;
}

export function CourseCard({ title, lastUpdated, imageUrl }: CourseCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <img
          src={imageUrl}
          alt={title}
          className="h-40 w-full object-cover"
        />
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </CardFooter>
    </Card>
  );
}