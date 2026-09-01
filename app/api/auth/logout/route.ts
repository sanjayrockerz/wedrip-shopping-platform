import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/google-auth";
export function GET(request: Request) { const response = NextResponse.redirect(new URL("/", request.url)); response.cookies.set(sessionCookieName(), "", { httpOnly: true, expires: new Date(0), path: "/" }); return response; }
