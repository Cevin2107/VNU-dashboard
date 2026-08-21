"use client";

import { LichThiResponse } from "@/types/ResponseTypes";
import { BookOpen, Calendar, Clock, MapPin, Building, FileText, CheckCircle2 } from "lucide-react";

export default function ExamDetail({ data, className = "" }: { data: LichThiResponse; className?: string }) {
	const isUpcoming = !data.ngayThi || new Date(data.ngayThi.split("/").reverse().join("-")) >= new Date();

	return (
		<div className={`surface-card rounded-2xl p-5 border border-slate-200 hover:border-[#00754A] hover-lift transition-all duration-200 ${className}`}>
			
			{/* Top Bar: Subject Title & Credit/Status Badge */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-[#006241] text-white flex items-center justify-center font-bold flex-shrink-0">
						<BookOpen className="w-5 h-5" />
					</div>
					<div>
						<h3 className="font-black text-sm md:text-base text-slate-900 leading-snug">
							{data.tenHocPhan}
						</h3>
						<div className="flex items-center gap-2 mt-0.5">
							<span className="font-mono font-bold text-[10px] text-[#00754A] bg-[#00754A]/10 px-2 py-0.5 rounded-full">
								{data.maHocPhan}
							</span>
							<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
								{data.soTinChi} Tín chỉ
							</span>
						</div>
					</div>
				</div>

				{/* Status Pill Badge */}
				<div>
					{isUpcoming ? (
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00754A] text-white font-bold text-xs shadow-xs">
							<Clock className="w-3.5 h-3.5" /> Sắp thi
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
							<CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Đã thi xong
						</span>
					)}
				</div>
			</div>

			{/* Details Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
				
				{/* Exam Date */}
				<div className="bg-[#f2f0eb]/70 rounded-xl p-3 border border-slate-200/80 flex items-center gap-3">
					<Calendar className="w-4 h-4 text-[#00754A] flex-shrink-0" />
					<div>
						<p className="text-[10px] font-bold text-slate-400 uppercase">Ngày thi</p>
						<p className="font-black text-slate-800">{data.ngayThi || "Chưa xếp ngày"}</p>
					</div>
				</div>

				{/* Start Time / Shift */}
				<div className="bg-[#f2f0eb]/70 rounded-xl p-3 border border-slate-200/80 flex items-center gap-3">
					<Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
					<div>
						<p className="text-[10px] font-bold text-slate-400 uppercase">Giờ thi & Ca thi</p>
						<p className="font-black text-slate-800">
							{data.gioBatDauThi ? `${data.gioBatDauThi} ${data.caThi ? `(Ca ${data.caThi})` : ''}` : "Chưa công bố"}
						</p>
					</div>
				</div>

				{/* Exam Room */}
				<div className="bg-[#f2f0eb]/70 rounded-xl p-3 border border-slate-200/80 flex items-center gap-3">
					<MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
					<div>
						<p className="text-[10px] font-bold text-slate-400 uppercase">Phòng thi</p>
						<p className="font-black text-slate-900">{data.phongThi || "Chưa xếp phòng"}</p>
					</div>
				</div>

				{/* Location / Address */}
				<div className="bg-[#f2f0eb]/70 rounded-xl p-3 border border-slate-200/80 flex items-center gap-3 sm:col-span-2">
					<Building className="w-4 h-4 text-purple-600 flex-shrink-0" />
					<div className="truncate">
						<p className="text-[10px] font-bold text-slate-400 uppercase">Địa điểm thi</p>
						<p className="font-bold text-slate-800 truncate">{data.diaChi || "Đại học Quốc gia Hà Nội"}</p>
					</div>
				</div>

				{/* Exam Format */}
				<div className="bg-[#f2f0eb]/70 rounded-xl p-3 border border-slate-200/80 flex items-center gap-3">
					<FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
					<div>
						<p className="text-[10px] font-bold text-slate-400 uppercase">Hình thức thi</p>
						<p className="font-bold text-slate-800">{data.hinhThucThi || "Thi viết / Trắc nghiệm"}</p>
					</div>
				</div>

			</div>
		</div>
	);
}