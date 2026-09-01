import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type GoogleUser = { sub: string; email: string; name: string; picture?: string; emailVerified: boolean };
const COOKIE = "wedrip_session";

export function googleStartPath(returnTo = "/account") { return `/api/auth/google?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`; }
export function safeReturnTo(value: string) { return value.startsWith("/") && !value.startsWith("//") ? value : "/account"; }
export async function getGoogleUser(): Promise<GoogleUser | null> { const token = (await cookies()).get(COOKIE)?.value; if (!token) return null; const [payload, signature] = token.split("."); if (!payload || !signature || !constantTimeEqual(signature, await sign(payload))) return null; try { return JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as GoogleUser; } catch { return null; } }
export async function requireGoogleUser(returnTo = "/account") { const user = await getGoogleUser(); if (user) return user; redirect(googleStartPath(returnTo)); }
export async function createSession(user: GoogleUser) { const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(user))); return `${payload}.${await sign(payload)}`; }
export function sessionCookieName() { return COOKIE; }
export async function sign(value: string) { const secret = process.env.AUTH_SESSION_SECRET || process.env.GOOGLE_CLIENT_SECRET; if (!secret) throw new Error("AUTH_SESSION_SECRET is required"); const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)))); }
function toBase64Url(value: Uint8Array) { let binary = ""; value.forEach((byte) => { binary += String.fromCharCode(byte); }); return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", ""); }
function fromBase64Url(value: string) { const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - value.length % 4) % 4)); return Uint8Array.from(binary, (char) => char.charCodeAt(0)); }
function constantTimeEqual(a: string, b: string) { if (a.length !== b.length) return false; let result = 0; for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i); return result === 0; }
