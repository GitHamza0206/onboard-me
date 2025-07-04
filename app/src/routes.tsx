// src/routes.tsx
import { createBrowserRouter, Outlet, RouterProvider, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./app/auth/ProtectedRoute";
import { AuthProvider } from "./app/auth/authContext";
import { AuthPage } from "./app/auth/page";
import { RegisterPage } from "./app/auth/register";
import { OnboardingPage } from "./app/course/page";
import Layout from "./layout";
import { DashboardPage } from "./app/dashboard/DashboardPage";
import { MainLayout } from "./layouts/MainLayout";
import { BackLayout } from "./layouts/BackLayout";

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
        element: (
          // <ProtectedRoute>
            <MainLayout />
          // </ProtectedRoute>
        ),
        children: [
          { path: "/home", element: <DashboardPage /> }, // Note : DashboardPage s'affichera dans le <Outlet> de MainLayout
        ],
      },
            {
        element: (
          // <ProtectedRoute>
            <BackLayout />
          // </ProtectedRoute>
        ),
        children: [
          { path: "/course-onboarding", element: <OnboardingPage /> },
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
