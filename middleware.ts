import { type NextRequest, NextResponse } from "next/server";
import {
  CREATE_ALERT_ROUTE,
  MY_VOLUNTEERING,
  ROOT_ROUTE,
  SESSION_COOKIE_NAME,
} from "./constants";

const protectedRoutes = [CREATE_ALERT_ROUTE, MY_VOLUNTEERING];

export default function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value || "";

  if (!session && protectedRoutes.includes(request.nextUrl.pathname)) {
    const absoluteURL = new URL(ROOT_ROUTE, request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  if (session && request.nextUrl.pathname === ROOT_ROUTE) {
    const absoluteURL = new URL(ROOT_ROUTE, request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }
}
