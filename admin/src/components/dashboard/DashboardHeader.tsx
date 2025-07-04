// src/components/dashboard/DashboardHeader.tsx
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/auth/authContext";

export function DashboardHeader() {
    const { user, logout } = useAuth();
    const userInitials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : "U";

    return (
        <header className="flex h-20 items-center justify-between border-b bg-background px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-primary">SkillUp</h1>
                <div className="ml-8">
                    <h2 className="text-2xl font-semibold">Welcome back, {user?.first_name || 'Sarah'}</h2>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search for courses..." className="pl-9 rounded-full" />
                </div>
                <button aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="h-10 w-10 cursor-pointer">
                            <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem>Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}