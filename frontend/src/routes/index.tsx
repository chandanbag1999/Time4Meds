import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "../App";
import { Dashboard } from "./Dashboard";
import { ProtectedPage } from "@/components/ProtectedPage";
import { 
  SignUpPage, 
  SignInPage, 
  CreatePinPage, 
  EnterPinPage 
} from "./auth";

// Create a browser router with routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedPage>
        <Dashboard />
      </ProtectedPage>
    ),
  },
  // Auth routes
  {
    path: "/auth/sign-up",
    element: <SignUpPage />,
  },
  {
    path: "/auth/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/auth/create-pin",
    element: (
      <ProtectedPage>
        <CreatePinPage />
      </ProtectedPage>
    ),
  },
  {
    path: "/auth/enter-pin",
    element: (
      <ProtectedPage>
        <EnterPinPage />
      </ProtectedPage>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
} 