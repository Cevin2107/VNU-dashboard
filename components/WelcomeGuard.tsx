"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function WelcomeGuard({ 
	children
}: { 
	children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;

    const checkAuth = () => {
      try {
        const hasAuth = sessionStorage.getItem("vnu-dashboard-auth") === "ok";
        const hasAccessToken = sessionStorage.getItem("accessToken") !== null;
        const hasWelcomePassed = sessionStorage.getItem("welcome-passed") === "ok";
        const isAuthenticated = hasAuth && hasAccessToken;

        // Chỉ log cho các trang cần check
        if (pathname === "/welcome" || pathname === "/login" || pathname === "/dashboard") {
          console.log("WelcomeGuard:", { pathname, isAuthenticated, hasWelcomePassed, hasAuth, hasAccessToken });
        }

        // Welcome redirect logic được xử lý bởi middleware
        // WelcomeGuard chỉ xử lý client-side auth state
        if (isAuthenticated) {
          // Đã đăng nhập - redirect về home nếu đang ở welcome/login
          if (pathname === "/welcome") {
            router.replace("/dashboard");
            return;
          }
          // Đã authenticated, không cần check gì thêm cho các trang khác
        } else {
          // Chưa đăng nhập
          if (pathname === "/login" && !hasWelcomePassed) {
            router.replace("/welcome");
            return;
          } else if (pathname !== "/welcome" && pathname !== "/login") {
            router.replace("/welcome");
            return;
          }
        }
      } catch (error) {
        console.error("WelcomeGuard error:", error);
      }
    };

    // Chỉ check khi cần thiết, không debounce cho các trang đã auth
    if (pathname === "/welcome" || pathname === "/login") {
      const timeoutId = setTimeout(checkAuth, 50);
      return () => clearTimeout(timeoutId);
    } else {
      // Cho các trang đã auth, check nhanh hơn
      checkAuth();
    }
  }, [pathname, router, isClient]);

  useEffect(() => {
    if (typeof window === "undefined" || !isClient) return;

    const handleAuthChange = () => {
      console.log("Auth state changed, checking auth...");
      // Check auth immediately
      const hasAuth = sessionStorage.getItem("vnu-dashboard-auth") === "ok";
      const hasAccessToken = sessionStorage.getItem("accessToken") !== null;
      console.log("Auth check after change:", { hasAuth, hasAccessToken });
      // window.location.reload();
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [isClient]);

  return <>{children}</>;
}