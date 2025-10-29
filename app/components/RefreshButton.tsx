"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshButton({ className = "" }: { className?: string }) {
	const router = useRouter();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = () => {
		setIsRefreshing(true);
		router.refresh();
		setTimeout(() => {
			setIsRefreshing(false);
		}, 1000);
	};

	return (
		<Button
			onClick={handleRefresh}
			disabled={isRefreshing}
			className={`rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 px-3 py-2 h-auto ${className}`}
		>
			<RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
			{isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
		</Button>
	);
}
