"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LichThiResponse } from "@/types/ResponseTypes";
import { syncExamsAction, deleteExamScheduleAction } from "@/app/schedule/actions/googleCalendarActions";
import { showToast } from "@/components/ui/toast-provider";
import { Calendar, RefreshCw, Trash2 } from "lucide-react";

export default function ExamGoogleSync({
	exams,
	semesterId
}: {
	exams: LichThiResponse[];
	semesterId: string;
}) {
	const [syncing, setSyncing] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const handleSyncExams = async () => {
		setSyncing(true);
		try {
			const count = await syncExamsAction(exams, semesterId);
			showToast(`✓ Đã đồng bộ & ghi đè ${count} môn thi vào Google Calendar`, "success");
		} catch (err: unknown) {
			console.error("Exam Google Sync Error:", err);
			const msg = err instanceof Error ? err.message : "Không thể kết nối Google Calendar API";
			showToast(msg, "error");
		} finally {
			setSyncing(false);
		}
	};

	const handleDeleteExams = async () => {
		setDeleting(true);
		try {
			const deletedCount = await deleteExamScheduleAction(semesterId);
			showToast(`✓ Đã xóa ${deletedCount} lịch thi của học kỳ này trên Google Calendar`, "success");
		} catch (err: unknown) {
			console.error("Exam Delete Error:", err);
			const msg = err instanceof Error ? err.message : "Không thể xóa lịch thi trên Google Calendar";
			showToast(msg, "error");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
			<Button
				onClick={handleSyncExams}
				disabled={syncing || deleting || exams.length === 0}
				className="btn-pill text-[11px] sm:text-xs font-bold bg-[#00754A] hover:bg-[#006241] text-white px-3.5 sm:px-4 py-2 h-9 sm:h-10 shadow-xs active:scale-95 flex-1 sm:flex-initial justify-center items-center gap-1.5"
			>
				{syncing ? (
					<>
						<RefreshCw className="w-3.5 h-3.5 animate-spin" />
						<span>Đang đồng bộ...</span>
					</>
				) : (
					<>
						<Calendar className="w-3.5 h-3.5 text-emerald-200" />
						<span>Đồng bộ Lịch thi</span>
					</>
				)}
			</Button>

			<Button
				onClick={handleDeleteExams}
				disabled={syncing || deleting || exams.length === 0}
				variant="outline"
				className="btn-pill text-[11px] sm:text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white px-3 sm:px-3.5 py-2 h-9 sm:h-10 active:scale-95 flex-1 sm:flex-initial justify-center items-center gap-1.5"
			>
				{deleting ? (
					<>
						<RefreshCw className="w-3.5 h-3.5 animate-spin" />
						<span>Đang xóa...</span>
					</>
				) : (
					<>
						<Trash2 className="w-3.5 h-3.5" />
						<span>Xóa lịch thi</span>
					</>
				)}
			</Button>
		</div>
	);
}
