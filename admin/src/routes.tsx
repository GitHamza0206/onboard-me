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
          <Layout>
            <CreatePage />
          </Layout>
        )
      },
      {
        path: "/editor", // <-- Nouvelle route
        element: (
          <Layout>
            <EditorPage />
          </Layout>
        )
      },
      {
        path: "/courses", // <-- Nouvelle route
        element: (
          <Layout>
            <CoursesPage />
          </Layout>
        )
      },
      {
        path: "/generation/:courseId",
        element: <GenerationPage /> // This page has its own full layout
      },
      {
        path: "/courseGeneration/:courseId",
        element: (
          // <ProtectedRoute>
            <OnboardingPage />
          // </ProtectedRoute>
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
