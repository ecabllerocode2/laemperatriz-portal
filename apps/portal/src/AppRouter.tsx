import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import GuestRoute from "@/components/layout/GuestRoute";
import PortalLayout from "@/components/layout/PortalLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import CompleteRegistrationPage from "@/pages/auth/CompleteRegistrationPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import PaymentsPage from "@/pages/payments/PaymentsPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import PurchasesPage from "@/pages/purchases/PurchasesPage";
import ShippingPage from "@/pages/shipping/ShippingPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/completar-registro",
        element: <CompleteRegistrationPage />,
      },
      {
        element: <PortalLayout />,
        children: [
          { index: true, element: <PurchasesPage /> },
          { path: "envios", element: <ShippingPage /> },
          { path: "pagos", element: <PaymentsPage /> },
          { path: "perfil", element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
