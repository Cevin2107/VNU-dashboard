"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastItem {
	id: string;
	type: "success" | "error" | "info";
	message: string;
}

export function showToast(message: string, type: "success" | "error" | "info" = "success") {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("vnu-toast", {
			detail: { message, type }
		}));
	}
}

export default function ToastProvider() {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	useEffect(() => {
		const handleToastEvent = (e: Event) => {
			const customEvent = e as CustomEvent<{ message: string; type: "success" | "error" | "info" }>;
			if (!customEvent.detail) return;

			const newToast: ToastItem = {
				id: Math.random().toString(36).substring(2, 9),
				type: customEvent.detail.type || "success",
				message: customEvent.detail.message,
			};

			setToasts((prev) => [...prev, newToast]);

			setTimeout(() => {
				removeToast(newToast.id);
			}, 3500);
		};

		window.addEventListener("vnu-toast", handleToastEvent);
		return () => {
			window.removeEventListener("vnu-toast", handleToastEvent);
		};
	}, [removeToast]);

	if (toasts.length === 0) return null;

	return (
		<div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none">
			{toasts.map((toast) => (
				<div
					key={toast.id}
					className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-5 fade-in ${
						toast.type === "success"
							? "bg-[#00754A] border-[#006241] text-white"
							: toast.type === "error"
							? "bg-rose-600 border-rose-700 text-white"
							: "bg-[#1E3932] border-slate-800 text-white"
					}`}
				>
					<div className="flex items-center gap-2 text-xs font-bold">
						{toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />}
						{toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-200 flex-shrink-0" />}
						{toast.type === "info" && <Info className="w-4 h-4 text-blue-200 flex-shrink-0" />}
						<span>{toast.message}</span>
					</div>
					<button
						onClick={() => removeToast(toast.id)}
						className="text-white/80 hover:text-white transition-colors"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</div>
			))}
		</div>
	);
}
