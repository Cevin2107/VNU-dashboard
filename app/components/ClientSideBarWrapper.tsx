"use client";

import { useState, useEffect } from "react";
import ConditionalSideBar from "./ConditionalSideBar";

export default function ClientSideBarWrapper({ children }: { children: React.ReactNode }) {
	const [isSignIn, setIsSignIn] = useState(false);
	const [username, setUsername] = useState("");

	useEffect(() => {
		if (typeof window === "undefined") return;

		const updateAuthState = () => {
			const hasAuth = sessionStorage.getItem("vnu-dashboard-auth") === "ok";
			const storedUsername = sessionStorage.getItem("username") || "";
			setIsSignIn(hasAuth);
			setUsername(storedUsername);
		};

		// Initial check
		updateAuthState();

		// Only listen for authStateChanged, not storage (to avoid conflicts)
		const handleAuthStateChange = () => {
			updateAuthState();
		};

		window.addEventListener('authStateChanged', handleAuthStateChange);

		return () => {
			window.removeEventListener('authStateChanged', handleAuthStateChange);
		};
	}, []);

	return (
		<>
			<ConditionalSideBar isSignIn={isSignIn} username={username} />
			{children}
		</>
	);
}
