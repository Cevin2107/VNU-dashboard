import ProtectedRoute from "@/components/ProtectedRoute";
import HomeContent from "./homeContent";

export default async function Page() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}