// src/routes.tsx
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./app/auth/ProtectedRoute";
import { AuthProvider } from "./app/auth/authContext";
import { AuthPage } from "./app/auth/page";
import { OnboardingPage } from "./app/course/page";
import Layout from "./layout";
import { DashboardPage } from "./app/dashboard/DashboardPage";
import { MainLayout } from "./layouts/MainLayout";
import { BackLayout } from "./layouts/BackLayout";
import { ForgotPasswordPage } from "./app/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./app/auth/ResetPasswordPage";

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
      { path: "/forgot-password", element: <Layout><ForgotPasswordPage /></Layout> }, // NOUVELLE ROUTE
      { path: "/reset-password", element: <Layout><ResetPasswordPage /></Layout> }, // NOUVELLE ROUTE
      {
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "/home", element: <DashboardPage /> }, // Note : DashboardPage s'affichera dans le <Outlet> de MainLayout
        ],
      },
      {
        element: (
          <ProtectedRoute>
            <BackLayout />
          </ProtectedRoute>
        ),
        children: [
        ],
      },
      {
        element: (
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        ),
        children: [
          { path: "/course-onboarding/:courseId", element: <Outlet /> },
        ],
      },
      { path: "/", element: <Navigate to="/home" replace /> },
      { path: "*", element: <Navigate to="/home" replace /> },
    ]
  }
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
