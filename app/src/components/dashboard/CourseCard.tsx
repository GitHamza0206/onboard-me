// src/components/dashboard/CourseCard.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    isRecommended?: boolean;
}

export function CourseCard({ id, title, description, imageUrl, isRecommended = false }: CourseCardProps) {
    const navigate = useNavigate(); 

    const handleStartCourse = () => {
        navigate(`/course-onboarding/${id}`);
    };
    
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
                <Button className="w-full" onClick={handleStartCourse}>Start Course</Button>
            </CardFooter>
        </Card>
    );
}