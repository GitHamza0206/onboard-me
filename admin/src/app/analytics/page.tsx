// src/app/analytics/page.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/app/auth/authContext";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BookCopy, CircleCheck, GraduationCap, Users } from "lucide-react";

interface KPIs {
    total_users: number;
    total_formations: number;
    total_assigned: number;
    completion_rate: number;
    quiz_success_rate: number;
}

interface FormationStat {
    name: string;
    "Taux de complétion": number;
}

interface ModuleAbandonment {
    module: string;
    formation: string;
    tauxAbandon: string;
}

interface AnalyticsData {
    kpis: KPIs;
    formation_completion_stats: FormationStat[];
    module_abandonment_stats: ModuleAbandonment[];
}

export function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch(`${apiUrl}/admin/analytics`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Failed to fetch analytics");
                const data = await response.json();
                setAnalyticsData(data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchAnalytics();
        }
    }, [token, apiUrl]);

    if (isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
                        <div className="text-center py-8">
                            <p className="text-lg">Loading analytics...</p>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (!analyticsData) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
                        <div className="text-center py-8">
                            <p className="text-lg text-red-500">Error loading analytics</p>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                    Analytics Dashboard
                    </h1>

                    {/* KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                Total Users
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analyticsData.kpis.total_users}</div>
                                <p className="text-xs text-muted-foreground">
                                Total number of users
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                Assigned Trainings
                                </CardTitle>
                                <BookCopy className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analyticsData.kpis.total_assigned}</div>
                                <p className="text-xs text-muted-foreground">
                                Total assignments
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                Completion Rate
                                </CardTitle>
                                <CircleCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analyticsData.kpis.completion_rate}%</div>
                                <p className="text-xs text-muted-foreground">
                                Overall average
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                Successful Quizzes
                                </CardTitle>
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analyticsData.kpis.quiz_success_rate}%</div>
                                <p className="text-xs text-muted-foreground">
                                Average success rate
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Graphiques + Tableaux */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Graphique Progression par formation */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Training Progress</CardTitle>
                                <CardDescription>
                                Average completion rate for main trainings.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px] w-full p-2">
                                {analyticsData.formation_completion_stats.length > 0 ? (
                                    <ResponsiveContainer>
                                        <BarChart data={analyticsData.formation_completion_stats}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                fontSize={12}
                                            />
                                            <YAxis unit="%" />
                                            <Tooltip
                                                cursor={{ fill: "hsl(var(--muted))" }}
                                                content={({ active, payload, label }) =>
                                                    active &&
                                                    payload && (
                                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                            <p className="font-bold">{label}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {`${payload[0].value}% completion`}
                                                            </p>
                                                        </div>
                                                    )
                                                }
                                            />
                                            <Bar
                                                dataKey="Taux de complétion"
                                                fill="hsl(var(--primary))"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-muted-foreground">data available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tableau Modules les plus abandonnés */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Most Abandoned Modules</CardTitle>
                                <CardDescription>
                                Modules where users are most likely to drop out.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Module</TableHead>
                                            <TableHead className="text-right">Dropout Rate</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analyticsData.module_abandonment_stats.length > 0 ? (
                                            analyticsData.module_abandonment_stats.map((item) => (
                                                <TableRow key={item.module}>
                                                    <TableCell>
                                                        <p className="font-medium">{item.module}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.formation}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {item.tauxAbandon}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center text-muted-foreground">
                                                No dropout data available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}