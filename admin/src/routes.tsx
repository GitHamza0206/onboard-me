// src/routes.tsx
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./app/auth/ProtectedRoute";
import { AuthProvider } from "./app/auth/authContext";
import { AuthPage } from "./app/auth/page";
import { RegisterPage } from "./app/auth/register";
import { OnboardingPage } from "./app/generation/content";
import { CoursesPage } from "@/app/adminCouses/CoursesPage";
import { EditorPage } from "./app/editor/page";
import Layout from "./layout";
import { CreatePage } from "./app/create/page";
import { GenerationPage } from "./app/generation/structure";
import { UsersPage } from "./app/users/page";
import { AnalyticsPage } from "./app/analytics/page";
import DocumentManagementPage from "./app/documents/page";
import GenerationEntryPage from "./app/generation/page";

// This component provides the global authentication context.
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
        path: "/create", // <-- Add the new route here
        element: (
          <ProtectedRoute>
            <Layout>
              <CreatePage />
            </Layout>
          </ProtectedRoute>
        )
      },
      {
        path: "/editor", // <-- Nouvelle route
        element: (
          <ProtectedRoute>
            <Layout>
              <EditorPage />
            </Layout>
          </ProtectedRoute>
        )
      },
      {
        path: "/courses", // <-- Nouvelle route
        element: (
          <ProtectedRoute>
            <Layout>
              <CoursesPage />
            </Layout>
          </ProtectedRoute>
        )
      },
      {
        path: "/generation/:courseId",
        element: (
          <ProtectedRoute>
            <GenerationEntryPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/users",
        element: (
          <ProtectedRoute>
            <Layout>
              <UsersPage />
            </Layout>
          </ProtectedRoute>
        )
      },
      {
        path: "/analytics",
        element: (
          <ProtectedRoute>
            <Layout>
              <AnalyticsPage />
            </Layout>
          </ProtectedRoute>
        )
      },
      {
        path: "/documents",
        element: (
          <ProtectedRoute>
            <Layout>
              <DocumentManagementPage />
            </Layout>
          </ProtectedRoute>
        )
      },
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
