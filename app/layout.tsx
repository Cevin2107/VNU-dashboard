import "@/app/globals.css";

import { Metadata, Viewport } from "next";
import ClientLayout from "./components/ClientLayout";
import { getWelcomeEnabled } from "./settings/actions";

// Force dynamic rendering vì Edge Config fetch là dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
	title: {
		default: "VNU Dashboard",
		template: "%s | VNU Dashboard"
	},
	description: "Dashboard quản lý thông tin sinh viên VNU",
	authors: {
		name: "nguen",
		url: "https://github.com/gawgua"
	},
	keywords: ["VNU", "Dashboard", "Student", "University", "Vietnam"],
	manifest: "/manifest.json",
	icons: {
		icon: "/vnu_logo.png",
		apple: "/vnu_logo.png",
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "VNU Dashboard",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0f172a" },
	],
};

export default async function Layout({ children }: { children: React.ReactNode }) {
	const welcomeEnabled = await getWelcomeEnabled();
	
	return (
		<html lang="vi">
			<head>
				<link rel="manifest" href="/manifest.json" />
				<link rel="apple-touch-icon" href="/vnu_logo.png" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="VNU Dashboard" />
				<meta name="format-detection" content="telephone=no" />
			</head>
			<body>
				<ClientLayout welcomeEnabled={welcomeEnabled}>
					{children}
				</ClientLayout>
			</body>
		</html>
	);
}