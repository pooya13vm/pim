import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const authCookie = req.cookies.get("auth")?.value;
  const isLoggedIn = authCookie === "authenticated";

  // مسیرهایی که باید همیشه باز باشن
  if (
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // اگر لاگین کرده، اجازه بده
  if (isLoggedIn) {
    return NextResponse.next();
  }

  // در غیر این صورت، هدایت به /login
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
