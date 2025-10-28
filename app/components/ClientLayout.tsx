"use client";

import WelcomeGuard from "../../components/WelcomeGuard";
import { SidebarProvider } from "@/components/ui/sidebar";
import ClientSideBarWrapper from "../components/ClientSideBarWrapper";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<WelcomeGuard>
			<div className="min-h-screen bg-background">
				<SidebarProvider>
					<ClientSideBarWrapper>
						<main className="flex justify-center items-center w-full min-h-screen overflow-y-auto">
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