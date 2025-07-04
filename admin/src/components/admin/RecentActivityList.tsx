// src/components/admin/RecentActivityList.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Activity {
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  timestamp: string;
}

const activities: Activity[] = [
    { user: { name: "Sarah Miller", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }, action: "Completed course: Introduction to Project Management", timestamp: "2 days ago" },
    { user: { name: "David Chen", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e" }, action: "Started course: Advanced Data Analysis", timestamp: "3 days ago" },
    { user: { name: "Emily Rodriguez", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f" }, action: "Published course: Effective Communication Strategies", timestamp: "5 days ago" },
];

export function RecentActivityList() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Recent Activity</h2>
            <ul className="space-y-5">
                {activities.map((activity, index) => (
                    <li key={index} className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p><strong>{activity.user.name}</strong> {activity.action.split(': ')[0]}: {activity.action.split(': ')[1]}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}