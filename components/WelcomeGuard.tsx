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
        const isAuthenticated = hasAuth && hasAccessToken;
        
        console.log("WelcomeGuard check:", {
          pathname,
          hasAuth,
          hasAccessToken,
          hasWelcomePassed,
          isAuthenticated
        });
        
        // Tránh redirect loop - chỉ redirect 1 lần
        if (isChecking) {
          // Logic redirect đơn giản và rõ ràng
          if (isAuthenticated) {
            // Đã đăng nhập - không cho ở welcome/login
            if (pathname === "/welcome" || pathname === "/login") {
              console.log("Authenticated, redirecting to home from", pathname);
              router.replace("/");
            }
          } else {
            // Chưa đăng nhập
            if (pathname === "/login") {
              // Muốn vào login - phải pass welcome trước
              if (!hasWelcomePassed) {
                console.log("Need to pass welcome first");
                router.replace("/welcome");
              }
            } else if (pathname !== "/welcome") {
              // Muốn vào trang khác - phải đăng nhập
              console.log("Not authenticated, redirecting to welcome from", pathname);
              router.replace("/welcome");
            }
          }
          
          setIsChecking(false);
        }
      };

      checkAuth();

      // Listen for auth changes
      const handleAuthChange = () => {
        console.log("Auth state changed, rechecking...");
        setIsChecking(true);
      };

      window.addEventListener('storage', handleAuthChange);
      window.addEventListener('authStateChanged', handleAuthChange);
      
      return () => {
        window.removeEventListener('storage', handleAuthChange);
        window.removeEventListener('authStateChanged', handleAuthChange);
      };
    }
  }, [pathname, router, isChecking]);

  // Hiển thị loading hoặc trống trong khi đang kiểm tra
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}