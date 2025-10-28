"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function WelcomeGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAuth = () => {
      try {
        const hasAuth = sessionStorage.getItem("vnu-dashboard-auth") === "ok";
        const hasAccessToken = sessionStorage.getItem("accessToken") !== null;
        const hasWelcomePassed = sessionStorage.getItem("welcome-passed") === "ok";
        const isAuthenticated = hasAuth && hasAccessToken;

        // Chỉ log cho các trang cần check
        if (pathname === "/welcome" || pathname === "/login") {
          console.log("WelcomeGuard:", { pathname, isAuthenticated, hasWelcomePassed });
        }

        if (isAuthenticated) {
          // Đã đăng nhập - redirect về home nếu đang ở welcome/login
          if (pathname === "/welcome" || pathname === "/login") {
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
      } finally {
        setIsLoading(false);
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
  }, [pathname, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAuthChange = () => {
      console.log("Auth state changed, reloading page");
      window.location.reload();
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  // Hiển thị loading spinner nhỏ trong khi check
  if (isLoading && (pathname === "/welcome" || pathname === "/login")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}