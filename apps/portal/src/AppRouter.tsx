import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import PortalLayout from "@/components/layout/PortalLayout";
import StorePage from "@/pages/store/StorePage";
import StoreProductDetailPage from "@/pages/store/StoreProductDetailPage";

const router = createBrowserRouter([
  {
    element: <PortalLayout />,
    children: [
      { index: true, element: <StorePage /> },
      { path: "tienda/:productId", element: <StoreProductDetailPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
