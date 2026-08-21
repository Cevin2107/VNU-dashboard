"use client";

import { ReactNode } from "react";
import { ThoiKhoaBieuResponse } from "@/types/ResponseTypes";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Separator } from "@/components/ui/separator";
import { BookOpen, User, MapPin, Clock, Sparkles } from "lucide-react";

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

export default function SubjectPopup({ subject, children }: { subject: ThoiKhoaBieuResponse, children: ReactNode }) {
	return (
		<Dialog>
			<DialogTrigger asChild className="cursor-pointer">
				{children}
			</DialogTrigger>
			<DialogContent className="max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-xl">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 rounded-xl bg-[#006241] text-white flex items-center justify-center font-bold">
						<BookOpen className="w-5 h-5" />
					</div>
					<div>
						<DialogTitle className="text-base font-black text-[#006241] tracking-tight">
							Chi Tiết Học Phần
						</DialogTitle>
						<p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
							<Sparkles className="w-3 h-3 text-[#00754A]" /> Thông tin thời khóa biểu VNU
						</p>
					</div>
				</div>

				<Separator className="bg-slate-200 my-2" />

				<DialogDescription asChild>
					<div className="space-y-4 pt-1">
						{/* Subject Title Banner */}
						<div className="bg-[#f2f0eb] rounded-xl p-3.5 border border-slate-200">
							<h3 className="font-black text-sm text-slate-900 leading-snug">
								{subject.tenHocPhan}
							</h3>
							<div className="flex items-center gap-2 mt-2">
								<span className="px-2.5 py-0.5 rounded-full bg-[#00754A] text-white font-mono font-bold text-[10px]">
									{subject.maHocPhan}
								</span>
								<span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
									{subject.nhom === "0" ? "Lớp chung" : `Nhóm ${subject.nhom}`}
								</span>
								<span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
									{subject.soTinChi} Tín chỉ
								</span>
							</div>
						</div>

						{/* Detail Info Items */}
						<div className="grid grid-cols-1 gap-3 text-xs">
							<div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
								<User className="w-4 h-4 text-[#00754A] flex-shrink-0" />
								<div>
									<p className="text-[10px] font-bold text-slate-400 uppercase">Giảng viên giảng dạy</p>
									<p className="font-bold text-slate-800">{subject.giangVien1 || "Đang cập nhật"}</p>
								</div>
							</div>

							<div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
								<Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
								<div>
									<p className="text-[10px] font-bold text-slate-400 uppercase">Thời gian học</p>
									<p className="font-bold text-slate-800">
										{days[Number.parseInt(subject.ngayTrongTuan) - 1]} (Tiết {subject.tietBatDau} - {subject.tietKetThuc})
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
								<MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
								<div>
									<p className="text-[10px] font-bold text-slate-400 uppercase">Phòng học & Địa chỉ</p>
									<p className="font-bold text-slate-800">{subject.tenPhong || "Chưa xếp phòng"}</p>
									{subject.diaChi && <p className="text-[11px] font-medium text-slate-500">{subject.diaChi}</p>}
								</div>
							</div>
						</div>
					</div>
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}