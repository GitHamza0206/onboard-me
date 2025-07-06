// src/app/dashboard/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/auth/authContext'; // Assuming this is the correct path in the merged app
import { CourseCard } from "@/components/dashboard/CourseCard";
import { InProgressCourseCard } from "@/components/dashboard/InProgressCourseCard";

interface Formation {
  id: number;
  nom: string;
  description?: string; // Add description if your formation table has it
  cover_url?: string;
}

export function DashboardPage() {
    const { token } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const [myCourses, setMyCourses] = useState<Formation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        const fetchMyCourses = async () => {
            setIsLoading(true);
            try {
                // Call the new endpoint
                const response = await fetch(`${apiUrl}/formations/users/me/formations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Could not fetch assigned courses.");
                const data = await response.json();
                setMyCourses(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyCourses();
    }, [token, apiUrl]);


    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <section>
                <h2 className="text-2xl font-semibold mb-4">My Courses</h2>
                {isLoading ? (
                    <p>Loading your courses...</p>
                ) : myCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                id={course.id}
                                title={course.nom}
                                description={course.description || "Start this course to learn more."}
                                imageUrl={course.cover_url || "https://media.istockphoto.com/id/1198271727/fr/photo/objet-ondul%C3%A9-abstrait.jpg?s=612x612&w=0&k=20&c=A2ytpKebpdjcWVcP3BcEdKRJ-s-beXcQRMmOgat5M_8="}
                                isRecommended={false}
                            />
                        ))}
                    </div>
                ) : (
                    <p>You have not been assigned to any courses yet.</p>
                )}
            </section>
        </div>
    );
}