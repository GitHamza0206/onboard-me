// src/routes.tsx
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./app/auth/ProtectedRoute";
import { AuthProvider } from "./app/auth/authContext";
import { AuthPage } from "./app/auth/page";
import { RegisterPage } from "./app/auth/register";
import { OnboardingPage } from "./app/course/page";
import { CoursesPage } from "@/app/coursesList/CoursesPage"; 
import { EditorPage } from "./app/editor/page"; 
import Layout from "./layout";

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
        path: "/course-onboarding", 
        element: (
          // <ProtectedRoute>
            <Layout>
              <OnboardingPage />
            </Layout>
          // </ProtectedRoute>
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
      // --- Catch-all Route ---
      // This will redirect any unknown URL to the main courses page.
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
