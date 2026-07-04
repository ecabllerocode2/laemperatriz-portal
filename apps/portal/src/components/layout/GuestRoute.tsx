import { Navigate, useSearchParams } from "react-router-dom";
import { resolveReturnTo } from "@/lib/auth-redirect";
import { useAuthStore } from "@/stores/auth.store";

export default function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const [searchParams] = useSearchParams();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-pearl">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={resolveReturnTo(searchParams)} replace />;
  }

  return children;
}
