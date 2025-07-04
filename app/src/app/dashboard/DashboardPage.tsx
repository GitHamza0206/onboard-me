// src/pages/DashboardPage.tsx
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { InProgressCourseCard } from "@/components/dashboard/InProgressCourseCard";

const recommendedCourses = [
    { title: "Mastering Project Management", description: "Learn to manage projects effectively", imageUrl: "https://media.istockphoto.com/id/1198271727/fr/photo/objet-ondul%C3%A9-abstrait.jpg?s=612x612&w=0&k=20&c=A2ytpKebpdjcWVcP3BcEdKRJ-s-beXcQRMmOgat5M_8=" },
    { title: "Advanced Data Analysis", description: "Dive deep into data analysis techniques", imageUrl: "https://media.istockphoto.com/id/1198271727/fr/photo/objet-ondul%C3%A9-abstrait.jpg?s=612x612&w=0&k=20&c=A2ytpKebpdjcWVcP3BcEdKRJ-s-beXcQRMmOgat5M_8=" },
    { title: "Creative Writing Workshop", description: "Unleash your creative writing potential", imageUrl: "https://media.istockphoto.com/id/1198271727/fr/photo/objet-ondul%C3%A9-abstrait.jpg?s=612x612&w=0&k=20&c=A2ytpKebpdjcWVcP3BcEdKRJ-s-beXcQRMmOgat5M_8=" },
    { title: "UX/UI Design Principles", description: "Master the core principles of design", imageUrl: "https://media.istockphoto.com/id/1198271727/fr/photo/objet-ondul%C3%A9-abstrait.jpg?s=612x612&w=0&k=20&c=A2ytpKebpdjcWVcP3BcEdKRJ-s-beXcQRMmOgat5M_8=" },
];

const popularCourses = [
    { title: "Introduction to Machine Learning", description: "Learn the basics of machine learning algorithms" },
    { title: "Digital Marketing Fundamentals", description: "Master the fundamentals of digital marketing" },
    { title: "Financial Planning for Beginners", description: "Plan your finances effectively" },
    { title: "Effective Communication Skills", description: "Improve your communication skills" },
    { title: "Web Development Bootcamp", description: "Become a web developer in this intensive bootcamp" },
    { title: "Leadership and Team Management", description: "Lead and manage teams effectively" },
];

const inProgressCourses = [
    { title: "Intermediate Python Programming", estimatedTime: 12, progress: 60 },
    { title: "UX/UI Design Principles", estimatedTime: 8, progress: 25 },
];

export function DashboardPage() {
    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Recommended for You Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
                <div className="flex space-x-6 overflow-x-auto pb-4">
                    {recommendedCourses.map((course, index) => (
                        <div key={index} className="min-w-[280px]">
                            <CourseCard {...course} isRecommended={true} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Popular Courses Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Popular Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {popularCourses.map((course, index) => (
                        <CourseCard key={index} {...course} imageUrl="https://media.istockphoto.com/id/1198271727/fr/photo/objet-ondul%C3%A9-abstrait.jpg?s=612x612&w=0&k=20&c=A2ytpKebpdjcWVcP3BcEdKRJ-s-beXcQRMmOgat5M_8=" isRecommended={false} />
                    ))}
                </div>
            </section>

            {/* Continue Learning Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Continue Learning</h2>
                <div className="space-y-4">
                    {inProgressCourses.map((course, index) => (
                        <InProgressCourseCard key={index} {...course} />
                    ))}
                </div>
            </section>
        </div>
    );
}