// src/app/analytics/page.tsx
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

// --- Données Mock pour les graphiques et tableaux ---

const barChartData = [
    { name: "Intro. Mgt. Projet", "Taux de complétion": 85 },
    { name: "Analyse de Données", "Taux de complétion": 62 },
    { name: "Communication", "Taux de complétion": 91 },
    { name: "Leadership d'équipe", "Taux de complétion": 75 },
    { name: "Marketing Digital", "Taux de complétion": 58 },
];

const abandonedModulesData = [
    {
        module: "Analyse de Données - Module 3",
        formation: "Analyse de Données Avancée",
        tauxAbandon: "45%",
    },
    {
        module: "Marketing Digital - Le SEO",
        formation: "Marketing Digital Fondamentaux",
        tauxAbandon: "38%",
    },
    {
        module: "Leadership - Gestion de conflits",
        formation: "Leadership d'équipe et Collaboration",
        tauxAbandon: "32%",
    },
    {
        module: "Planification Financière - Scénarios",
        formation: "Planification Financière pour Startups",
        tauxAbandon: "29%",
    },
];

export function AnalyticsPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Tableau de Bord Analytique
                    </h1>

                    {/* KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Utilisateurs totaux
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1,254</div>
                                <p className="text-xs text-muted-foreground">
                                    +12% depuis le mois dernier
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Formations assignées
                                </CardTitle>
                                <BookCopy className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">342</div>
                                <p className="text-xs text-muted-foreground">
                                    +5 nouvelles ce mois-ci
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Taux de complétion
                                </CardTitle>
                                <CircleCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">78.5%</div>
                                <p className="text-xs text-muted-foreground">
                                    Moyenne globale
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Quiz réussis
                                </CardTitle>
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">92%</div>
                                <p className="text-xs text-muted-foreground">
                                    Taux de réussite moyen
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Graphiques + Tableaux */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Graphique Progression par formation */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Progression par Formation</CardTitle>
                                <CardDescription>
                                    Taux de complétion moyen pour les formations principales.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px] w-full p-2">
                                <ResponsiveContainer>
                                    <BarChart data={barChartData}>
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
                                                            {`${payload[0].value}% de complétion`}
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
                            </CardContent>
                        </Card>

                        {/* Tableau Modules les plus abandonnés */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Modules les plus abandonnés</CardTitle>
                                <CardDescription>
                                    Les modules où les utilisateurs abandonnent le plus.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Module</TableHead>
                                            <TableHead className="text-right">Abandon</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {abandonedModulesData.map((item) => (
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
                                        ))}
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