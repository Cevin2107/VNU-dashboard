"use client";
import LoginForm from "./components/LoginForm";

export default function LoginPageClient() {
	// WelcomeGuard sẽ xử lý tất cả logic redirect
	// Không cần kiểm tra gì ở đây
	return <LoginForm />;
}