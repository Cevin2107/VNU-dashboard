"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./components/LoginForm";

export default function LoginPageClient() {
	const router = useRouter();

	// Nếu đã đăng nhập rồi (có cookie accessToken), chuyển hướng về trang chủ
	useEffect(() => {
		if (typeof window !== "undefined") {
			const cookies = document.cookie;
			if (cookies.includes("accessToken")) {
				router.replace("/");
			}
		}
	}, [router]);
	
	return <LoginForm />;
}