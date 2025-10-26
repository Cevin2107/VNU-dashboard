"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("vnu-dashboard-auth") !== "ok") {
        router.replace("/welcome");
      }
    }
  }, [router]);
  return <>{children}</>;
}