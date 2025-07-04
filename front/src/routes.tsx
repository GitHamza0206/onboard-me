import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import Layout from "./layout";
import {ProtectedRoute} from "./app/auth/ProtectedRoute";
import { AuthProvider } from "./app/auth/authContext";
import { AuthPage } from "./app/auth/page";
import { RegisterPage } from "./app/auth/register";
import { OnboardingPage } from "./app/course/page";

function Root() {
    return (
        <AuthProvider>
            <Outlet/>
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
        path: "/",
        element: (
          <ProtectedRoute>
            <Layout></Layout>
          </ProtectedRoute>
        )
      },
      {
        path: "*", element: <ProtectedRoute>
          <Layout></Layout>
        </ProtectedRoute>
      },
    ]
  }
]);

export default function AppRouter() {
    return <RouterProvider router={router}/>;
}
