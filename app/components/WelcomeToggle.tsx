"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { getWelcomeEnabled, setWelcomeEnabled } from "@/app/settings/actions";
import { useRouter } from "next/navigation";

export default function WelcomeToggle() {
	const [isEnabled, setIsEnabled] = useState(true);
	const [showDialog, setShowDialog] = useState(false);
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [pendingState, setPendingState] = useState<boolean | null>(null);
	const router = useRouter();

	// Load initial state
	useEffect(() => {
		getWelcomeEnabled().then(setIsEnabled);
	}, []);

	const handleToggleClick = (checked: boolean) => {
		setPendingState(checked);
		setShowDialog(true);
		setPassword("");
		setMessage(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!password || pendingState === null) return;

		setIsLoading(true);
		setMessage(null);

		try {
			const result = await setWelcomeEnabled(password, pendingState);

			if (result.success) {
				setMessage({ type: "success", text: result.message });
				setIsEnabled(pendingState);
				
				// Close dialog after 1.5s and refresh
				setTimeout(() => {
					setShowDialog(false);
					setPassword("");
					setPendingState(null);
					router.refresh();
				}, 1500);
			} else {
				setMessage({ type: "error", text: result.message });
			}
		} catch (error) {
			setMessage({
				type: "error",
				text: "Có lỗi xảy ra. Vui lòng thử lại!",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setShowDialog(false);
		setPassword("");
		setPendingState(null);
		setMessage(null);
	};

	return (
		<>
			<div className="flex items-center justify-between gap-4 p-4 rounded-xl glass-modern">
				<div className="flex items-center gap-3">
					<ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
					<div className="flex flex-col">
						<Label
							htmlFor="welcome-toggle"
							className="text-sm font-semibold text-gray-800 dark:text-gray-100 cursor-pointer"
						>
							Trang Welcome
						</Label>
						<span className="text-xs text-gray-600 dark:text-gray-400">
							{isEnabled ? "Đang bật" : "Đang tắt"}
						</span>
					</div>
				</div>
				<Switch
					id="welcome-toggle"
					checked={isEnabled}
					onCheckedChange={handleToggleClick}
					className="data-[state=checked]:bg-blue-600"
				/>
			</div>

			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="glass-modern">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<ShieldCheck className="w-5 h-5 text-blue-600" />
							Xác nhận thay đổi
						</DialogTitle>
						<DialogDescription>
							{pendingState
								? "Bật trang Welcome - Logic như cũ"
								: "Tắt trang Welcome - Tất cả sẽ redirect về /login"}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit}>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="password">Nhập mật khẩu quản trị</Label>
								<Input
									id="password"
									type="password"
									placeholder="Nhập mật khẩu..."
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isLoading}
									className="glass-input"
									autoFocus
								/>
							</div>

							{message && (
								<div
									className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
										message.type === "success"
											? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
											: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
									}`}
								>
									{message.type === "success" ? (
										<CheckCircle2 className="w-4 h-4" />
									) : (
										<AlertCircle className="w-4 h-4" />
									)}
									<span>{message.text}</span>
								</div>
							)}
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={isLoading}
							>
								Hủy
							</Button>
							<Button type="submit" disabled={isLoading || !password}>
								{isLoading ? "Đang xử lý..." : "Xác nhận"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
