import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const accessToken = request.cookies.get("accessToken")?.value;
	const isAuthenticated = !!accessToken;

	// Redirect /welcome and /dashboard to /schedule
	if (pathname === "/welcome" || pathname === "/dashboard") {
		return NextResponse.redirect(new URL(isAuthenticated ? "/schedule" : "/login", request.url));
	}

	// Root path: redirect to /schedule if authenticated, else /login
	if (pathname === "/") {
		return NextResponse.redirect(new URL(isAuthenticated ? "/schedule" : "/login", request.url));
	}

	// Protect student routes: require authenticated session
	const protectedRoutes = ["/schedule", "/exam"];
	if (protectedRoutes.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|sw.js|manifest.json|vnu_logo.png|robots.txt).*)",
	],
};
