// src/routes.tsx
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./app/auth/ProtectedRoute";
import { AuthProvider } from "./app/auth/authContext";
import { AuthPage } from "./app/auth/page";
import { RegisterPage } from "./app/auth/register";
import { OnboardingPage } from "./app/course/page";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CoursesPage } from "@/components/admin/CoursesPage"; 

// This component provides the global authentication context.
function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

// This component defines the main layout for the admin section.
function AdminRoot() {
    return (
        <AdminLayout>
            <AdminHeader />
            <Outlet />
        </AdminLayout>
    );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      // --- Public Routes ---
      // These routes are accessible to everyone.
      { path: "/auth", element: <AuthPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/course-onboarding", element: <OnboardingPage /> },

      // --- Admin Routes (Now Public) ---
      // This group of routes is now accessible without login.
      // It uses the AdminRoot layout.
      {
        path: "/",
        element: (
          // The <ProtectedRoute> wrapper has been removed.
          <AdminRoot />
        ),
        children: [
          // The index route redirects from "/" to "/courses".
          { 
            index: true, 
            element: <Navigate to="/courses" replace /> 
          },
          { path: "courses", element: <CoursesPage /> },
          { path: "home", element: <div>Home Page</div> },
          { path: "analytics", element: <div>Analytics Page</div> },
          { path: "settings", element: <div>Settings Page</div> },
        ]
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
