import "@/app/globals.css";

import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ConditionalSideBar from "./components/ConditionalSideBar";
import { Suspense } from "react";
import Loading from "./loading";
import { SidebarProvider } from "@/components/ui/sidebar";
import WelcomeGuard from "../components/WelcomeGuard";

export const metadata: Metadata = {
	title: {
		default: "VNU Dashboard",
		template: "%s | VNU Dashboard"
	},
	description: "A general dashboard for VNU students",
	authors: {
		name: "nguen",
		url: "https://github.com/gawgua"
	},
	keywords: ["VNU", "Dashboard", "Student", "University", "Vietnam"],
};

function ClientSideBarWrapper({ children }: { children: React.ReactNode }) {
	// Lấy trạng thái đăng nhập và username ở client
	// Có thể dùng context hoặc localStorage/cookie ở đây nếu cần
	return <>{children}</>;
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="vi">
			<body>
				<WelcomeGuard>
					<div className="min-h-screen bg-background">
						<SidebarProvider>
							<ClientSideBarWrapper>
								<ConditionalSideBar isSignIn={false} username="" />
							</ClientSideBarWrapper>
							<main className="flex justify-center items-center w-full min-h-screen overflow-y-auto">
								<Suspense fallback={<Loading />}>
									{children}
								</Suspense>
							</main>
						</SidebarProvider>
					</div>
					<Analytics />
					<SpeedInsights />
				</WelcomeGuard>
			</body>
		</html>
	);
}