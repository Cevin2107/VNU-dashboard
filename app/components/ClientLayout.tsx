"use client";

import WelcomeGuard from "../../components/WelcomeGuard";
import { SidebarProvider } from "@/components/ui/sidebar";
import ClientSideBarWrapper from "../components/ClientSideBarWrapper";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from "react";

export default function ClientLayout({ 
	children,
	welcomeEnabled = true 
}: { 
	children: React.ReactNode;
	welcomeEnabled?: boolean;
}) {
	useEffect(() => {
		// Register service worker for PWA
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/sw.js')
				.then((registration) => {
					console.log('Service Worker registered:', registration);
				})
				.catch((error) => {
					console.log('Service Worker registration failed:', error);
				});
		}
	}, []);

	return (
		<WelcomeGuard welcomeEnabled={welcomeEnabled}>
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 relative">
				<SidebarProvider defaultOpen={false}>
					<ClientSideBarWrapper welcomeEnabled={welcomeEnabled}>
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