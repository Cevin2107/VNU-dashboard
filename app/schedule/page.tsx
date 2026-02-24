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
			<div className="w-full min-h-screen flex items-center justify-center">
				<div className="text-sm text-gray-600 dark:text-gray-400">Đang tải danh sách học kỳ...</div>
			</div>
		);
	}

	return <Schedule data={danhSachHocKy} />;
}