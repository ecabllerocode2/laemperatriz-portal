import { createBrowserRouter, RouterProvider } from "react-router-dom";

function PlaceholderPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-silk">
      <p className="text-neutral-silver">Portal — en construcción</p>
    </main>
  );
}

const router = createBrowserRouter([{ path: "*", element: <PlaceholderPage /> }]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
