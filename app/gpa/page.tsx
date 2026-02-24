"use client";

import { 
	Table, 
	TableBody, 
	TableCell, 
	TableHead, 
	TableHeader, 
	TableRow 
} from "@/components/ui/table";
import { Fragment, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";
import GPACalculator from "./components/GPACalculator";
import SubjectRow from "./components/SubjectRow";
import RefreshButton from "../components/RefreshButton";
import { DiemThiHocKyResponse, DiemTrungBinhHocKyResponse } from "@/types/ResponseTypes";
import { useRouter } from "next/navigation";

export default function GPAPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [hasFetchError, setHasFetchError] = useState(false);
	const [gpaTongKet, setGpaTongKet] = useState<{
		id: string;
		tenHocKy: string;
		tongket: DiemTrungBinhHocKyResponse;
		diemHocKy: DiemThiHocKyResponse[];
	}[]>([]);

	useEffect(() => {
		const fetchGPAData = async () => {
			try {
				const accessToken = sessionStorage.getItem("accessToken");
				const refreshToken = sessionStorage.getItem("refreshToken");

				if (!accessToken) {
					router.replace("/login");
					return;
				}

				const apiHandler = new ClientAPIHandler(accessToken, refreshToken);
				const danhSachHocKy = await apiHandler.getDanhSachHocKyTheoDiem();
				const items = await Promise.all(
					danhSachHocKy.map(async (hocKy) => {
						const [tongketRes, diemHocKy] = await Promise.all([
							apiHandler.getDiemTrungBinhHocKy(hocKy.id),
							apiHandler.getDiemThiHocKy(hocKy.id),
						]);

						return {
							id: hocKy.id,
							tenHocKy: `Học kỳ ${hocKy.ten} năm học ${hocKy.nam}`,
							tongket: tongketRes[0],
							diemHocKy,
						};
					})
				);

				items.sort((a, b) => Number(a.id) - Number(b.id));
				setGpaTongKet(items);
				setHasFetchError(false);
			} catch {
				setHasFetchError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchGPAData();
	}, [router]);
	
	return (
		<ProtectedRoute>
			<div className="w-full min-h-screen px-4 md:px-6 py-3 pt-16 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
				{/* Page Header */}
				<div className="mb-6">
					<div className="flex items-center justify-between gap-4 flex-wrap">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
								Điểm Học Tập 📊
							</h1>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Chi tiết điểm các học kỳ và tính toán GPA
							</p>
						</div>
						<RefreshButton />
					</div>
				</div>

				<GPACalculator />

				{loading && (
					<div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-200">
						Đang tải dữ liệu bảng điểm...
					</div>
				)}

				{hasFetchError && (
					<div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200">
						Không thể tải bảng điểm lúc này (API đang lỗi tạm thời). Vui lòng thử lại sau ít phút.
					</div>
				)}

				<div className="bg-white dark:bg-gray-800 rounded-[24px] overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 mt-6">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40">
									<TableHead className="font-bold text-sm text-gray-700 dark:text-gray-200">Mã học phần</TableHead>
									<TableHead className="font-bold text-sm text-gray-700 dark:text-gray-200">Tên môn học</TableHead>
									<TableHead className="font-bold text-sm text-gray-700 dark:text-gray-200">Số tín chỉ</TableHead>
									<TableHead className="font-bold text-sm text-gray-700 dark:text-gray-200">Điểm hệ 10</TableHead>
									<TableHead className="font-bold text-sm text-gray-700 dark:text-gray-200">Điểm hệ 4</TableHead>
									<TableHead className="font-bold text-sm text-gray-700 dark:text-gray-200">Điểm hệ chữ</TableHead>
								</TableRow>
							</TableHeader>
							{gpaTongKet.map((hocKy, semesterIndex) => (
								<Fragment key={hocKy.id}>
									<TableHeader>
										<TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40">
											<TableHead colSpan={6} className="font-bold text-base text-gray-900 dark:text-white py-4">
												{hocKy.tenHocKy}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{hocKy.diemHocKy.map((monHoc) => (
											<SubjectRow 
												key={monHoc.maHocPhan}
												monHoc={monHoc}
												hocKyId={hocKy.id}
											/>
										))}
										<TableRow className="border-b-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 font-bold text-sm">
											<TableCell colSpan={3} className="text-gray-900 dark:text-white">Điểm trung bình học kỳ</TableCell>
											<TableCell className="text-blue-600 dark:text-blue-400">{hocKy.tongket.diemTrungBinhHe10_HocKy}</TableCell>
											<TableCell colSpan={2} className="text-blue-600 dark:text-blue-400">{hocKy.tongket.diemTrungBinhHe4_HocKy}</TableCell>
										</TableRow>
										<TableRow className={`bg-gray-50 dark:bg-gray-800/50 text-sm ${semesterIndex < gpaTongKet.length - 1 ? 'border-b-4 border-gray-200 dark:border-gray-700' : ''}`}>
											<TableCell colSpan={2} className="font-semibold text-gray-700 dark:text-gray-300">
												Tổng số tín chỉ tích lũy: <span className="text-green-600 dark:text-green-400">{hocKy.tongket.tongSoTinChiTichLuy_HocKy}</span>
											</TableCell>
											<TableCell colSpan={4} className="font-semibold text-gray-700 dark:text-gray-300">
												Tổng số tín chỉ trượt: <span className="text-red-600 dark:text-red-400">{hocKy.tongket.tongSoTinChiTruot_HocKy}</span>
											</TableCell>
										</TableRow>
									</TableBody>
								</Fragment>
							))}
						</Table>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}