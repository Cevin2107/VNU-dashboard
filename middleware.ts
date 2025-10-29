import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { get } from "@vercel/edge-config";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Chỉ check cho các route cần thiết
	if (pathname === "/" || pathname === "/welcome" || pathname === "/login") {
		try {
			// Fetch welcome setting từ Edge Config (fast, runs on edge)
			const welcomeEnabled = await get("welcome_enabled");
			const isEnabled = welcomeEnabled === "true" || welcomeEnabled === true || welcomeEnabled === null;

			// Check auth state (từ cookies)
			const accessToken = request.cookies.get("accessToken")?.value;
			const isAuthenticated = !!accessToken;

			// Logic redirect
			if (!isEnabled) {
				// Welcome DISABLED
				if (!isAuthenticated && pathname !== "/login") {
					return NextResponse.redirect(new URL("/login", request.url));
				}
			} else {
				// Welcome ENABLED (logic cũ)
				if (pathname === "/" && !isAuthenticated) {
					return NextResponse.redirect(new URL("/welcome", request.url));
				}
			}
		} catch (error) {
			console.error("Middleware error:", error);
			// Fallback: Không redirect nếu lỗi
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (public folder)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|sw.js|manifest.json|vnu_logo.png|robots.txt).*)",
	],
};
