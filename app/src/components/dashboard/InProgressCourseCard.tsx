// src/components/dashboard/InProgressCourseCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface InProgressCourseCardProps {
    title: string;
    estimatedTime: number;
    progress: number;
}

export function InProgressCourseCard({ title, estimatedTime, progress }: InProgressCourseCardProps) {
    return (
        <Card>
            <CardContent className="flex items-center gap-6 p-4">
                <img src="https://media.istockphoto.com/id/1198271727/fr/photo/objet-ondul%C3%A9-abstrait.jpg?s=612x612&w=0&k=20&c=A2ytpKebpdjcWVcP3BcEdKRJ-s-beXcQRMmOgat5M_8=" alt={title} className="h-24 w-24 object-cover rounded-md" />
                <div className="flex-grow space-y-2">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <p className="text-sm text-muted-foreground">In progress</p>
                    <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-full" />
                        <span className="text-sm font-medium">{progress}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Estimated time: {estimatedTime} hours</p>
                </div>
                <Button>Continue</Button>
            </CardContent>
        </Card>
    );
}