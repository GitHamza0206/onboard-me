// src/pages/admin/CoursesPage.tsx
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/admin/CourseCard";
import { RecentActivityList } from "@/components/admin/RecentActivityList";

const courses = [
  { title: "Introduction to Project Management", lastUpdated: "July 15, 2024", imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop" },
  { title: "Advanced Data Analysis", lastUpdated: "July 10, 2024", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" },
  { title: "Effective Communication Strategies", lastUpdated: "July 5, 2024", imageUrl: "https://images.unsplash.com/photo-1587560699334-cc426240a398?q=80&w=2070&auto=format&fit=crop" },
  { title: "Team Leadership and Collaboration", lastUpdated: "June 28, 2024", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" },
  { title: "Financial Planning for Startups", lastUpdated: "June 20, 2024", imageUrl: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=2089&auto=format&fit=crop" },
  { title: "Digital Marketing Fundamentals", lastUpdated: "June 12, 2024", imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop" },
];


export function CoursesPage() {
  return (
    <main className="flex-1 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Button>Create New Course</Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost">All Courses</Button>
        <Button variant="ghost" className="text-muted-foreground">Draft</Button>
        <Button variant="ghost" className="text-muted-foreground">Published</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map(course => (
          <CourseCard key={course.title} {...course} />
        ))}
      </div>
      
      <RecentActivityList />
    </main>
  );
}