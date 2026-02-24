"use client";

import ExamList from "./components/ExamList";
import { Separator } from "@/components/ui/separator";
import ProtectedRoute from "@/components/ProtectedRoute";
import RefreshButton from "../components/RefreshButton";
import { LichThiResponse } from "@/types/ResponseTypes";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExamPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [hasFetchError, setHasFetchError] = useState(false);
	const [hocKyLabel, setHocKyLabel] = useState("Dữ liệu tạm thời chưa khả dụng");
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
				const hocKy = danhSachHocKy.reduce((prev, curr) => (curr.id > prev.id ? curr : prev), danhSachHocKy[0]);
				const lichThi = await apiHandler.getLichThiHocKy(hocKy.id);
				const grouped = Object.groupBy(lichThi, (item) => {
					if (item.ngayThi === null) return "upcoming";
					const now = new Date();
					const examDate = new Date(item.ngayThi.split("/").reverse().join("-"));
					return examDate < now ? "past" : "upcoming";
				});

				setHocKyLabel(`Học kỳ ${hocKy.ten} năm học ${hocKy.nam}`);
				setLichThiGroups(grouped);
				setHasFetchError(false);
			} catch {
				setHasFetchError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchExamData();
	}, [router]);

	return (
		<ProtectedRoute>
			<div className="w-full min-h-screen px-4 md:px-6 py-3 pt-16 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
				{/* Page Header */}
				<div className="mb-6">
					<div className="flex items-center justify-between gap-4 flex-wrap">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
								Lịch Thi 📝
							</h1>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{hocKyLabel}
							</p>
						</div>
						<RefreshButton />
					</div>
				</div>

				{loading && (
					<div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-200">
						Đang tải lịch thi...
					</div>
				)}

				{hasFetchError && (
					<div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200">
						Không thể tải lịch thi lúc này (API đang lỗi tạm thời). Vui lòng thử lại sau ít phút.
					</div>
				)}

				<div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-xl border border-gray-100 dark:border-gray-700">
					{lichThiGroups["upcoming"] && (
					<div className="mb-6">
						<h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-[14px] flex items-center justify-center shadow-lg shadow-green-500/30">
								<span className="text-white text-lg">📅</span>
							</div>
							Sắp thi
						</h2>
						<ExamList data={lichThiGroups["upcoming"]} className="space-y-4"/>
					</div>
					)}
					{lichThiGroups["upcoming"] && lichThiGroups["past"] && (
						<Separator className="my-6 bg-gray-200 dark:bg-gray-700" />
					)}
					{lichThiGroups["past"] && (
					<div>
						<h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-[14px] flex items-center justify-center shadow-lg shadow-gray-500/30">
								<span className="text-white text-lg">✓</span>
							</div>
							Đã thi
						</h2>
						<ExamList data={lichThiGroups["past"]} className="space-y-4"/>
					</div>
					)}
				</div>
			</div>
		</ProtectedRoute>
	);
}