import crypto from "crypto";
import { getSupabaseAdmin } from "./supabase.server";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "obp_admin_session";
const SESSION_DAYS = Number(process.env.SESSION_DAYS || "14");
const DEVICE_HINT_COOKIE = "obp_admin_device";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function parseCookie(header: string | null) {
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );
}

export function buildDeviceHintSetCookie() {
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const parts = [
    `${DEVICE_HINT_COOKIE}=1`,
    "Path=/",
    "SameSite=Lax",
    `Expires=${expiresAt.toUTCString()}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function hasDeviceHintCookie(request: Request) {
  const header = request.headers.get("cookie");
  if (!header) return false;
  return header.split(";").some((c) => c.trim().startsWith(`${DEVICE_HINT_COOKIE}=`));
}

export async function createAdminSession(adminUserId: string) {
  const supabase = getSupabaseAdmin();

  const token = crypto.randomBytes(32).toString("hex"); // goes in cookie
  const tokenHash = sha256(token); // stored in DB
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  const { error } = await supabase.from("admin_sessions").insert({
    admin_user_id: adminUserId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw new Error("Failed to create session");

  return { token, expiresAt };
}

export function buildSessionSetCookie(token: string, expiresAt: Date) {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Expires=${expiresAt.toUTCString()}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function buildSessionClearCookie() {
  const parts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export async function requireAdmin(request: Request) {
  const cookies = parseCookie(request.headers.get("cookie"));
  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const tokenHash = sha256(token);

  // join admin_users to verify email is yours
  const { data } = await supabase
    .from("admin_sessions")
    .select("admin_user_id, expires_at, admin_users!inner(email)")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!data) return null;

  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  const email = (data as any).admin_users.email as string;
  if (!email || email.toLowerCase() !== process.env.ADMIN_EMAIL!.toLowerCase()) return null;

  return { adminUserId: data.admin_user_id, email };
}

