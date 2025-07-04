// src/layouts/DashboardLayout.tsx
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CategoryFilters } from "@/components/dashboard/CategoryFilters";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <DashboardHeader />
            <div className="flex flex-1">
                <aside className="hidden w-60 flex-col border-r bg-background p-4 pt-6 sm:flex">
                    <CategoryFilters />
                </aside>
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}