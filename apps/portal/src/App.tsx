import { useAuthSync } from "@/hooks/useAuthSync";
import AppRouter from "./AppRouter";

export default function App() {
  useAuthSync();
  return <AppRouter />;
}
