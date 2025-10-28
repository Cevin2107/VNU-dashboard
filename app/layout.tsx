import "@/app/globals.css";

import { Metadata } from "next";
import ClientLayout from "./components/ClientLayout";

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
				<ClientLayout>
					{children}
				</ClientLayout>
			</body>
		</html>
	);
}