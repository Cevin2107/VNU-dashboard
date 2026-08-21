"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { CalendarCheck2, BookOpenCheck, LogOut, UserCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import vnuLogo from "@/public/vnu_logo.png";
import { useCallback } from "react";

import { logoutAction } from "@/app/actions";

const tabs = [
	{ href: "/schedule", label: "Thời khóa biểu", icon: CalendarCheck2 },
	{ href: "/exam", label: "Lịch thi", icon: BookOpenCheck },
];

export default function HeaderNav({
	isSignIn,
	username,
	studentId,
	fullName
}: {
	isSignIn: boolean;
	username: string;
	studentId: string;
	fullName: string;
}) {
	const pathname = usePathname();

	const handleLogout = useCallback(async () => {
		sessionStorage.removeItem("accessToken");
		sessionStorage.removeItem("refreshToken");
		sessionStorage.removeItem("vnu-dashboard-auth");
		sessionStorage.removeItem("username");

		document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		document.cookie = "remember=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

		window.dispatchEvent(new CustomEvent('authStateChanged'));

		try {
			await logoutAction();
		} catch {
			// Fallback redirect if server action throws NEXT_REDIRECT
		}
		window.location.href = "/login";
	}, []);

	if (!isSignIn) return null;

	return (
		<header className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-3 sm:px-6 md:px-8 flex items-center justify-between transition-all">
			
			{/* Brand Logo & Title */}
			<Link href="/schedule" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
				<div className="bg-[#f2f0eb] rounded-xl p-1 sm:p-1.5 border border-slate-200 shadow-xs group-hover:bg-[#d4e9e2] transition-colors">
					<Image
						src={vnuLogo}
						alt="VNU Logo"
						width={28}
						height={28}
						className="object-contain select-none sm:w-8 sm:h-8"
						priority
					/>
				</div>
				<div className="hidden sm:block">
					<h1 className="text-sm sm:text-base font-black text-[#006241] tracking-tight leading-none flex items-center gap-1">
						VNU Portal <Sparkles className="w-3.5 h-3.5 text-[#00754A]" />
					</h1>
					<p className="text-[10px] font-semibold text-slate-400 mt-0.5">Sinh viên Đại học Quốc gia</p>
				</div>
			</Link>

			{/* Center Tab Switcher */}
			<div className="bg-[#f2f0eb] p-1 rounded-full border border-slate-200 shadow-inner flex items-center gap-1">
				{tabs.map((tab) => {
					const isActive = pathname === tab.href;
					const Icon = tab.icon;
					return (
						<Link
							key={tab.href}
							href={tab.href}
							className={cn(
								"btn-pill flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-full transition-all duration-200 select-none",
								isActive
									? "bg-[#00754A] text-white shadow-md shadow-[#00754A]/20 scale-100"
									: "text-slate-600 hover:text-[#006241] hover:bg-slate-200/50"
							)}
						>
							<Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform", isActive && "scale-110")} />
							<span>{tab.label}</span>
						</Link>
					);
				})}
			</div>

			{/* Student Badge & Logout */}
			<div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
				<div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#f2f0eb] border border-slate-200">
					<div className="w-6 h-6 rounded-full bg-[#00754A] flex items-center justify-center text-white font-bold text-[10px]">
						{fullName ? fullName.charAt(0).toUpperCase() : <UserCheck className="w-3 h-3" />}
					</div>
					<div className="text-left leading-tight">
						<p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{fullName || "Sinh viên"}</p>
						<p className="text-[10px] font-mono font-bold text-[#00754A]">{studentId || username}</p>
					</div>
				</div>

				<button
					onClick={handleLogout}
					className="btn-pill inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-full transition-all shadow-xs active:scale-95"
					title="Đăng xuất"
				>
					<LogOut className="w-3.5 h-3.5" />
					<span className="hidden sm:inline">Đăng xuất</span>
				</button>
			</div>
		</header>
	);
}
