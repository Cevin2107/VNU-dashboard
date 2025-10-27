"use client";

import { useState, useTransition } from "react";
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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeInfo } from "lucide-react";
import PasswordInput from "./PasswordInput";
import { useRouter } from "next/navigation";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";

export default function LoginForm() {
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setIsPending(true);

		try {
			const formData = new FormData(e.currentTarget);
			const username = formData.get("username") as string;
			const password = formData.get("password") as string;

			// Sử dụng ClientAPIHandler để đăng nhập
			const apiHandler = new ClientAPIHandler();
			const response = await apiHandler.signin(username, password);

			// Lưu tokens vào sessionStorage và cookies
			sessionStorage.setItem("accessToken", response.accessToken);
			sessionStorage.setItem("refreshToken", response.refreshToken);
			sessionStorage.setItem("vnu-dashboard-auth", "ok");
			sessionStorage.setItem("username", username);

			// Lưu vào cookies để server-side có thể truy cập
			document.cookie = `accessToken=${response.accessToken}; path=/; SameSite=Lax`;
			document.cookie = `refreshToken=${response.refreshToken}; path=/; SameSite=Lax`;
			document.cookie = `remember=true; path=/; SameSite=Lax`;

			// Dispatch custom event to notify other components
			window.dispatchEvent(new CustomEvent('authStateChanged'));

			// Redirect về trang chủ
			router.push("/");
		} catch (err) {
			console.error("Login failed:", err);
			setError("Sai tài khoản hoặc mật khẩu");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="w-full">
			<Card className="min-w-xl max-w-lg mx-auto glass-card animate-fade-in-card">
				<CardHeader>
					<CardTitle className="text-center text-2xl font-bold text-black drop-shadow-lg tracking-wide">Đăng nhập sinh viên</CardTitle>
					<CardDescription>
						<Alert className="mt-2 w-full bg-gradient-to-r from-yellow-200/60 to-pink-200/60 border-0 shadow-md backdrop-blur-xl">
							<BadgeInfo color="#ffb900" strokeWidth={2.5} />
							<AlertDescription className="text-amber-500 font-medium">
								Đăng nhập bằng tài khoản OneVNU (idp.vnu.edu.vn) của bạn.<br />
								<span className="text-xs text-gray-700">Hệ thống không lưu lại thông tin đăng nhập.</span>
							</AlertDescription>
						</Alert>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-6">
						<div className="grid gap-2">
							<Label htmlFor="username" className="text-black/90">Mã sinh viên</Label>
							<Input
								name="username"
								id="username"
								type="text"
								placeholder="240*****"
								required
								disabled={isPending}
								className="glass-input"
							/>
						</div>
						<div className="grid gap-2">
							<div className="flex items-center">
								<Label htmlFor="password" className="text-black/90">Mật khẩu</Label>
							</div>
							<PasswordInput disabled={isPending} className="glass-input" />
							{error && !isPending && (
								<p className="text-red-400 text-sm animate-shake">
									{error}
								</p>
							)}
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox id="remember" name="remember" />
							<Label htmlFor="remember" className="text-black/80">Duy trì đăng nhập</Label>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex-col gap-2">
					<Button type="submit" className="w-full glass-btn text-black" disabled={isPending}>
						{isPending ? "Đang đăng nhập..." : "Đăng nhập"}
					</Button>
				</CardFooter>
			</Card>
			<style jsx global>{`
			  .glass-card {
				background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(180,200,255,0.22) 100%);
				backdrop-filter: blur(24px) saturate(1.2);
				border: 1.5px solid rgba(255,255,255,0.25);
				box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
				border-radius: 2rem;
				transition: box-shadow 0.3s, transform 0.3s;
			  }
			  .glass-card:hover {
				box-shadow: 0 12px 48px 0 rgba(31, 38, 135, 0.28);
				transform: scale(1.012);
			  }
				.glass-input {
					background: rgba(255,255,255,0.35);
					border: 1.2px solid rgba(255,255,255,0.25);
					backdrop-filter: blur(8px);
					color: #111;
					font-weight: 500;
					transition: border 0.2s, box-shadow 0.2s;
				}
			  .glass-input:focus {
				border: 1.5px solid #7f9cf5;
				box-shadow: 0 0 0 2px #7f9cf5;
			  }
				.glass-btn {
					background: linear-gradient(90deg, #e0ffe0 0%, #e0e7ff 100%);
					color: #111;
					box-shadow: 0 2px 12px 0 rgba(50,205,50,0.10);
					border-radius: 1.2rem;
					font-weight: 600;
					transition: background 0.2s, transform 0.2s, color 0.2s;
					border: 1px solid #e0e0e0;
				}
				.glass-btn:hover {
					background: linear-gradient(90deg, #e0e7ff 0%, #e0ffe0 100%);
					color: #222;
					transform: scale(1.03);
				}
			  @keyframes shake {
				10%, 90% { transform: translateX(-2px); }
				20%, 80% { transform: translateX(4px); }
				30%, 50%, 70% { transform: translateX(-8px); }
				40%, 60% { transform: translateX(8px); }
			  }
			  .animate-shake {
				animation: shake 0.4s;
			  }
			`}</style>
		</form>
	);
}