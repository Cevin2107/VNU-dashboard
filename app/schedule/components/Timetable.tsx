"use client";

import { ThoiKhoaBieuResponse } from "@/types/ResponseTypes";
import SubjectCard from "./SubjectCard";
import { PeriodTime } from "@/lib/constants";

export interface EventInfo {
	event: ThoiKhoaBieuResponse;
	isOverlapped: boolean;
	isMainOverlap: boolean;
	isSameTime: boolean;
}

const daysAbbr = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
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
		
		// Find all overlapping events
		const overlappingEvents: { index: number; event: ThoiKhoaBieuResponse; duration: number; isSameTime: boolean }[] = [];
		
		for (let j = 0; j < events.length; j++) {
			if (i === j) continue;
			
			const event2 = events[j];
			const start2 = Number.parseInt(event2.tietBatDau);
			const end2 = Number.parseInt(event2.tietKetThuc);
			
			// Check if events have exactly the same start and end time
			if (start1 === start2 && end1 === end2) {
				hasOverlap = true;
				isSameTime = true;
				const duration2 = end2 - start2;
				overlappingEvents.push({ index: j, event: event2, duration: duration2, isSameTime: true });
			}
			// Check if events overlap (but not same time)
			else if (start1 <= end2 && start2 <= end1) {
				hasOverlap = true;
				const duration2 = end2 - start2;
				overlappingEvents.push({ index: j, event: event2, duration: duration2, isSameTime: false });
			}
		}
		
		if (hasOverlap && overlappingEvents.length > 0) {
			const duration1 = end1 - start1;
			
			// Check if any overlapping event has the same time
			const hasSameTimeOverlap = overlappingEvents.some(e => e.isSameTime);
			
			if (hasSameTimeOverlap) {
				// For same time events, use side-by-side layout
				// First event in array order goes to the left (isMainOverlap = false)
				const sameTimeEvents = overlappingEvents.filter(e => e.isSameTime);
				const firstSameTimeIndex = Math.min(...sameTimeEvents.map(e => e.index));
				isMainOverlap = i > firstSameTimeIndex; // Later event goes to the right
				isSameTime = true;
			} else {
				// For different duration overlaps, use stacked layout
				// Sort overlapping events by duration (shortest first) then by original index
				overlappingEvents.sort((a, b) => {
					if (a.duration !== b.duration) {
						return a.duration - b.duration;
					}
					return a.index - b.index;
				});
				
				// Current event gets left side if it's shorter than the shortest overlapping event
				// or if it has same duration but comes first in the original array
				const shortestOverlap = overlappingEvents[0];
				if (duration1 < shortestOverlap.duration || 
					(duration1 === shortestOverlap.duration && i < shortestOverlap.index)) {
					isMainOverlap = false; // This event goes to the left
				} else {
					isMainOverlap = true; // This event stays on the right
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

export default function Timetable({data, periodTime}: {data: ThoiKhoaBieuResponse[], periodTime: PeriodTime[]}) {
	function getEventsForDay(day: number): EventInfo[] {
		const dayEvents = data.filter(event => Number.parseInt(event.ngayTrongTuan) === day);
		return detectOverlaps(dayEvents);
	}

	return (
		<div className="w-full mx-auto overflow-x-auto pb-4">
			<div className="min-w-[900px]">
				<div className="grid grid-cols-8 gap-0 rounded-2xl overflow-hidden shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-800">
					{/* Header Row */}
					<div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 border-r border-gray-200/80 dark:border-gray-600/50"></div>
					{daysAbbr.map((day, dayIndex) => (
						<div 
							key={day} 
							className={`border-r border-gray-200/80 dark:border-gray-600/50 text-center py-3.5 font-bold text-base transition-all duration-300 ${
								getCurrDayOfWeek() === dayIndex + 1 
									? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md" 
									: "bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
							}`}
						>
							{day}
						</div>
					))}

					{/* Time Slots and Events */}
					{timeSlots.map((time, timeIndex) => (
						<div key={time} className="contents">
							{/* Time Column */}
							<div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 border-r border-t border-gray-200/80 dark:border-gray-600/50 relative min-h-[65px] flex items-center justify-center">
								<span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 px-2.5 py-1 rounded-md border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
									{time}
								</span>
							</div>

							{/* Day Columns */}
							{daysAbbr.map((day, dayIndex) => (
								<div 
									key={`${day}-${time}`} 
									className={`border-r border-t border-gray-200/80 dark:border-gray-600/50 relative min-h-[65px] transition-colors ${
										getCurrDayOfWeek() === dayIndex + 1 
											? "bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50/60 dark:hover:bg-blue-900/15" 
											: "bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-750"
									}`}
								>
									{timeIndex === 0 && (
										<div className="absolute inset-0 overflow-visible">
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
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}