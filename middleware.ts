import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const accessToken = request.cookies.get("accessToken")?.value;
	const isAuthenticated = !!accessToken;

	// Luôn bỏ trang welcome và chuyển thẳng sang login
	if (pathname === "/welcome") {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Trang root: chọn login hoặc dashboard tùy trạng thái đăng nhập
	if (pathname === "/") {
		return NextResponse.redirect(new URL(isAuthenticated ? "/dashboard" : "/login", request.url));
	}

	// Đã đăng nhập thì không cần xem lại trang login
	if (pathname === "/login" && isAuthenticated) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Bảo vệ các trang chính
	const protectedRoutes = ["/dashboard", "/gpa", "/schedule", "/exam"];
	if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
		return NextResponse.redirect(new URL("/login", request.url));
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
