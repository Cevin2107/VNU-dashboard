import "@/app/globals.css";

import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SidebarProvider } from "@/components/ui/sidebar";
import WelcomeGuard from "../components/WelcomeGuard";
import ClientSideBarWrapper from "./components/ClientSideBarWrapper";

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

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="vi">
			<body>
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
			</body>
		</html>
	);
}