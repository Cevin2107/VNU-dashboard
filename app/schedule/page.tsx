"use client";

import Schedule from "./components/Schedule";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";

export default function SchedulePage() {
	const router = useRouter();
	const [danhSachHocKy, setDanhSachHocKy] = useState<{ id: string; tenHocKy: string }[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSemesters = async () => {
			try {
				const accessToken = sessionStorage.getItem("accessToken");
				const refreshToken = sessionStorage.getItem("refreshToken");

				if (!accessToken) {
					router.replace("/login");
					return;
				}

				const apiHandler = new ClientAPIHandler(accessToken, refreshToken);
				const res = await apiHandler.getDanhSachHocKyTheoThoiKhoaBieu();
				const hocKyWithSchedule = await Promise.all(
					res.map(async (hocKy) => {
						const thoiKhoaBieu = await apiHandler.getThoiKhoaBieuHocKy(hocKy.id);
						if (thoiKhoaBieu.length === 0) return null;
						return {
							id: hocKy.id,
							tenHocKy: `Học kỳ ${hocKy.ten} năm học ${hocKy.nam}`,
						};
					})
				);

				const filtered = hocKyWithSchedule.filter((item): item is { id: string; tenHocKy: string } => item !== null);
				filtered.sort((a, b) => -(Number(a.id) - Number(b.id)));
				setDanhSachHocKy(filtered);
			} finally {
				setLoading(false);
			}
		};

		fetchSemesters();
	}, [router]);

	if (loading) {
		return (
			<div className="w-full min-h-screen flex items-center justify-center bg-[#f2f0eb] p-4">
				<div className="surface-card bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 max-w-sm w-full text-center flex flex-col items-center gap-3">
					<div className="w-9 h-9 border-3 border-[#00754A]/30 border-t-[#00754A] rounded-full animate-spin" />
					<p className="text-xs font-bold text-[#006241]">Đang tải danh sách học kỳ VNU...</p>
				</div>
			</div>
		);
	}

	return <Schedule data={danhSachHocKy} />;
}