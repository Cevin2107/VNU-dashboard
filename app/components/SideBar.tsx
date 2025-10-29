"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { 
	BookOpenCheck,
	GraduationCap, 
	House, 
	CalendarCheck2, 
	CircleUser,
	LogOut,
	BadgeX,
	Menu,
	X
} from "lucide-react";
import { 
	Sidebar, 
	SidebarContent, 
	SidebarFooter, 
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	useSidebar
} from "@/components/ui/sidebar";
import { 
	Tooltip, 
	TooltipContent, 
	TooltipTrigger 
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import vnuLogo from "@/public/vnu_logo.png";
import { logoutAction } from "../actions";
import { useRouter } from "next/navigation";

const routes = [
	{ href: "/dashboard", label: "Trang chủ", icon: House },
	{ href: "/gpa", label: "Điểm", icon: GraduationCap },
	{ href: "/schedule", label: "Thời khóa biểu", icon: CalendarCheck2 },
	{ href: "/exam", label: "Lịch thi", icon: BookOpenCheck },
];

export default function SideBar({ 
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
	const { open, setOpen } = useSidebar();
	const [showAlert, setShowAlert] = useState(false);
	const router = useRouter();

	const handleLinkClick = (e: React.MouseEvent) => {
		if (!isSignIn) {
			e.preventDefault();
			setShowAlert(true);
			setTimeout(() => setShowAlert(false), 3000);
		} else {
			// Close sidebar after clicking a link
			setOpen(false);
		}
	};

	const handleLogout = () => {
		sessionStorage.removeItem("accessToken");
		sessionStorage.removeItem("refreshToken");
		sessionStorage.removeItem("vnu-dashboard-auth");
		sessionStorage.removeItem("username");
		sessionStorage.removeItem("welcome-passed");
		
		document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		document.cookie = "remember=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		
		window.dispatchEvent(new CustomEvent('authStateChanged'));
		router.push("/welcome");
	};

	return (
		<>
			{/* Hamburger Menu Button - Fixed position */}
			<button
				onClick={() => setOpen(!open)}
				className="fixed top-4 left-4 z-50 p-2 rounded-xl glass-modern hover:shadow-lg transition-all duration-300 group"
				aria-label="Toggle menu"
			>
				{open ? (
					<X className="w-6 h-6 text-gray-700 dark:text-gray-200 group-hover:rotate-90 transition-transform duration-300" />
				) : (
					<Menu className="w-6 h-6 text-gray-700 dark:text-gray-200 group-hover:scale-110 transition-transform duration-300" />
				)}
			</button>

			{/* Glassmorphism Backdrop Overlay */}
			{open && (
				<div 
					className="fixed inset-0 z-40 backdrop-blur-md bg-black/20 dark:bg-black/40 transition-all duration-300"
					onClick={() => setOpen(false)}
				/>
			)}

			{showAlert && (
				<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] w-full max-w-md px-4">
					<Alert className="glass-modern border-red-300 dark:border-red-700">
						<AlertDescription className="text-red-800 dark:text-red-200 font-medium flex items-center gap-2">
							<BadgeX />
							Bạn cần đăng nhập để truy cập tính năng này!
						</AlertDescription>
					</Alert>
				</div>
			)}

			{/* Sidebar - Overlay Mode */}
			<div className={cn(
				"fixed left-0 top-0 h-full z-50 transition-transform duration-300 ease-out",
				open ? "translate-x-0" : "-translate-x-full"
			)}>
				<Sidebar 
					variant="sidebar" 
					collapsible="none"
					className="h-full glass-modern border-r border-white/30 dark:border-gray-700/50 shadow-2xl w-64"
				>
					<SidebarHeader className="flex items-center justify-center pt-16 pb-4">
						<Image
							src={vnuLogo}
							alt="VNU Logo"
							width={120}
							height={120}
							className="mb-2 select-none"
							draggable={false}
						/>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild className="hover:bg-transparent active:bg-transparent cursor-default">
									<div className="flex items-center gap-3">
										<CircleUser size={32} className="text-gray-700 dark:text-gray-200" />
										<div className="text-left flex-1 min-w-0">
											{isSignIn ? (
												<>
													<div className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
														{studentId || username}
													</div>
													<div className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
														{fullName || username}
													</div>
												</>
											) : (
												<span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
													Hello!
												</span>
											)}
										</div>
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarHeader>
					
					<Separator className="bg-white/30 dark:bg-gray-700/50" />
					
					<SidebarContent className="px-3 py-4">
						<SidebarMenu className="space-y-2">
							{routes.map((route) => (
								<SidebarMenuItem key={route.href}>
									<Tooltip>
										<TooltipTrigger asChild>
											<SidebarMenuButton
												asChild
												isActive={pathname === route.href}
												className={cn(
													"group relative overflow-hidden rounded-xl transition-all duration-300 ease-out h-12",
													"hover:bg-white/30 dark:hover:bg-gray-700/30 hover:shadow-lg",
													pathname === route.href && "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
												)}
											>
												<Link 
													href={route.href}
													onClick={(e) => handleLinkClick(e)}
													className="flex items-center gap-3 w-full px-3"
												>
													<div className={cn(
														"flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300",
														pathname === route.href 
															? "bg-white/20 text-white" 
															: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
													)}>
														<route.icon size={20} />
													</div>
													<span className={cn(
														"font-medium transition-all duration-300 text-base",
														pathname === route.href ? "text-white" : "text-gray-800 dark:text-gray-100"
													)}>
														{route.label}
													</span>
												</Link>
											</SidebarMenuButton>
										</TooltipTrigger>
										<TooltipContent side="right">
											{route.label}
										</TooltipContent>
									</Tooltip>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarContent>
					
					<Separator className="bg-white/30 dark:bg-gray-700/50" />
					
					<SidebarFooter className="p-3">
						{isSignIn && (
							<Button
								variant="outline"
								className={cn(
									"w-full h-12 rounded-xl font-medium text-base",
									"border-red-300 dark:border-red-700 text-red-600 dark:text-red-400",
									"hover:bg-red-500 hover:text-white hover:border-red-500",
									"transition-all duration-300 ease-out shadow-sm hover:shadow-lg",
									"glass-input"
								)}
								onClick={handleLogout}
							>
								<div className="flex items-center gap-2">
									<LogOut size={20} />
									<span>Đăng xuất</span>
								</div>
							</Button>
						)}
					</SidebarFooter>
				</Sidebar>
			</div>
		</>
	);
}
