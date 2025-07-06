// src/components/admin/CourseCard.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface CourseCardProps {
  title: string;
  lastUpdated: string;
  imageUrl: string;
  /**
   * Callback déclenché au clic sur la carte. Si non fourni, la carte est affichée
   * en simple composant visuel.
   */
  onClick?: () => void;
}

export function CourseCard({ title, lastUpdated, imageUrl, onClick }: CourseCardProps) {
  return (
    <Card
      onClick={onClick}
      className="overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
    >
      <CardContent className="p-0">
        <img
          src={imageUrl}
          alt={title}
          className="h-40 w-full object-cover"
        />
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 p-4">
        <h3 className="font-semibold line-clamp-2 min-h-[3rem]">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </CardFooter>
    </Card>
  );
}
