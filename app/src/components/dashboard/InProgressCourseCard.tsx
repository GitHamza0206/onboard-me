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
                <img src="/placeholder.svg" alt={title} className="h-24 w-24 object-cover rounded-md" />
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