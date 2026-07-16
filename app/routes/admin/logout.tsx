import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { getSupabaseAdmin } from "../../lib/supabase.server";
import { buildSessionClearCookie, requireAdmin } from "../../lib/adminAuth.server";
import crypto from "crypto";

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

export async function action({ request }: ActionFunctionArgs) {
  // If not logged in, just clear cookie and go home
  const admin = await requireAdmin(request);

  // Try to delete server-side session row too (nice cleanup)
  const cookieName = process.env.SESSION_COOKIE_NAME || "obp_admin_session";
  const cookies = parseCookie(request.headers.get("cookie"));
  const token = cookies[cookieName];

  if (token) {
    const supabase = getSupabaseAdmin();
    await supabase.from("admin_sessions").delete().eq("token_hash", sha256(token));
  }

  const headers = new Headers();
  headers.append("Set-Cookie", buildSessionClearCookie());

  // Optional: send you home after logout
  return redirect("/", { headers });
}

export default function Logout() {
  // No UI needed; logout is a POST action
  return null;
}
