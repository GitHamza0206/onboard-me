// src/components/dashboard/CategoryFilters.tsx
import { Button } from "@/components/ui/button";

const categories = ["All", "Technology", "Business", "Design", "Marketing", "Personal Development"];

export function CategoryFilters() {
    return (
        <nav className="flex flex-col gap-2">
            {categories.map((category, index) => (
                <Button
                    key={category}
                    variant={index === 0 ? "secondary" : "ghost"}
                    className="justify-start"
                >
                    {category}
                </Button>
            ))}
        </nav>
    );
}