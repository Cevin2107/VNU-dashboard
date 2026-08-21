"use client";

import { ThoiKhoaBieuResponse } from "@/types/ResponseTypes";
import { Card, CardContent } from "@/components/ui/card";
import { EventInfo } from "./Timetable";
import SubjectPopup from "./SubjectPopup";
import { PeriodTime, defaultPeriodTime, getPeriodTime } from "@/lib/constants";
import { Clock, MapPin, Users } from "lucide-react";
export { getPeriodTime };

function getEventPosition(event: ThoiKhoaBieuResponse, periodTime: PeriodTime[] = defaultPeriodTime): { top: string; height: string } {
	const { startTime, endTime } = getPeriodTime(Number.parseInt(event.tietBatDau), Number.parseInt(event.tietKetThuc), periodTime);

	const startHour = Number.parseInt(startTime.split(":")[0]);
	const startMinute = Number.parseInt(startTime.split(":")[1]);
	const endHour = Number.parseInt(endTime.split(":")[0]);
	const endMinute = Number.parseInt(endTime.split(":")[1]);

	const startPosition = ((startHour - 6) * 60 + startMinute) / 60;
	const duration =
		((endHour - 6) * 60 + endMinute - (startHour - 6) * 60 - startMinute) /
		60;

	return {
		top: `${startPosition * 60}px`,
		height: `${duration * 60}px`,
	};
}

export default function SubjectCard({ eventInfo, periodTime }: { eventInfo: EventInfo; periodTime: PeriodTime[] }) {
	const position = getEventPosition(eventInfo.event, periodTime);
	
	// Starbucks Inspired Palette Accents
	const colors = [
		{ bg: "bg-white", border: "border-l-4 border-l-[#006241]", text: "text-[#1E3932]", badge: "bg-[#006241]/10 text-[#006241]" },
		{ bg: "bg-white", border: "border-l-4 border-l-[#00754A]", text: "text-[#1E3932]", badge: "bg-[#00754A]/10 text-[#00754A]" },
		{ bg: "bg-white", border: "border-l-4 border-l-[#cba258]", text: "text-[#1E3932]", badge: "bg-[#cba258]/15 text-[#8a6825]" },
		{ bg: "bg-white", border: "border-l-4 border-l-[#1E3932]", text: "text-[#1E3932]", badge: "bg-[#1E3932]/10 text-[#1E3932]" },
		{ bg: "bg-white", border: "border-l-4 border-l-[#2b5148]", text: "text-[#1E3932]", badge: "bg-[#2b5148]/10 text-[#2b5148]" },
	];
	
	const colorIndex = eventInfo.event.maHocPhan.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
	const color = colors[colorIndex];
	
	const cardClassName = eventInfo.isOverlapped 
		? (eventInfo.isSameTime
			? `absolute ${color.bg} ${color.border} shadow-md z-20 rounded-xl transition-all duration-200 hover:z-30 hover:shadow-lg border-y border-r border-slate-200 overflow-hidden`
			: (eventInfo.isMainOverlap 
				? `absolute left-0.5 right-0.5 ${color.bg} ${color.border} shadow-md z-10 rounded-xl transition-all duration-200 border-y border-r border-slate-200 overflow-hidden`
				: `absolute ${color.bg} ${color.border} shadow-md z-20 rounded-xl transition-all duration-200 hover:z-30 hover:shadow-lg border-y border-r border-slate-200 overflow-hidden`))
		: `absolute left-0.5 right-0.5 ${color.bg} ${color.border} shadow-xs z-10 rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:z-30 border-y border-r border-slate-200 overflow-hidden`;
	
	const cardStyle = {
		top: position.top,
		height: position.height,
		minHeight: "68px",
		left: eventInfo.isOverlapped && eventInfo.isSameTime && eventInfo.isMainOverlap ? "50%" : (eventInfo.isOverlapped && eventInfo.isSameTime && !eventInfo.isMainOverlap ? "2px" : undefined),
		right: eventInfo.isOverlapped && eventInfo.isSameTime && eventInfo.isMainOverlap ? "2px" : (eventInfo.isOverlapped && eventInfo.isSameTime && !eventInfo.isMainOverlap ? "50%" : (eventInfo.isOverlapped && !eventInfo.isSameTime && !eventInfo.isMainOverlap ? "2px" : undefined)),
		width: eventInfo.isOverlapped && !eventInfo.isSameTime && !eventInfo.isMainOverlap ? "80%" : undefined,
	};

	const { startTime, endTime } = getPeriodTime(Number.parseInt(eventInfo.event.tietBatDau), Number.parseInt(eventInfo.event.tietKetThuc), periodTime);

	return (
		<SubjectPopup subject={eventInfo.event}>
			<Card
				key={`${eventInfo.event.maHocPhan}-${eventInfo.event.ngayTrongTuan}-${eventInfo.event.tietBatDau}`}
				className={cardClassName}
				style={cardStyle}
			>
				<CardContent className="p-1.5 sm:p-2.5 h-full flex flex-col justify-between cursor-pointer select-none overflow-hidden">
					<div className="space-y-0.5 min-w-0">
						<div className="flex items-center justify-between gap-1 flex-wrap">
							<span className={`px-1.5 py-0.5 rounded-full font-bold text-[9px] whitespace-nowrap ${color.badge}`}>
								Tiết {eventInfo.event.tietBatDau}-{eventInfo.event.tietKetThuc}
							</span>
							{eventInfo.event.nhom !== "0" && (
								<span className="text-[9px] font-bold text-slate-500 flex items-center gap-0.5 whitespace-nowrap">
									<Users className="w-2.5 h-2.5 flex-shrink-0" /> N{eventInfo.event.nhom}
								</span>
							)}
						</div>
						<h4 className={`font-black text-[10px] sm:text-xs ${color.text} leading-tight line-clamp-2 break-words mt-0.5`}>
							{eventInfo.event.tenHocPhan}
						</h4>
					</div>

					<div className="space-y-0.5 text-slate-600 border-t border-slate-100 pt-1 mt-0.5 min-w-0">
						<div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-slate-500 whitespace-nowrap overflow-hidden">
							<Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#00754A] flex-shrink-0" />
							<span className="truncate">{startTime} - {endTime}</span>
						</div>
						<div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-slate-900 overflow-hidden">
							<MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500 flex-shrink-0" />
							<span className="truncate">{eventInfo.event.tenPhong || "Chưa có phòng"}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</SubjectPopup>
	);
}