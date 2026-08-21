import { ThoiKhoaBieuResponse, LichThiResponse } from "@/types/ResponseTypes";
import { PeriodTime, defaultPeriodTime } from "@/lib/constants";
import { getPeriodTime } from "@/app/schedule/components/SubjectCard";

export interface GoogleCalendarConfig {
	apiKey: string;
	calendarId: string;
}

export class GoogleCalendarService {
	private apiKey: string;
	private calendarId: string;

	constructor(customConfig?: Partial<GoogleCalendarConfig>) {
		this.apiKey = customConfig?.apiKey || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";
		this.calendarId = customConfig?.calendarId || process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || "primary";
	}

	public get isConfigured(): boolean {
		return !!this.apiKey && this.apiKey !== "mã_google_api_key_của_bạn";
	}

	/**
	 * Save user API credentials to localStorage
	 */
	public static saveCredentials(apiKey: string, calendarId: string) {
		if (typeof window === "undefined") return;
		localStorage.setItem("vnu_google_api_key", apiKey);
		localStorage.setItem("vnu_google_calendar_id", calendarId);
	}

	/**
	 * Load user API credentials from localStorage
	 */
	public static getSavedCredentials(): GoogleCalendarConfig {
		if (typeof window === "undefined") {
			return { apiKey: "", calendarId: "primary" };
		}
		return {
			apiKey: localStorage.getItem("vnu_google_api_key") || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
			calendarId: localStorage.getItem("vnu_google_calendar_id") || process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || "primary"
		};
	}

	/**
	 * Sync Timetable Schedule Events into Google Calendar (with Overwrite & Delete)
	 */
	public async syncSchedule(
		schedule: ThoiKhoaBieuResponse[],
		semesterId: string,
		startDate: Date,
		totalWeeks: number,
		periodTime: PeriodTime[] = defaultPeriodTime,
		customConfig?: GoogleCalendarConfig
	): Promise<number> {
		const apiKey = customConfig?.apiKey || this.apiKey;
		const calendarId = customConfig?.calendarId || this.calendarId;

		if (!apiKey) {
			throw new Error("Vui lòng nhập Google API Key để tiến hành đồng bộ.");
		}

		// Delete existing events for this semester before sync (Overwrite)
		await this.deleteSemesterSchedule(semesterId, customConfig);

		let createdCount = 0;

		const daysRrule = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

		for (const item of schedule) {
			const dayOfWeek = Number.parseInt(item.ngayTrongTuan); // 1=Mon, 2=Tue, ..., 6=Sat, 7/8=Sun
			const jsDay = (dayOfWeek === 7 || dayOfWeek === 8) ? 0 : (dayOfWeek >= 1 && dayOfWeek <= 6 ? dayOfWeek : dayOfWeek % 7); // JS 0 = Sun, 1 = Mon

			// Calculate first occurrence date
			const firstDate = new Date(startDate);
			const currentJsDay = firstDate.getDay();
			let dayOffset = jsDay - currentJsDay;
			if (dayOffset < 0) dayOffset += 7;
			firstDate.setDate(firstDate.getDate() + dayOffset);

			const y = firstDate.getFullYear();
			const m = String(firstDate.getMonth() + 1).padStart(2, "0");
			const d = String(firstDate.getDate()).padStart(2, "0");
			const dateStr = `${y}-${m}-${d}`;

			const period = getPeriodTime(Number.parseInt(item.tietBatDau), Number.parseInt(item.tietKetThuc), periodTime);

			const startIsoStr = `${dateStr}T${period.startTime}:00+07:00`;
			const endIsoStr = `${dateStr}T${period.endTime}:00+07:00`;

			const eventBody = {
				summary: item.tenHocPhan,
				location: `${item.tenPhong || ""}${item.diaChi ? `, ${item.diaChi}` : ""}`,
				description: `Môn học: ${item.tenHocPhan}\nMã học phần: ${item.maHocPhan}\nNhóm: ${item.nhom === "0" ? "Lớp chung" : item.nhom}\nGiảng viên: ${item.giangVien1 || "Chưa cập nhật"}\n(Tự động đồng bộ từ VNU Portal)`,
				start: {
					dateTime: startIsoStr,
					timeZone: "Asia/Ho_Chi_Minh"
				},
				end: {
					dateTime: endIsoStr,
					timeZone: "Asia/Ho_Chi_Minh"
				},
				recurrence: [
					`RRULE:FREQ=WEEKLY;BYDAY=${daysRrule[jsDay]};COUNT=${totalWeeks}`
				],
				extendedProperties: {
					private: {
						vnu_type: "schedule",
						vnu_semester_id: semesterId,
						vnu_course_code: item.maHocPhan
					}
				}
			};

			const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}`;
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(eventBody)
			});

			if (res.ok) createdCount++;
		}

		return createdCount;
	}

	/**
	 * Delete all synced schedule events for a given semester
	 */
	public async deleteSemesterSchedule(
		semesterId: string,
		customConfig?: GoogleCalendarConfig
	): Promise<number> {
		const apiKey = customConfig?.apiKey || this.apiKey;
		const calendarId = customConfig?.calendarId || this.calendarId;

		if (!apiKey) return 0;

		const listUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&privateExtendedProperty=${encodeURIComponent(`vnu_semester_id=${semesterId}`)}&privateExtendedProperty=${encodeURIComponent("vnu_type=schedule")}`;
		const res = await fetch(listUrl);

		if (!res.ok) return 0;

		const data = await res.json();
		const events = data.items || [];

		let deletedCount = 0;
		for (const event of events) {
			const delRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${event.id}?key=${apiKey}`, {
				method: "DELETE"
			});
			if (delRes.ok) deletedCount++;
		}

		return deletedCount;
	}

	/**
	 * Sync Exam Schedule Events into Google Calendar (with Overwrite)
	 */
	public async syncExams(
		exams: LichThiResponse[],
		semesterId: string,
		customConfig?: GoogleCalendarConfig
	): Promise<number> {
		const apiKey = customConfig?.apiKey || this.apiKey;
		const calendarId = customConfig?.calendarId || this.calendarId;

		if (!apiKey) {
			throw new Error("Vui lòng nhập Google API Key để tiến hành đồng bộ.");
		}

		// Delete existing exam events for this semester
		const listUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&privateExtendedProperty=${encodeURIComponent(`vnu_semester_id=${semesterId}`)}&privateExtendedProperty=${encodeURIComponent("vnu_type=exam")}`;
		const listRes = await fetch(listUrl);

		if (listRes.ok) {
			const data = await listRes.json();
			for (const event of data.items || []) {
				await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${event.id}?key=${apiKey}`, {
					method: "DELETE"
				});
			}
		}

		let createdCount = 0;

		for (const exam of exams) {
			if (!exam.ngayThi) continue;

			const dateParts = exam.ngayThi.split("/");
			if (dateParts.length !== 3) continue;
			const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

			const startTimeStr = exam.gioBatDauThi || "07:30";
			const startHour = Number.parseInt(startTimeStr.split(":")[0]);
			const startMin = Number.parseInt(startTimeStr.split(":")[1] || "0");
			const endHour = startHour + 2;

			const startIso = `${isoDate}T${startTimeStr}:00`;
			const endIso = `${isoDate}T${String(endHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}:00`;

			const eventBody = {
				summary: `Thi: ${exam.tenHocPhan}`,
				location: `${exam.phongThi || ""}${exam.diaChi ? `, ${exam.diaChi}` : ""}`,
				description: `Lịch thi môn: ${exam.tenHocPhan}\nMã môn: ${exam.maHocPhan}\nSố tín chỉ: ${exam.soTinChi}\nHình thức thi: ${exam.hinhThucThi || "N/A"}\n(Tự động đồng bộ từ VNU Portal)`,
				start: {
					dateTime: new Date(startIso).toISOString(),
					timeZone: "Asia/Ho_Chi_Minh"
				},
				end: {
					dateTime: new Date(endIso).toISOString(),
					timeZone: "Asia/Ho_Chi_Minh"
				},
				extendedProperties: {
					private: {
						vnu_type: "exam",
						vnu_semester_id: semesterId,
						vnu_course_code: exam.maHocPhan
					}
				}
			};

			const createRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(eventBody)
			});

			if (createRes.ok) createdCount++;
		}

		return createdCount;
	}
}
