import { ThoiKhoaBieuResponse } from "@/types/ResponseTypes";
import { getPeriodTime } from "@/lib/constants";
import { createEvents, EventAttributes } from "ics";
import { PeriodTime } from "./constants";

const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const SEC_PER_DAY = 24 * 60 * 60;

function getJsDayFromVnuDay(ngayTrongTuanStr: string): number {
	const day = Number.parseInt(ngayTrongTuanStr);
	if (day === 7 || day === 8) return 0; // Sunday
	if (day >= 1 && day <= 6) return day; // 1 -> 1 (Mon), 2 -> 2 (Tue), ..., 6 -> 6 (Sat)
	return day % 7;
}

export function toCalendar(data: ThoiKhoaBieuResponse[], startDate: Date, totalWeeks: number, periodTime: PeriodTime[]): string {
	const events: EventAttributes[] = [];

	for (const event of data) {
		const { startTime, endTime } = getPeriodTime(Number.parseInt(event.tietBatDau), Number.parseInt(event.tietKetThuc), periodTime);
		const targetJsDay = getJsDayFromVnuDay(event.ngayTrongTuan);
		const currentJsDay = startDate.getDay();

		let delta = targetJsDay - currentJsDay;
		if (delta < 0) {
			delta += 7;
		}
		
		const endDate = new Date(startDate.getTime() + (totalWeeks * 7 - 1) * SEC_PER_DAY * 1000);
		let endDateStr = endDate.toISOString();
		endDateStr = endDateStr.replaceAll("-", "").replaceAll(":", "").slice(0, endDateStr.length - 9) + "Z"; 

		const eventStartDate = new Date(startDate.getTime() + delta * SEC_PER_DAY * 1000);

		const e: EventAttributes = {
			title: event.tenHocPhan + (event.nhom === "0"? "" : ` (Nhóm ${event.nhom})`),
			location: `${event.tenPhong || ""}${event.diaChi ? `, ${event.diaChi}` : ""}`,
			start: [
				eventStartDate.getFullYear(),
				eventStartDate.getMonth() + 1,
				eventStartDate.getDate(),
				Number.parseInt(startTime.split(":")[0]),
				Number.parseInt(startTime.split(":")[1])
			],
			duration: { 
				hours: Number.parseInt(endTime.split(":")[0]) - Number.parseInt(startTime.split(":")[0]),
				minutes: Number.parseInt(endTime.split(":")[1]) - Number.parseInt(startTime.split(":")[1])
			},
			recurrenceRule: `FREQ=WEEKLY;BYDAY=${days[targetJsDay]};UNTIL=${endDateStr}`,
		};
		events.push(e);
	}

	const { error, value } = createEvents(events);
	if (error) {
		throw new Error(`Error creating calendar events: ${error}`);
	}

	return value || '';
}