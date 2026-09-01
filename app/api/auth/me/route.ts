import { NextResponse } from "next/server";
import { getGoogleUser } from "@/lib/google-auth";
export async function GET() { const user = await getGoogleUser(); return user ? NextResponse.json({ user }) : NextResponse.json({ user: null }, { status: 401 }); }
