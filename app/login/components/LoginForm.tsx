"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, User, Lock, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import PasswordInput from "./PasswordInput";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";

export default function LoginForm() {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [username] = useState("24022713");
	const router = useRouter();

	useEffect(() => {
		// Clear stale auth tokens on mounting login page
		sessionStorage.removeItem("accessToken");
		sessionStorage.removeItem("refreshToken");
		sessionStorage.removeItem("vnu-dashboard-auth");
		sessionStorage.removeItem("username");
		document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
	}, []);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const formData = new FormData(e.currentTarget);
			const password = formData.get("password") as string;

			const apiHandler = new ClientAPIHandler();
			const response = await apiHandler.signin(username, password);

			sessionStorage.setItem("accessToken", response.accessToken);
			sessionStorage.setItem("refreshToken", response.refreshToken);
			sessionStorage.setItem("vnu-dashboard-auth", "ok");
			sessionStorage.setItem("username", username);

			document.cookie = `accessToken=${response.accessToken}; path=/; SameSite=Lax`;
			document.cookie = `refreshToken=${response.refreshToken}; path=/; SameSite=Lax`;

			window.dispatchEvent(new CustomEvent('authStateChanged'));
			router.push("/schedule");
		} catch (err: unknown) {
			console.error("Login failed:", err);
			const message = err instanceof Error ? err.message : "Sai tài khoản hoặc mật khẩu";
			setError(message);
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#f2f0eb] overflow-y-auto px-3 sm:px-4 py-6">
			<div className="relative w-full max-w-md my-auto">
				<div className="surface-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200/80 relative overflow-hidden">
					{/* Header */}
					<div className="text-center mb-5 sm:mb-6">
						<div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#006241] mb-2.5 sm:mb-3 shadow-md">
							<ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
						</div>
						<h1 className="text-xl sm:text-2xl font-black text-[#006241] mb-1 tracking-tight">
							Cổng Đăng Nhập VNU
						</h1>
						<p className="text-[11px] sm:text-xs text-slate-500 font-medium">
							Trang cá nhân cho sinh viên <span className="font-mono font-bold text-[#00754A]">24022713</span>
						</p>
					</div>

					{/* Notice */}
					<div className="mb-4 sm:mb-5">
						<Alert className="bg-[#d4e9e2]/40 border border-[#00754A]/30 rounded-xl sm:rounded-2xl p-3">
							<Sparkles className="h-4 w-4 text-[#00754A] flex-shrink-0 mt-0.5" />
							<AlertDescription className="text-[#006241] text-[11px] sm:text-xs font-semibold leading-relaxed">
								Chào mừng bạn trở lại, vinh quang đang ở trước mắt.
							</AlertDescription>
						</Alert>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
						<div>
							<Label htmlFor="username" className="block text-[11px] sm:text-xs font-bold text-[#006241] uppercase tracking-wider mb-1">
								Mã Sinh Viên
							</Label>
							<div className="relative">
								<Input
									name="username"
									id="username"
									type="text"
									value={username}
									readOnly
									className="w-full px-3.5 py-2 sm:py-2.5 pl-10 rounded-full border border-slate-200 text-slate-900 bg-slate-100/80 font-mono font-bold text-xs cursor-not-allowed select-none focus:ring-0"
								/>
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<User className="w-4 h-4 text-[#00754A]" />
								</div>
							</div>
						</div>

						<div>
							<Label htmlFor="password" className="block text-[11px] sm:text-xs font-bold text-[#006241] uppercase tracking-wider mb-1">
								Mật Khẩu VNU
							</Label>
							<div className="relative">
								<PasswordInput
									autoFocus
									className="w-full px-3.5 py-2 sm:py-2.5 pl-10 rounded-full border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-[#00754A]"
								/>
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="w-4 h-4 text-slate-400" />
								</div>
							</div>
						</div>

						{error && (
							<div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
								<div className="flex items-center gap-2 text-rose-700">
									<AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
									<p className="text-xs font-semibold">{error}</p>
								</div>
							</div>
						)}

						<Button
							type="submit"
							disabled={loading}
							className="btn-pill w-full bg-[#00754A] hover:bg-[#006241] text-white font-bold py-2.5 sm:py-3 px-4 shadow-md disabled:opacity-80 transition-all active:scale-[0.98] text-xs mt-2"
						>
							<div className="flex items-center justify-center gap-2">
								{loading ? (
									<>
										<RefreshCw className="w-4 h-4 animate-spin text-white" />
										<span>Đang kết nối VNU Portal...</span>
									</>
								) : (
									<span>Đăng Nhập</span>
								)}
							</div>
						</Button>
					</form>

					<div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 text-center">
						<p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
							VNU Student Portal • Personal Edition (24022713)
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}