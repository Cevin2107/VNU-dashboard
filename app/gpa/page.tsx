import { 
	Card, 
	CardContent 
} from "@/components/ui/card";
import { 
	Table, 
	TableBody, 
	TableCell, 
	TableHead, 
	TableHeader, 
	TableRow 
} from "@/components/ui/table";
import { Fragment } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { withAuth } from "@/lib/APIHandler";
import GPACalculator from "./components/GPACalculator";
import SubjectRow from "./components/SubjectRow";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Điểm"
}

export default async function GPAPage() {
	const { diemTrungBinhHe4TichLuy, tongSoTinChiTichLuy, gpaTongKet } = await withAuth(async (apiHandler) => {
		const { diemTrungBinhHe4TichLuy, tongSoTinChiTichLuy } = (await apiHandler.getTongKetDenHienTai())[0];
		const danhSachHocKy = await apiHandler.getDanhSachHocKyTheoDiem();
		const gpaTongKet = [];
	
		for (const hocKy of danhSachHocKy) {
			const tongket = (await apiHandler.getDiemTrungBinhHocKy(hocKy.id))[0];
			const diemHocKy = await apiHandler.getDiemThiHocKy(hocKy.id);
			gpaTongKet.push({
				id: hocKy.id,
				tenHocKy: `Học kỳ ${hocKy.ten} năm học ${hocKy.nam}`,
				tongket,
				diemHocKy
			});
		}
		gpaTongKet.sort((a, b) => Number(a.id) - Number(b.id));
		return { 
			diemTrungBinhHe4TichLuy, 
			tongSoTinChiTichLuy, 
			gpaTongKet 
		};
	});
	
	return (
		<ProtectedRoute>
			<div className="w-full min-h-screen px-4 md:px-6 py-3 pt-16 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
				{/* Page Header */}
				<div className="mb-6">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Điểm Học Tập 📊
					</h1>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Chi tiết điểm các học kỳ và tính toán GPA
					</p>
				</div>

				<GPACalculator />

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