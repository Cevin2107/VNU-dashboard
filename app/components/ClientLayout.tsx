"use client";

import WelcomeGuard from "../../components/WelcomeGuard";
import { SidebarProvider } from "@/components/ui/sidebar";
import ClientSideBarWrapper from "../components/ClientSideBarWrapper";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<WelcomeGuard>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 relative">
				<SidebarProvider defaultOpen={false}>
					<ClientSideBarWrapper>
						<main className="w-full min-h-screen">
							{children}
						</main>
					</ClientSideBarWrapper>
				</SidebarProvider>
			</div>
			<Analytics />
			<SpeedInsights />
		</WelcomeGuard>
	);
}