import { LichThiResponse } from "@/types/ResponseTypes";

export default function ExamDetail({ data, className="" }: { data: LichThiResponse, className?: string }) {
	return (
		<div className={`bg-gray-50 dark:bg-gray-700/50 rounded-[18px] p-5 border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all duration-300 ${className}`}>
			<h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white flex items-center gap-2">
				<span className="text-blue-600 dark:text-blue-400">📚</span>
				{data.tenHocPhan}
			</h3>
			<div className="space-y-2.5 text-sm">
				<div className="flex items-start">
					<span className="font-semibold text-gray-600 dark:text-gray-400 w-32 flex-shrink-0">Ngày thi:</span>
					<span className="text-gray-900 dark:text-gray-100 font-medium">{data.ngayThi || "Chưa xác định"}</span>
				</div>
				<div className="flex items-start">
					<span className="font-semibold text-gray-600 dark:text-gray-400 w-32 flex-shrink-0">Giờ bắt đầu:</span>
					<span className="text-gray-900 dark:text-gray-100 font-medium">{data.gioBatDauThi || "Chưa xác định"}</span>
				</div>
				<div className="flex items-start">
					<span className="font-semibold text-gray-600 dark:text-gray-400 w-32 flex-shrink-0">Phòng thi:</span>
					<span className="text-gray-900 dark:text-gray-100 font-medium">{data.phongThi || "Chưa xác định"}</span>
				</div>
				<div className="flex items-start">
					<span className="font-semibold text-gray-600 dark:text-gray-400 w-32 flex-shrink-0">Địa chỉ:</span>
					<span className="text-gray-900 dark:text-gray-100 font-medium">{data.diaChi || "Chưa xác định"}</span>
				</div>
				<div className="flex items-start">
					<span className="font-semibold text-gray-600 dark:text-gray-400 w-32 flex-shrink-0">Hình thức thi:</span>
					<span className="text-gray-900 dark:text-gray-100 font-medium">{data.hinhThucThi || "Chưa xác định"}</span>
				</div>
			</div>
		</div>
	);
}