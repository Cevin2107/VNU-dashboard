"use client";

import { ThoiKhoaBieuResponse } from "@/types/ResponseTypes";
import { Card, CardContent } from "@/components/ui/card";
import { EventInfo } from "./Timetable";
import SubjectPopup from "./SubjectPopup";
import { PeriodTime, defaultPeriodTime } from "@/lib/constants";

function getEventPosition(event: ThoiKhoaBieuResponse, periodTime: PeriodTime[] = defaultPeriodTime): { top: string; height: string } {
	const {startTime, endTime} = getPeriodTime(Number.parseInt(event.tietBatDau), Number.parseInt(event.tietKetThuc), periodTime);

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

export function getPeriodTime(start: number, end: number, periodTime: PeriodTime[]): { startTime: string; endTime: string } {
	return {
		startTime: periodTime[start - 1].start,
		endTime: periodTime[end - 1].end,
	}
}

export default function SubjectCard({ eventInfo, periodTime }: { eventInfo: EventInfo; periodTime: PeriodTime[] }) {
	const position = getEventPosition(eventInfo.event, periodTime);
	
	// Màu sáng, tươi trẻ với gradient nhẹ
	const colors = [
		{ from: "from-blue-500", to: "to-blue-600", border: "border-blue-600", text: "text-blue-50" },
		{ from: "from-violet-500", to: "to-violet-600", border: "border-violet-600", text: "text-violet-50" },
		{ from: "from-emerald-500", to: "to-emerald-600", border: "border-emerald-600", text: "text-emerald-50" },
		{ from: "from-amber-500", to: "to-amber-600", border: "border-amber-600", text: "text-amber-50" },
		{ from: "from-rose-500", to: "to-rose-600", border: "border-rose-600", text: "text-rose-50" },
		{ from: "from-cyan-500", to: "to-cyan-600", border: "border-cyan-600", text: "text-cyan-50" },
	];
	const colorIndex = eventInfo.event.maHocPhan.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
	const color = colors[colorIndex];
	
	const cardClassName = eventInfo.isOverlapped 
		? (eventInfo.isSameTime
			? `absolute bg-gradient-to-br ${color.from} ${color.to} border-l-[3px] ${color.border} shadow-lg z-20 py-0 rounded-lg`
			: (eventInfo.isMainOverlap 
				? `absolute left-1 right-1 bg-gradient-to-br ${color.from} ${color.to} border-l-[3px] ${color.border} shadow-lg z-10 py-0 rounded-lg`
				: `absolute bg-gradient-to-br ${color.from} ${color.to} border-l-[3px] ${color.border} shadow-lg z-20 py-0 rounded-lg`))
		: `absolute left-1 right-1 bg-gradient-to-br ${color.from} ${color.to} border-l-[3px] ${color.border} shadow-lg hover:shadow-xl z-10 py-0 rounded-lg transition-all duration-200 hover:scale-[1.02]`;
	
	const cardStyle = {
		top: position.top,
		height: position.height,
		minHeight: "85px",
		left: eventInfo.isOverlapped && eventInfo.isSameTime && eventInfo.isMainOverlap ? "50%" : (eventInfo.isOverlapped && eventInfo.isSameTime && !eventInfo.isMainOverlap ? "4px" : undefined),
		right: eventInfo.isOverlapped && eventInfo.isSameTime && eventInfo.isMainOverlap ? "4px" : (eventInfo.isOverlapped && eventInfo.isSameTime && !eventInfo.isMainOverlap ? "50%" : (eventInfo.isOverlapped && !eventInfo.isSameTime && !eventInfo.isMainOverlap ? "4px" : undefined)),
		width: eventInfo.isOverlapped && !eventInfo.isSameTime && !eventInfo.isMainOverlap ? "75%" : undefined,
	};

	return (
		<SubjectPopup subject={eventInfo.event}>
			<Card
				key={`${eventInfo.event.maHocPhan}-${eventInfo.event.ngayTrongTuan}-${eventInfo.event.tietBatDau}`}
				className={cardClassName}
				style={cardStyle}
			>
				<CardContent className="p-2.5 h-full flex flex-col justify-between">
					<div className="space-y-1">
						<div className="font-bold text-sm text-white leading-tight line-clamp-2 drop-shadow-sm">
							{eventInfo.event.tenHocPhan}
						</div>
						<div className="text-[11px] text-white/90 font-medium">
							{eventInfo.event.nhom === "0" ? "Lớp chung" : `Nhóm ${eventInfo.event.nhom}`}
						</div>
					</div>
					<div className="space-y-0.5 text-white/95">
						<div className="flex items-center gap-1.5 text-[11px] font-medium">
							<svg className="w-3.5 h-3.5 flex-shrink-0 opacity-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>
								{(() => {
									const { startTime, endTime } = getPeriodTime(Number.parseInt(eventInfo.event.tietBatDau), Number.parseInt(eventInfo.event.tietKetThuc), periodTime);
									return `${startTime} - ${endTime}`;
								})()}
							</span>
						</div>
						<div className="flex items-center gap-1.5 text-[11px] font-medium">
							<svg className="w-3.5 h-3.5 flex-shrink-0 opacity-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							<span className="truncate">{eventInfo.event.tenPhong}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</SubjectPopup>
	)
}