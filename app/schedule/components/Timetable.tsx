"use client";

import { useState } from "react";
import { ThoiKhoaBieuResponse } from "@/types/ResponseTypes";
import SubjectCard from "./SubjectCard";
import SubjectPopup from "./SubjectPopup";
import { PeriodTime, getPeriodTime } from "@/lib/constants";
import { Clock, MapPin, Users, Calendar, Sparkles } from "lucide-react";

export interface EventInfo {
	event: ThoiKhoaBieuResponse;
	isOverlapped: boolean;
	isMainOverlap: boolean;
	isSameTime: boolean;
}

const daysAbbr = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
const daysShort = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const timeSlots = [
	"06:00",
	"07:00",
	"08:00",
	"09:00",
	"10:00",
	"11:00",
	"12:00",
	"13:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00",
	"18:00",
	"19:00",
];

function getCurrDayOfWeek(): number {
	const today = new Date();
	const day = today.getDay();
	return day === 0 ? 7 : day;
} 

function detectOverlaps(events: ThoiKhoaBieuResponse[]): EventInfo[] {
	const result: EventInfo[] = [];
	
	for (let i = 0; i < events.length; i++) {
		const event1 = events[i];
		const start1 = Number.parseInt(event1.tietBatDau);
		const end1 = Number.parseInt(event1.tietKetThuc);
		
		let hasOverlap = false;
		let isMainOverlap = true;
		let isSameTime = false;
		
		const overlappingEvents: { index: number; event: ThoiKhoaBieuResponse; duration: number; isSameTime: boolean }[] = [];
		
		for (let j = 0; j < events.length; j++) {
			if (i === j) continue;
			
			const event2 = events[j];
			const start2 = Number.parseInt(event2.tietBatDau);
			const end2 = Number.parseInt(event2.tietKetThuc);
			
			if (start1 === start2 && end1 === end2) {
				hasOverlap = true;
				isSameTime = true;
				const duration2 = end2 - start2;
				overlappingEvents.push({ index: j, event: event2, duration: duration2, isSameTime: true });
			}
			else if (start1 <= end2 && start2 <= end1) {
				hasOverlap = true;
				const duration2 = end2 - start2;
				overlappingEvents.push({ index: j, event: event2, duration: duration2, isSameTime: false });
			}
		}
		
		if (hasOverlap && overlappingEvents.length > 0) {
			const duration1 = end1 - start1;
			const hasSameTimeOverlap = overlappingEvents.some(e => e.isSameTime);
			
			if (hasSameTimeOverlap) {
				const sameTimeEvents = overlappingEvents.filter(e => e.isSameTime);
				const firstSameTimeIndex = Math.min(...sameTimeEvents.map(e => e.index));
				isMainOverlap = i > firstSameTimeIndex;
				isSameTime = true;
			} else {
				overlappingEvents.sort((a, b) => {
					if (a.duration !== b.duration) {
						return a.duration - b.duration;
					}
					return a.index - b.index;
				});
				
				const shortestOverlap = overlappingEvents[0];
				if (duration1 < shortestOverlap.duration || 
					(duration1 === shortestOverlap.duration && i < shortestOverlap.index)) {
					isMainOverlap = false;
				} else {
					isMainOverlap = true;
				}
			}
		}
		
		result.push({
			event: event1,
			isOverlapped: hasOverlap,
			isMainOverlap: isMainOverlap,
			isSameTime: isSameTime
		});
	}
	
	return result;
}

export default function Timetable({ data, periodTime }: { data: ThoiKhoaBieuResponse[], periodTime: PeriodTime[] }) {
	const currentDay = getCurrDayOfWeek();
	const [selectedDay, setSelectedDay] = useState<number | "all">("all");

	function getEventsForDay(day: number): EventInfo[] {
		const dayEvents = data.filter(event => Number.parseInt(event.ngayTrongTuan) === day);
		return detectOverlaps(dayEvents);
	}

	function getRawEventsForDay(day: number): ThoiKhoaBieuResponse[] {
		const events = data.filter(event => Number.parseInt(event.ngayTrongTuan) === day);
		return events.sort((a, b) => Number.parseInt(a.tietBatDau) - Number.parseInt(b.tietBatDau));
	}

	return (
		<div className="w-full mx-auto">
			{/* Mobile Day Selector Bar */}
			<div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 scrollbar-none select-none">
				<button
					onClick={() => setSelectedDay("all")}
					className={`btn-pill text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1 flex-shrink-0 ${
						selectedDay === "all"
							? "bg-[#006241] text-white shadow-sm"
							: "bg-[#f2f0eb] hover:bg-slate-200 text-slate-700 border border-slate-200"
					}`}
				>
					<Calendar className="w-3.5 h-3.5" />
					<span>Tất cả (Lưới)</span>
				</button>

				{daysAbbr.map((dayName, index) => {
					const dayNum = index + 1;
					const isToday = currentDay === dayNum;
					const isSelected = selectedDay === dayNum;
					const hasClasses = data.some(e => Number.parseInt(e.ngayTrongTuan) === dayNum);

					return (
						<button
							key={dayName}
							onClick={() => setSelectedDay(dayNum)}
							className={`btn-pill text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap flex items-center gap-1 flex-shrink-0 relative ${
								isSelected
									? "bg-[#00754A] text-white shadow-sm"
									: isToday
									? "bg-[#d4e9e2] text-[#006241] border border-[#00754A]/30 font-black"
									: "bg-[#f2f0eb] hover:bg-slate-200 text-slate-700 border border-slate-200"
							}`}
						>
							<span>{daysShort[index]}</span>
							{isToday && (
								<span className="w-1.5 h-1.5 rounded-full bg-[#006241] animate-ping" />
							)}
							{hasClasses && !isSelected && (
								<span className="w-1 h-1 rounded-full bg-[#00754A]" />
							)}
						</button>
					);
				})}
			</div>

			{/* Render View Mode */}
			{selectedDay !== "all" ? (
				/* Single Day Mobile List View */
				<div className="space-y-3">
					<div className="flex items-center justify-between px-1">
						<h2 className="text-sm font-black text-[#006241] flex items-center gap-2">
							<Sparkles className="w-4 h-4 text-[#00754A]" />
							{daysAbbr[selectedDay - 1]} {selectedDay === currentDay && <span className="text-xs text-[#00754A] font-bold">(Hôm nay)</span>}
						</h2>
						<span className="text-xs font-bold text-slate-500">
							{getRawEventsForDay(selectedDay).length} môn học
						</span>
					</div>

					{getRawEventsForDay(selectedDay).length === 0 ? (
						<div className="surface-card rounded-2xl p-8 text-center border border-slate-200">
							<Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
							<p className="text-xs font-bold text-slate-500">Không có lịch học trong {daysAbbr[selectedDay - 1]}</p>
						</div>
					) : (
						getRawEventsForDay(selectedDay).map((event) => {
							const { startTime, endTime } = getPeriodTime(Number.parseInt(event.tietBatDau), Number.parseInt(event.tietKetThuc), periodTime);
							return (
								<SubjectPopup key={`${event.maHocPhan}-${event.tietBatDau}`} subject={event}>
									<div className="surface-card rounded-2xl p-4 border border-slate-200 border-l-4 border-l-[#00754A] shadow-xs hover:shadow-md transition-all cursor-pointer">
										<div className="flex items-center justify-between gap-2 mb-1.5">
											<div className="flex items-center gap-1.5 flex-wrap">
												<span className="font-mono font-bold text-[10px] text-[#00754A] bg-[#00754A]/10 px-2 py-0.5 rounded-full">
													{event.maHocPhan}
												</span>
												<span className="text-[10px] font-bold text-[#006241] bg-[#006241]/10 px-2 py-0.5 rounded-full">
													Tiết {event.tietBatDau} - {event.tietKetThuc}
												</span>
												{event.nhom !== "0" && (
													<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
														Nhóm {event.nhom}
													</span>
												)}
											</div>
											<span className="text-[10px] font-bold text-slate-400">
												{event.soTinChi} TC
											</span>
										</div>

										<h3 className="font-black text-sm text-slate-900 leading-snug mb-2">
											{event.tenHocPhan}
										</h3>

										<div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
											<div className="flex items-center gap-1.5 text-slate-600 font-medium">
												<Clock className="w-3.5 h-3.5 text-[#00754A] flex-shrink-0" />
												<span className="text-[11px] font-bold">{startTime} - {endTime}</span>
											</div>
											<div className="flex items-center gap-1.5 text-slate-900 font-bold">
												<MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
												<span className="text-[11px] truncate">{event.tenPhong || "Chưa xếp phòng"}</span>
											</div>
										</div>
									</div>
								</SubjectPopup>
							);
						})
					)}
				</div>
			) : (
				/* Full 8-Column Grid View */
				<div>
					<div className="block md:hidden mb-2 text-center">
						<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00754A]/10 text-[#006241] font-bold text-[10px]">
							← Vuốt ngang để xem đầy đủ các ngày trong tuần →
						</span>
					</div>
					<div className="w-full overflow-x-auto pb-6 touch-pan-x">
						<div className="min-w-[1040px]">
							<div className="grid grid-cols-8 gap-0 rounded-2xl overflow-hidden surface-card border border-slate-200">
								{/* Top Left Header Cell */}
								<div className="bg-[#edebe9] border-r border-slate-200 flex items-center justify-center p-3">
									<span className="text-[11px] font-bold text-[#006241] uppercase tracking-wider">Giờ \ Ngày</span>
								</div>

								{/* Day Column Headers */}
								{daysAbbr.map((day, dayIndex) => {
									const isToday = currentDay === dayIndex + 1;
									return (
										<div 
											key={day} 
											className={`border-r border-slate-200 text-center py-3 px-2 font-bold text-xs ${
												isToday 
													? "bg-[#006241] text-white shadow-sm" 
													: "bg-[#edebe9] text-slate-800"
											}`}
										>
											<div className="flex flex-col items-center gap-0.5">
												<span>{day}</span>
												{isToday && <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-200">Hôm nay</span>}
											</div>
										</div>
									);
								})}

								{/* Time Slots & Event Render Grid */}
								{timeSlots.map((time, timeIndex) => (
									<div key={time} className="contents">
										{/* Time Label Column */}
										<div className="bg-[#f2f0eb]/70 border-r border-t border-slate-200 relative min-h-[60px] flex items-center justify-center p-2">
											<span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
												{time}
											</span>
										</div>

										{/* Day Columns */}
										{daysAbbr.map((day, dayIndex) => {
											const isToday = currentDay === dayIndex + 1;
											return (
												<div 
													key={`${day}-${time}`} 
													className={`border-r border-t border-slate-200 relative min-h-[60px] ${
														isToday 
															? "bg-[#d4e9e2]/30" 
															: "bg-white"
													}`}
												>
													{timeIndex === 0 && (
														<div className="absolute inset-0 overflow-visible z-10">
															{getEventsForDay(dayIndex + 1).map((overlapInfo) => 
																<SubjectCard 
																	key={`${overlapInfo.event.maHocPhan}-${overlapInfo.event.ngayTrongTuan}-${overlapInfo.event.tietBatDau}`} 
																	eventInfo={overlapInfo}
																	periodTime={periodTime} 
																/>
															)}
														</div>
													)}
												</div>
											);
										})}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}