"use client";

import ClientSideBarWrapper from "../components/ClientSideBarWrapper";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from "react";

import ToastProvider from "@/components/ui/toast-provider";

export default function ClientLayout({ 
	children
}: { 
	children: React.ReactNode;
}) {
	useEffect(() => {
		// Register Service Worker for PWA
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').then((reg) => {
				console.log('PWA Service Worker registered successfully:', reg.scope);
			}).catch((err) => {
				console.warn('PWA Service Worker registration error:', err);
			});
		}
	}, []);

	return (
		<div className="min-h-screen bg-[#f2f0eb] relative">
			<ToastProvider />
			<ClientSideBarWrapper>
				{children}
			</ClientSideBarWrapper>
			<Analytics />
			<SpeedInsights />
		</div>
	);
}