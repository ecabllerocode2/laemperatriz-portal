import { Navigate, Outlet, useLocation } from "react-router-dom";
import { loginPathWithReturn } from "@/lib/auth-redirect";
import { useAuthStore } from "@/stores/auth.store";

export default function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-pearl">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={loginPathWithReturn(returnTo)} replace />;
  }

  return <Outlet />;
}
