// src/routes.tsx
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./app/auth/ProtectedRoute";
import { AuthProvider } from "./app/auth/authContext";
import { AuthPage } from "./app/auth/page";
import { RegisterPage } from "./app/auth/register";
import { OnboardingPage } from "./app/course/page";
// Correction du chemin d'importation pour CoursesPage
import { CoursesPage } from "@/app/admin/CoursesPage"; 
import { EditorPage } from "./app/editor/page"; 
import Layout from "./layout";
import { DashboardPage } from "./app/dashboard/DashboardPage";
// --- Import de la nouvelle page ---
import { AdminCourseUploadPage } from "./app/admin/course-creation/page";

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
        path: "/course-onboarding", 
        element: (
          <Layout>
            <OnboardingPage />
          </Layout>
        ) 
      },
      { 
        path: "/editor",
        element: (
          <Layout>
            <EditorPage />
          </Layout>
        )
      },
      { 
        path: "/home",
        element: (
          <Layout>
            <DashboardPage />
          </Layout>
        )
      },
      { 
        path: "/courses",
        element: (
          <Layout>
            <CoursesPage />
          </Layout>
        )
      },
      // --- AJOUT DE LA NOUVELLE ROUTE ---
      { 
        path: "/admin/upload-course",
        element: (
          <Layout>
            <AdminCourseUploadPage />
          </Layout>
        )
      },
      // --- FIN DE L'AJOUT ---
      {
        path: "*", 
        element: <Navigate to="/courses" replace />
      },
    ]
  }
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}