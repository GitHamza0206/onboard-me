// src/routes.tsx
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from "react-router-dom";
// import { ProtectedRoute } from "./app/auth/ProtectedRoute"; // <-- Commenté ou supprimé
import { AuthProvider } from "./app/auth/authContext";
import { AuthPage } from "./app/auth/page";
import { RegisterPage } from "./app/auth/register";
import { OnboardingPage } from "./app/course/page";
import { DashboardPage } from "@/pages/DashboardPage";
import { EditorPage } from "./app/editor/page";
import Layout from "./layout";
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Ce composant fournit le contexte d'authentification global.
function Root() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}

const router = createBrowserRouter([
    {
        element: <Root />,
        children: [
            { path: "/auth", element: <Layout><AuthPage /></Layout> },
            { path: "/register", element: <Layout><RegisterPage /></Layout> },
            {
                path: "/",
                // Le composant <ProtectedRoute> a été retiré ici
                element: (
                    <DashboardLayout>
                        <Outlet />
                    </DashboardLayout>
                ),
                children: [
                    {
                        path: "dashboard",
                        element: <DashboardPage />,
                    },
                    {
                        path: "editor",
                        element: <EditorPage />,
                    },
                    {
                        path: "onboarding",
                        element: <OnboardingPage />
                    },
                    // Redirige la racine "/" vers "/dashboard"
                    {
                        index: true,
                        element: <Navigate to="/dashboard" replace />,
                    },
                ]
            },
            // --- Route par défaut ---
            // Redirige toute URL inconnue vers la page principale du tableau de bord.
            {
                path: "*",
                element: <Navigate to="/dashboard" replace />
            },
        ]
    }
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}