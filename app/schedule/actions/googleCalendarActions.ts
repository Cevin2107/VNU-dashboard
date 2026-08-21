"use server";

import crypto from "crypto";
import { ThoiKhoaBieuResponse, LichThiResponse } from "@/types/ResponseTypes";
import { PeriodTime, defaultPeriodTime, getPeriodTime } from "@/lib/constants";

function base64UrlEncode(str: string): string {
	return Buffer.from(str)
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

async function getServiceAccountAccessToken(): Promise<string> {
	const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
	let privateKey = process.env.GOOGLE_PRIVATE_KEY;

	if (!email || !privateKey) {
		throw new Error("Chưa cấu hình GOOGLE_SERVICE_ACCOUNT_EMAIL hoặc GOOGLE_PRIVATE_KEY trong file .env.local");
	}

	privateKey = privateKey.replace(/\\n/g, "\n");

	const now = Math.floor(Date.now() / 1000);
	const header = { alg: "RS256", typ: "JWT" };
	const payload = {
		iss: email,
		scope: "https://www.googleapis.com/auth/calendar",
		aud: "https://oauth2.googleapis.com/token",
		exp: now + 3600,
		iat: now,
	};

	const encodedHeader = base64UrlEncode(JSON.stringify(header));
	const encodedPayload = base64UrlEncode(JSON.stringify(payload));
	const signatureInput = `${encodedHeader}.${encodedPayload}`;

	const signer = crypto.createSign("RSA-SHA256");
	signer.update(signatureInput);
	const signature = signer.sign(privateKey, "base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");

	const jwt = `${signatureInput}.${signature}`;

	const res = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
			assertion: jwt,
		}),
	});

	if (!res.ok) {
		const errText = await res.text();
		throw new Error(`Xác thực Service Account thất bại: ${errText}`);
	}

	const data = await res.json();
	return data.access_token;
}

function getCalendarId(): string {
	return process.env.GOOGLE_CALENDAR_ID || "primary";
}

// Map VNU ngayTrongTuan (1=Mon, 2=Tue, ..., 6=Sat, 7/8=Sun) to JS day (0-6, where 0 is Sunday, 1 is Monday)
const mapDayOfWeekToJsDay = (dayOfWeek: number): number => {
	if (dayOfWeek === 7 || dayOfWeek === 8) return 0; // Sunday
	if (dayOfWeek >= 1 && dayOfWeek <= 6) return dayOfWeek; // 1=Mon, 2=Tue, ..., 6=Sat
	return dayOfWeek % 7;
};

const daysRrule = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/**
 * Calculates the next occurrence of a weekday at a given time in Vietnam timezone (GMT+7)
 * returning an ISO 8601 string with +07:00 timezone offset and RRULE BYDAY code.
 */
function getNextWeekdayISOString(dayOfWeek: number, timeStr: string, startDateStr: string): { isoString: string; byDay: string } {
	const targetJsDay = mapDayOfWeekToJsDay(dayOfWeek);

	const [y, m, d] = startDateStr.split("-").map(Number);
	// Create base date in UTC representing midnight on the given YYYY-MM-DD
	const base = new Date(Date.UTC(y, m - 1, d));

	const currentJsDay = base.getUTCDay();
	let daysDiff = targetJsDay - currentJsDay;
	if (daysDiff < 0) {
		daysDiff += 7;
	}

	const targetDate = new Date(base.getTime() + daysDiff * 24 * 60 * 60 * 1000);
	const targetY = targetDate.getUTCFullYear();
	const targetM = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
	const targetD = String(targetDate.getUTCDate()).padStart(2, "0");

	const [h, min] = timeStr.split(":");
	const formattedH = String(Number(h)).padStart(2, "0");
	const formattedMin = String(Number(min || "0")).padStart(2, "0");

	return {
		isoString: `${targetY}-${targetM}-${targetD}T${formattedH}:${formattedMin}:00+07:00`,
		byDay: daysRrule[targetJsDay],
	};
}

export async function deleteSemesterScheduleAction(semesterId: string): Promise<number> {
	const token = await getServiceAccountAccessToken();
	const calendarId = getCalendarId();

	const listUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?privateExtendedProperty=${encodeURIComponent(`vnu_semester_id=${semesterId}`)}&privateExtendedProperty=${encodeURIComponent("vnu_type=schedule")}`;
	const res = await fetch(listUrl, {
		headers: { Authorization: `Bearer ${token}` }
	});

	if (!res.ok) return 0;

	const data = await res.json();
	const events = data.items || [];

	let deletedCount = 0;
	for (const event of events) {
		const delRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${event.id}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` }
		});
		if (delRes.ok) deletedCount++;
	}

	return deletedCount;
}

export async function syncScheduleAction(
	schedule: ThoiKhoaBieuResponse[],
	semesterId: string,
	startDateStr: string, // Format: "YYYY-MM-DD"
	totalWeeks: number,
	periodTime: PeriodTime[] = defaultPeriodTime
): Promise<number> {
	const token = await getServiceAccountAccessToken();
	const calendarId = getCalendarId();

	// Overwrite existing schedule for this semester
	await deleteSemesterScheduleAction(semesterId);

	let createdCount = 0;

	for (const item of schedule) {
		const dayOfWeekNum = Number.parseInt(item.ngayTrongTuan); // 2=Mon, 3=Tue, ..., 7=Sat, 8=Sun
		const period = getPeriodTime(Number.parseInt(item.tietBatDau), Number.parseInt(item.tietKetThuc), periodTime);

		const startInfo = getNextWeekdayISOString(dayOfWeekNum, period.startTime, startDateStr);
		const endInfo = getNextWeekdayISOString(dayOfWeekNum, period.endTime, startDateStr);

		// Event object structure with explicit GMT+7 offset and RRULE BYDAY parameter
		const eventBody = {
			summary: item.tenHocPhan,
			location: `${item.tenPhong || ""}${item.diaChi ? `, ${item.diaChi}` : ""}`,
			description: `Môn học: ${item.tenHocPhan}\nMã học phần: ${item.maHocPhan}\nNhóm: ${item.nhom === "0" ? "Lớp chung" : item.nhom}\nGiảng viên: ${item.giangVien1 || "Chưa cập nhật"}\n(Tự động đồng bộ từ VNU Portal)`,
			start: {
				dateTime: startInfo.isoString,
				timeZone: "Asia/Ho_Chi_Minh"
			},
			end: {
				dateTime: endInfo.isoString,
				timeZone: "Asia/Ho_Chi_Minh"
			},
			recurrence: [
				`RRULE:FREQ=WEEKLY;BYDAY=${startInfo.byDay};COUNT=${totalWeeks}`
			],
			extendedProperties: {
				private: {
					vnu_type: "schedule",
					vnu_semester_id: semesterId,
					vnu_course_code: item.maHocPhan
				}
			}
		};

		const createRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(eventBody)
		});

		if (createRes.ok) createdCount++;
	}

	return createdCount;
}

export async function syncExamsAction(
	exams: LichThiResponse[],
	semesterId: string
): Promise<number> {
	const token = await getServiceAccountAccessToken();
	const calendarId = getCalendarId();

	// Delete existing exam events for this semester
	const listUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?privateExtendedProperty=${encodeURIComponent(`vnu_semester_id=${semesterId}`)}&privateExtendedProperty=${encodeURIComponent("vnu_type=exam")}`;
	const res = await fetch(listUrl, {
		headers: { Authorization: `Bearer ${token}` }
	});

	if (res.ok) {
		const data = await res.json();
		for (const event of data.items || []) {
			await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${event.id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` }
			});
		}
	}

	let createdCount = 0;

	for (const exam of exams) {
		if (!exam.ngayThi) continue;

		const dateParts = exam.ngayThi.split("/");
		if (dateParts.length !== 3) continue;
		const year = dateParts[2];
		const month = dateParts[1].padStart(2, "0");
		const date = dateParts[0].padStart(2, "0");

		const startTimeStr = exam.gioBatDauThi || "07:30";
		const startHour = Number.parseInt(startTimeStr.split(":")[0]);
		const startMin = Number.parseInt(startTimeStr.split(":")[1] || "0");
		const endHour = startHour + 2;

		const startIsoStr = `${year}-${month}-${date}T${startTimeStr}:00+07:00`;
		const endIsoStr = `${year}-${month}-${date}T${String(endHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}:00+07:00`;

		const eventBody = {
			summary: `Thi: ${exam.tenHocPhan}`,
			location: `${exam.phongThi || ""}${exam.diaChi ? `, ${exam.diaChi}` : ""}`,
			description: `Lịch thi môn: ${exam.tenHocPhan}\nMã môn: ${exam.maHocPhan}\nSố tín chỉ: ${exam.soTinChi}\nHình thức thi: ${exam.hinhThucThi || "N/A"}\n(Tự động đồng bộ từ VNU Portal)`,
			start: {
				dateTime: startIsoStr,
				timeZone: "Asia/Ho_Chi_Minh"
			},
			end: {
				dateTime: endIsoStr,
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

		const createRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(eventBody)
		});

		if (createRes.ok) createdCount++;
	}

	return createdCount;
}

export async function deleteExamScheduleAction(semesterId: string): Promise<number> {
	const token = await getServiceAccountAccessToken();
	const calendarId = getCalendarId();

	const listUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?privateExtendedProperty=${encodeURIComponent(`vnu_semester_id=${semesterId}`)}&privateExtendedProperty=${encodeURIComponent("vnu_type=exam")}`;
	const res = await fetch(listUrl, {
		headers: { Authorization: `Bearer ${token}` }
	});

	if (!res.ok) return 0;

	const data = await res.json();
	const events = data.items || [];

	let deletedCount = 0;
	for (const event of events) {
		const delRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${event.id}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` }
		});
		if (delRes.ok) deletedCount++;
	}

	return deletedCount;
}
