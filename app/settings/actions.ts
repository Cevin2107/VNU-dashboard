"use server";

import { cookies } from "next/headers";

const WELCOME_SETTING_KEY = "welcome-enabled";
const ADMIN_PASSWORD = "Anhquan210706";

export async function getWelcomeEnabled(): Promise<boolean> {
	const cookieStore = await cookies();
	const setting = cookieStore.get(WELCOME_SETTING_KEY);
	// Default: true (bật welcome)
	return setting?.value !== "false";
}

export async function setWelcomeEnabled(
	password: string,
	enabled: boolean
): Promise<{ success: boolean; message: string }> {
	if (password !== ADMIN_PASSWORD) {
		return {
			success: false,
			message: "Mật khẩu không đúng!",
		};
	}

	const cookieStore = await cookies();
	cookieStore.set(WELCOME_SETTING_KEY, enabled ? "true" : "false", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 365, // 1 year
		path: "/",
	});

	return {
		success: true,
		message: enabled
			? "Đã bật trang Welcome"
			: "Đã tắt trang Welcome - Sẽ redirect về /login",
	};
}
