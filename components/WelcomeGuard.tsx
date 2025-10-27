"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function WelcomeGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkAuth = () => {
        const hasAuth = sessionStorage.getItem("vnu-dashboard-auth") === "ok";
        const hasAccessToken = sessionStorage.getItem("accessToken") !== null;
        const hasWelcomePassed = sessionStorage.getItem("welcome-passed") === "ok";
        const isAuthenticated = hasAuth || hasAccessToken;
        
        console.log("WelcomeGuard - pathname:", pathname, "hasAuth:", hasAuth, "hasAccessToken:", hasAccessToken, "hasWelcomePassed:", hasWelcomePassed, "isAuthenticated:", isAuthenticated);
        
        // Logic redirect rõ ràng
        if (!isAuthenticated) {
          // Chưa đăng nhập - chỉ cho phép ở welcome và login (nếu đã pass welcome)
          if (pathname === "/login" && !hasWelcomePassed) {
            console.log("Trying to access login without passing welcome, redirecting to welcome");
            router.replace("/welcome");
          } else if (pathname !== "/welcome" && pathname !== "/login") {
            console.log("Not authenticated, redirecting to welcome");
            router.replace("/welcome");
          }
        } else {
          // Đã đăng nhập - không cho phép ở welcome và login
          if (pathname === "/welcome" || pathname === "/login") {
            console.log("Authenticated but on welcome/login, redirecting to home");
            router.replace("/");
          }
        }
      };

      checkAuth();
      setIsChecking(false);

      // Listen for storage changes (when tokens are cleared)
      const handleStorageChange = () => {
        checkAuth();
      };

      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [pathname, router]);

  // Hiển thị loading trong khi đang kiểm tra
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}