"use client";

import { useState, useEffect } from "react";
import ConditionalSideBar from "./ConditionalSideBar";
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
			setIsSignIn(hasAuth);
			setUsername(storedUsername);

			// Fetch student info if logged in
			if (hasAuth) {
				try {
					const accessToken = sessionStorage.getItem("accessToken");
					const refreshToken = sessionStorage.getItem("refreshToken");
					
					if (accessToken) {
						const apiHandler = new ClientAPIHandler(accessToken, refreshToken);
						const svInfo = await apiHandler.getInfoSinhVien();
						setStudentId(svInfo.maSinhVien);
						setFullName(svInfo.hoVaTen);
					}
				} catch (error) {
					console.error("Error fetching student info:", error);
				}
			} else {
				setStudentId("");
				setFullName("");
			}
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
			<ConditionalSideBar 
				isSignIn={isSignIn} 
				username={username}
				studentId={studentId}
				fullName={fullName}
			/>
			{children}
		</>
	);
}
