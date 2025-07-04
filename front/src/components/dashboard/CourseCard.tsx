// src/components/dashboard/CourseCard.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // <-- CORRECTED PATH

interface CourseCardProps {
    title: string;
    description: string;
    imageUrl: string;
    isRecommended?: boolean;
}

export function CourseCard({ title, description, imageUrl, isRecommended = false }: CourseCardProps) {
    if (isRecommended) {
        return (
            <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                    <img src={imageUrl} alt={title} className="h-40 w-full object-cover" />
                </CardContent>
                <div className="p-4 bg-background">
                    <h3 className="font-semibold truncate">{title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{description}</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                {/* Could add more details here like difficulty, etc. */}
            </CardContent>
            <CardFooter>
                <Button className="w-full">Start Course</Button>
            </CardFooter>
        </Card>
    );
}