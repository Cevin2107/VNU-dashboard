"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function WelcomeGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasAuth = localStorage.getItem("vnu-dashboard-auth") === "ok";
      
      // Nếu chưa có auth và không phải đang ở trang welcome
      if (!hasAuth && pathname !== "/welcome") {
        router.replace("/welcome");
      } 
      // Nếu đã có auth và đang ở trang welcome
      else if (hasAuth && pathname === "/welcome") {
        router.replace("/login");
      }
      
      setIsChecking(false);
    }
  }, [pathname, router]);

  // Hiển thị loading trong khi đang kiểm tra
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}