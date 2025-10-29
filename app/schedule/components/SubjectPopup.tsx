import { ReactNode } from "react";
import { ThoiKhoaBieuResponse } from "@/types/ResponseTypes";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Separator } from "@/components/ui/separator";

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

export default function SubjectPopup({ subject, children }: { subject: ThoiKhoaBieuResponse, children: ReactNode }) {
	return (
		<Dialog>
			<DialogTrigger className="cursor-pointer">
				{children}
			</DialogTrigger>
			<DialogContent>
				<DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
					Thông tin học phần
				</DialogTitle>
				<Separator className="bg-gray-200 dark:bg-gray-700" />
				<DialogDescription asChild>
					<div className="space-y-3 text-sm">
						<div className="flex flex-col space-y-1">
							<span className="font-semibold text-gray-600 dark:text-gray-400">Tên học phần:</span>
							<span className="text-gray-900 dark:text-gray-100">{subject.tenHocPhan}</span>
						</div>
						<div className="flex flex-col space-y-1">
							<span className="font-semibold text-gray-600 dark:text-gray-400">Mã học phần:</span>
							<span className="text-gray-900 dark:text-gray-100">{subject.maHocPhan}</span>
						</div>
						<div className="flex flex-col space-y-1">
							<span className="font-semibold text-gray-600 dark:text-gray-400">Nhóm:</span>
							<span className="text-gray-900 dark:text-gray-100">{subject.nhom === "0" ? "Cả lớp" : subject.nhom}</span>
						</div>
						<div className="flex flex-col space-y-1">
							<span className="font-semibold text-gray-600 dark:text-gray-400">Giảng viên:</span>
							<span className="text-gray-900 dark:text-gray-100">{subject.giangVien1}</span>
						</div>
						<div className="flex flex-col space-y-1">
							<span className="font-semibold text-gray-600 dark:text-gray-400">Thời gian học:</span>
							<span className="text-gray-900 dark:text-gray-100">{days[Number.parseInt(subject.ngayTrongTuan) - 1]} {subject.tietBatDau} - {subject.tietKetThuc}</span>
						</div>
						<div className="flex flex-col space-y-1">
							<span className="font-semibold text-gray-600 dark:text-gray-400">Phòng học:</span>
							<span className="text-gray-900 dark:text-gray-100">{subject.tenPhong}</span>
						</div>
					</div>
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}