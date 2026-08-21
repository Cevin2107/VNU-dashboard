"use client";

import { useState, useEffect } from "react";
import HeaderNav from "./HeaderNav";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";

export default function ClientSideBarWrapper({ 
	children
}: { 
	children: React.ReactNode;
}) {
	const [isSignIn, setIsSignIn] = useState(false);
	const [username, setUsername] = useState("");
	const [studentId, setStudentId] = useState("");
	const [fullName, setFullName] = useState("");

	useEffect(() => {
		if (typeof window === "undefined") return;

		const updateAuthState = async () => {
			const hasAuth = sessionStorage.getItem("vnu-dashboard-auth") === "ok";
			const storedUsername = sessionStorage.getItem("username") || "";
			
			if (hasAuth) {
				try {
					const accessToken = sessionStorage.getItem("accessToken");
					const refreshToken = sessionStorage.getItem("refreshToken");
					
					if (accessToken) {
						const apiHandler = new ClientAPIHandler(accessToken, refreshToken);
						const svInfo = await apiHandler.getInfoSinhVien();
						if (svInfo) {
							setIsSignIn(true);
							setUsername(storedUsername);
							setStudentId(svInfo.maSinhVien || storedUsername);
							setFullName(svInfo.hoVaTen || "");
							return;
						}
					}
				} catch (error) {
					console.warn("Session token expired or invalid:", error);
					sessionStorage.removeItem("accessToken");
					sessionStorage.removeItem("refreshToken");
					sessionStorage.removeItem("vnu-dashboard-auth");
					sessionStorage.removeItem("username");
					document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
					document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
				}
			}

			setIsSignIn(false);
			setUsername("");
			setStudentId("");
			setFullName("");
		};

		// Initial check
		updateAuthState();

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
			<HeaderNav 
				isSignIn={isSignIn} 
				username={username}
				studentId={studentId}
				fullName={fullName}
			/>
			<main className="w-full min-h-screen">
				{children}
			</main>
		</>
	);
}
