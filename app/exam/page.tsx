"use client";

import ExamList from "./components/ExamList";
import ExamGoogleSync from "./components/ExamGoogleSync";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/ProtectedRoute";
import RefreshButton from "../components/RefreshButton";
import { LichThiResponse } from "@/types/ResponseTypes";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, Calendar, CheckCircle2, Clock } from "lucide-react";

export default function ExamPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [hasFetchError, setHasFetchError] = useState(false);
	const [hocKyLabel, setHocKyLabel] = useState("Đang truy xuất lịch thi...");
	const [hocKyId, setHocKyId] = useState<string>("");
	const [allExams, setAllExams] = useState<LichThiResponse[]>([]);
	const [lichThiGroups, setLichThiGroups] = useState<Partial<Record<"upcoming" | "past", LichThiResponse[]>>>({});

	useEffect(() => {
		const fetchExamData = async () => {
			try {
				const accessToken = sessionStorage.getItem("accessToken");
				const refreshToken = sessionStorage.getItem("refreshToken");

				if (!accessToken) {
					router.replace("/login");
					return;
				}

				const apiHandler = new ClientAPIHandler(accessToken, refreshToken);
				const danhSachHocKy = await apiHandler.getDanhSachHocKyTheoLichThi();
				if (!danhSachHocKy || danhSachHocKy.length === 0) {
					setHocKyLabel("Chưa có lịch thi chính thức");
					setLoading(false);
					return;
				}

				const hocKy = danhSachHocKy.reduce((prev, curr) => (curr.id > prev.id ? curr : prev), danhSachHocKy[0]);
				const lichThi = await apiHandler.getLichThiHocKy(hocKy.id);
				
				const grouped = Object.groupBy(lichThi || [], (item) => {
					if (item.ngayThi === null) return "upcoming";
					const now = new Date();
					const examDate = new Date(item.ngayThi.split("/").reverse().join("-"));
					return examDate < now ? "past" : "upcoming";
				});

				setHocKyId(hocKy.id);
				setAllExams(lichThi || []);
				setHocKyLabel(`Học kỳ ${hocKy.ten} năm học ${hocKy.nam}`);
				setLichThiGroups(grouped);
				setHasFetchError(false);
			} catch (err) {
				console.error("Fetch exam schedule error:", err);
				setHasFetchError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchExamData();
	}, [router]);

	return (
		<ProtectedRoute>
			<div className="w-full min-h-screen px-3 sm:px-6 md:px-8 py-4 sm:py-6 pt-18 sm:pt-20 bg-[#f2f0eb]">
				
				{/* Page Header Card */}
				<div className="surface-card p-4 sm:p-7 mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl border border-slate-200/80">
					<div className="flex items-start sm:items-center justify-between gap-3.5 sm:gap-4 flex-col sm:flex-row">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#006241] flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
								<BookOpenCheck className="w-5 h-5 sm:w-6 sm:h-6" />
							</div>
							<div>
								<h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#006241] tracking-tight">
									Lịch Thi Học Kỳ
								</h1>
								<p className="text-[11px] sm:text-xs font-medium text-slate-500">
									{hocKyLabel}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
							{allExams.length > 0 && (
								<ExamGoogleSync exams={allExams} semesterId={hocKyId} />
							)}
							<RefreshButton />
						</div>
					</div>
				</div>

				{loading && (
					<div className="surface-card p-8 text-center">
						<div className="w-9 h-9 border-3 border-[#00754A]/30 border-t-[#00754A] rounded-full animate-spin mx-auto mb-3" />
						<p className="text-xs font-bold text-slate-500">Đang tải lịch thi chi tiết...</p>
					</div>
				)}

				{hasFetchError && (
					<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-xs font-semibold mb-6">
						Tạm thời chưa kết nối được lịch thi VNU. Vui lòng làm mới trang hoặc thử lại sau.
					</div>
				)}

				{!loading && !hasFetchError && (
					<div className="surface-card p-4 sm:p-7 space-y-5 sm:space-y-7 rounded-2xl sm:rounded-3xl border border-slate-200/80">
						{lichThiGroups["upcoming"] && lichThiGroups["upcoming"].length > 0 && (
							<div>
								<h2 className="text-sm md:text-base font-black text-[#006241] mb-4 flex items-center gap-2.5">
									<div className="w-8 h-8 bg-[#00754A] rounded-full flex items-center justify-center text-white">
										<Clock className="w-4 h-4" />
									</div>
									Các môn sắp thi
								</h2>
								<ExamList data={lichThiGroups["upcoming"]} className="space-y-3"/>
							</div>
						)}

						{lichThiGroups["upcoming"] && lichThiGroups["past"] && (
							<Separator className="bg-slate-200" />
						)}

						{lichThiGroups["past"] && lichThiGroups["past"].length > 0 && (
							<div>
								<h2 className="text-sm md:text-base font-black text-slate-800 mb-4 flex items-center gap-2.5">
									<div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
										<CheckCircle2 className="w-4 h-4" />
									</div>
									Các môn đã thi xong
								</h2>
								<ExamList data={lichThiGroups["past"]} className="space-y-3"/>
							</div>
						)}

						{(!lichThiGroups["upcoming"] || lichThiGroups["upcoming"].length === 0) && 
						 (!lichThiGroups["past"] || lichThiGroups["past"].length === 0) && (
							<div className="text-center py-10">
								<Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
								<p className="text-xs font-bold text-slate-600">Chưa có môn thi nào được công bố</p>
							</div>
						)}
					</div>
				)}
			</div>
		</ProtectedRoute>
	);
}