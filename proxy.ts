import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!token;

  // Public routes
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based access control
  const userRole = token?.role;

  // Working Hours Restriction (Exempt Admins)
  if (userRole !== "ADMIN") {
    // We use Intl.DateTimeFormat to get Kampala time regardless of server location
    const now = new Date();
    const kampalaTime = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Kampala",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(now);

    const getPart = (type: string) =>
      kampalaTime.find((p) => p.type === type)?.value;
    const day = getPart("weekday");
    const hour = parseInt(getPart("hour") || "0");
    const minute = parseInt(getPart("minute") || "0");
    const currentTimeMinutes = hour * 60 + minute;

    let isWorkTime = false;
    let scheduleText = "";

    if (
      day === "Mon" ||
      day === "Tue" ||
      day === "Wed" ||
      day === "Thu" ||
      day === "Fri"
    ) {
      isWorkTime =
        currentTimeMinutes >= 8 * 60 && currentTimeMinutes <= 17 * 60;
      scheduleText = "Mon-Fri: 08:00 - 17:00";
    } else if (day === "Sat") {
      isWorkTime =
        currentTimeMinutes >= 9 * 60 && currentTimeMinutes <= 14 * 60;
      scheduleText = "Sat: 09:00 - 14:00";
    }

    // Allow access only if it's work time OR user is already clocked in
    // Note: session/token 'isClockedIn' would need to be updated during clock-in/out
    const isClockedIn = token?.isClockedIn === true;

    if (!isWorkTime && !isClockedIn && pathname.startsWith("/dashboard")) {
      // Allow only if they are trying to access a restricted dashboard area
      // We can redirect to a custom "Outside Working Hours" page or just show a message
      return NextResponse.rewrite(new URL("/off-hours", req.url));
    }
  }

  if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    pathname.startsWith("/supervisor") &&
    userRole !== "SUPERVISOR" &&
    userRole !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon-|apple-icon).*)"],
};
