"use client";
// ProtectedRoute không cần làm gì nữa vì WelcomeGuard đã xử lý
// Chỉ cần render children
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}