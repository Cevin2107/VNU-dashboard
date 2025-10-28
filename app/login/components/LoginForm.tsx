"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Alert,
	AlertDescription,
} from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeInfo } from "lucide-react";
import PasswordInput from "./PasswordInput";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";

export default function LoginForm() {
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		try {
			const formData = new FormData(e.currentTarget);
			const username = formData.get("username") as string;
			const password = formData.get("password") as string;

			console.log("Login attempt:", { username, password: password ? "***" : "" });

			// Sử dụng ClientAPIHandler để đăng nhập
			const apiHandler = new ClientAPIHandler();
			const response = await apiHandler.signin(username, password);

			console.log("Signin result:", response);

			// Lưu tokens vào sessionStorage và cookies
			sessionStorage.setItem("accessToken", response.accessToken);
			sessionStorage.setItem("refreshToken", response.refreshToken);
			sessionStorage.setItem("vnu-dashboard-auth", "ok");
			sessionStorage.setItem("username", username);

			// Lưu vào cookies để server-side có thể truy cập
			document.cookie = `accessToken=${response.accessToken}; path=/; SameSite=Lax`;
			document.cookie = `refreshToken=${response.refreshToken}; path=/; SameSite=Lax`;

			// Dispatch custom event to notify other components
			setTimeout(() => {
				window.dispatchEvent(new CustomEvent('authStateChanged'));
			}, 100);

			// Redirect về trang chủ sau khi đăng nhập thành công
			router.push("/dashboard");
		} catch (err) {
			console.error("Login failed:", err);
			setError("Sai tài khoản hoặc mật khẩu");
		}
	};

	return (
		<div>
			{/* Fullscreen overlay to block the entire app (including sidebar) */}
			<div className="fixed inset-0 z-[2000] flex items-center justify-center bg-gradient-to-br from-sky-50/60 via-white/30 to-violet-50/60 overflow-hidden">
				{/* Decorative blurred shapes */}
				<div className="absolute -left-16 -top-16 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-cyan-200/30 rounded-full filter blur-3xl opacity-60" />
				<div className="absolute -right-16 -bottom-16 w-64 h-64 bg-gradient-to-br from-pink-200/30 to-yellow-200/20 rounded-full filter blur-3xl opacity-50" />

				<div className="relative w-full max-w-lg px-4 py-8">
					<div className="absolute inset-0 rounded-3xl bg-white/6 border border-white/20 shadow-2xl -z-10" />
					<div className="relative bg-white/30 border border-white/25 rounded-3xl p-6 shadow-2xl">
						{/* Header with Icon */}
						<div className="text-center mb-6">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 shadow-lg">
								<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</div>
							<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
								Đăng nhập
							</h1>
							<p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
								Truy cập vào tài khoản của bạn
							</p>
						</div>

						{/* Alert */}
						<div className="mb-4">
							<Alert className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
								<BadgeInfo className="h-4 w-4 text-amber-600 dark:text-amber-400" />
								<AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
									Đăng nhập bằng tài khoản OneVNU (idp.vnu.edu.vn)
								</AlertDescription>
							</Alert>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
							<div>
								<Label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Mã sinh viên
								</Label>
								<div className="relative">
									<Input
										name="username"
										id="username"
										type="text"
										placeholder="240*****"
										required
										className="w-full px-4 py-3 pl-12 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
									/>
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
									</div>
								</div>
							</div>

							<div>
								<Label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Mật khẩu
								</Label>
								<div className="relative">
									<PasswordInput
										className="w-full px-4 py-3 pl-12 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
									/>
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
									</div>
								</div>
							</div>

							{error && (
								<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-3">
									<div className="flex items-center">
										<svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
									</div>
								</div>
							)}

							<Button
								type="submit"
								className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<div className="flex items-center justify-center">
									<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
									</svg>
									Đăng nhập
								</div>
							</Button>
						</form>

						{/* Footer */}
						<div className="mt-6 pt-4 border-t border-white/20 dark:border-gray-700/30">
							<p className="text-xs text-center text-gray-500 dark:text-gray-400">
								Hệ thống không lưu trữ thông tin đăng nhập của bạn
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}