"use client";

import { useState } from "react";
import { 
	Dialog, 
	DialogContent, 
	DialogHeader, 
	DialogTitle, 
	DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { ThoiKhoaBieuResponse } from "@/types/ResponseTypes";
import { PeriodTime } from "@/lib/constants";
import { syncScheduleAction, deleteSemesterScheduleAction } from "../actions/googleCalendarActions";
import { showToast } from "@/components/ui/toast-provider";
import { Sparkles, Calendar, Trash2, RefreshCw } from "lucide-react";

export default function GoogleSyncModal({
	schedule,
	semesterId,
	periodTime
}: {
	schedule: ThoiKhoaBieuResponse[];
	semesterId: string;
	periodTime: PeriodTime[];
}) {
	const [open, setOpen] = useState(false);
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [totalWeeks, setTotalWeeks] = useState<number>(15);
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const handleSync = async () => {
		if (!startDate) {
			showToast("Vui lòng chọn ngày bắt đầu học kỳ", "error");
			return;
		}

		setLoading(true);
		try {
			const y = startDate.getFullYear();
			const m = String(startDate.getMonth() + 1).padStart(2, "0");
			const d = String(startDate.getDate()).padStart(2, "0");
			const dateStr = `${y}-${m}-${d}`;

			const count = await syncScheduleAction(schedule, semesterId, dateStr, totalWeeks, periodTime);
			showToast(`✓ Đã đồng bộ & ghi đè ${count} môn học vào Google Calendar`, "success");
			setOpen(false);
		} catch (err: unknown) {
			console.error("Google Calendar Sync Error:", err);
			const msg = err instanceof Error ? err.message : "Không thể kết nối Google Calendar API";
			showToast(msg, "error");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		setDeleting(true);
		try {
			const deletedCount = await deleteSemesterScheduleAction(semesterId);
			showToast(`✓ Đã xóa ${deletedCount} sự kiện thời khóa biểu học kỳ này`, "success");
			setOpen(false);
		} catch (err: unknown) {
			console.error("Google Calendar Delete Error:", err);
			const msg = err instanceof Error ? err.message : "Không thể xóa lịch trên Google Calendar";
			showToast(msg, "error");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="btn-pill text-[11px] sm:text-xs font-bold bg-[#00754A] hover:bg-[#006241] text-white px-3.5 sm:px-4 py-2 h-9 sm:h-10 shadow-xs active:scale-95 flex-1 sm:flex-initial justify-center items-center gap-1.5">
					<Calendar className="w-3.5 h-3.5 text-emerald-200" />
					<span>Đồng bộ Google Calendar</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl sm:rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xl">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-[#006241] text-white flex items-center justify-center font-bold">
							<Calendar className="w-5 h-5" />
						</div>
						<div>
							<DialogTitle className="text-base font-black text-[#006241] tracking-tight">
								Đồng Bộ Google Calendar
							</DialogTitle>
							<p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
								<Sparkles className="w-3 h-3 text-[#00754A]" /> Tự động kết nối qua Service Account
							</p>
						</div>
					</div>
				</DialogHeader>

				<Separator className="bg-slate-200 my-2" />

				<div className="space-y-4 pt-1">
					<div className="bg-[#d4e9e2]/40 border border-[#00754A]/30 rounded-xl p-3 text-[#006241] text-xs font-medium leading-relaxed flex items-start gap-2">
						<Sparkles className="w-4 h-4 text-[#00754A] flex-shrink-0 mt-0.5" />
						<p className="leading-normal">
							Hệ thống sẽ <strong>tự động ghi đè</strong> các môn học đã đồng bộ trước đó để tránh trùng lặp.
						</p>
					</div>

					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label className="text-xs font-bold text-slate-700">Ngày bắt đầu học kỳ</Label>
							<DatePicker date={startDate} setDate={setStartDate} className="text-xs border border-slate-200 rounded-full w-full" />
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-bold text-slate-700">Số tuần học</Label>
							<Input
								type="number"
								min={1}
								max={30}
								value={totalWeeks}
								onChange={(e) => setTotalWeeks(Number.parseInt(e.target.value) || 15)}
								className="rounded-full text-xs border border-slate-200"
							/>
						</div>
					</div>

					<div className="pt-2 space-y-2">
						<Button
							onClick={handleSync}
							disabled={loading || deleting}
							className="btn-pill w-full text-xs font-bold bg-[#00754A] hover:bg-[#006241] text-white py-2.5 shadow-md flex items-center justify-center gap-2"
						>
							{loading ? (
								<>
									<RefreshCw className="w-4 h-4 animate-spin" />
									<span>Đang đồng bộ/ghi đè...</span>
								</>
							) : (
								<>
									<Calendar className="w-4 h-4" />
									<span>Đồng bộ & Ghi đè vào Google Calendar</span>
								</>
							)}
						</Button>

						<Button
							onClick={handleDelete}
							disabled={loading || deleting}
							variant="outline"
							className="btn-pill w-full text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white py-2 flex items-center justify-center gap-2"
						>
							{deleting ? (
								<>
									<RefreshCw className="w-4 h-4 animate-spin" />
									<span>Đang xóa...</span>
								</>
							) : (
								<>
									<Trash2 className="w-4 h-4" />
									<span>Xóa lịch học kỳ này trên Google Calendar</span>
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
