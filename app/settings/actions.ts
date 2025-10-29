"use server";

import { revalidatePath } from "next/cache";

const ADMIN_PASSWORD = "Anhquan210706";
const EDGE_CONFIG_KEY = "welcome_enabled";

// Check if Edge Config is configured
const isEdgeConfigConfigured = () => {
	return !!process.env.EDGE_CONFIG;
};

export async function getWelcomeEnabled(): Promise<boolean> {
	try {
		// Try Edge Config if configured
		if (isEdgeConfigConfigured()) {
			const { get } = await import("@vercel/edge-config");
			const value = await get(EDGE_CONFIG_KEY);
			
			if (value !== null && value !== undefined) {
				// Edge Config can return string or boolean
				return value === "true" || value === true;
			}
		}
		
		// Fallback to env var (for dev without Edge Config)
		if (process.env.WELCOME_ENABLED !== undefined) {
			return process.env.WELCOME_ENABLED === "true";
		}
	} catch (error) {
		console.error("Error reading from Edge Config:", error);
	}
	
	// Default: true (welcome enabled)
	return true;
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

	// Check if Edge Config is configured
	if (!isEdgeConfigConfigured()) {
		return {
			success: false,
			message: "⚠️ Edge Config chưa được cấu hình.\n\nTrong development: Tính năng này chỉ hoạt động sau khi setup Edge Config.\nTạm thời welcome page luôn BẬT.\n\n📖 Xem: VERCEL_KV_SETUP.md",
		};
	}

	try {
		// Edge Config requires update via API
		// We need to use Vercel API with token
		const edgeConfigId = process.env.EDGE_CONFIG?.split("/").pop()?.split("?")[0];
		const vercelToken = process.env.VERCEL_API_TOKEN;

		if (!vercelToken) {
			return {
				success: false,
				message: "⚠️ VERCEL_API_TOKEN chưa được cấu hình.\n\nCần thêm Personal Access Token vào Environment Variables.\n\n📖 Hướng dẫn:\n1. Vercel Dashboard → Settings → Tokens\n2. Create Token\n3. Add VERCEL_API_TOKEN vào project",
			};
		}

		if (!edgeConfigId) {
			return {
				success: false,
				message: "⚠️ Không tìm thấy Edge Config ID",
			};
		}

		// Update Edge Config via API
		const response = await fetch(
			`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${vercelToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					items: [
						{
							operation: "upsert",
							key: EDGE_CONFIG_KEY,
							value: enabled ? "true" : "false",
						},
					],
				}),
			}
		);

		if (!response.ok) {
			const error = await response.text();
			console.error("Edge Config update error:", error);
			return {
				success: false,
				message: "❌ Không thể cập nhật Edge Config. Vui lòng thử lại!",
			};
		}

		// Revalidate để apply thay đổi
		revalidatePath("/", "layout");

		return {
			success: true,
			message: enabled
				? "✅ Đã bật trang Welcome - Áp dụng TOÀN CẦU (có thể mất 5-10s để sync)!"
				: "✅ Đã tắt trang Welcome - Áp dụng TOÀN CẦU (có thể mất 5-10s để sync)!",
		};
	} catch (error) {
		console.error("Error writing to Edge Config:", error);
		
		return {
			success: false,
			message: "❌ Có lỗi khi lưu vào Edge Config. Vui lòng thử lại!",
		};
	}
}
