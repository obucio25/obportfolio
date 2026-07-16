import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect, useActionData } from "react-router";
import bcrypt from "bcryptjs";

import { getSupabaseAdmin } from "../../lib/supabase.server";
import {
  buildSessionSetCookie,
  createAdminSession,
  requireAdmin,
  buildDeviceHintSetCookie,
} from "../../lib/adminAuth.server";

export const meta: MetaFunction = () => [{ title: "Admin Login" }];

export async function action({ request }: ActionFunctionArgs) {
  console.log("✅ /admin/login action hit", new Date().toISOString());
  
  // // If already logged in, skip login
  // const existing = await requireAdmin(request);
  // if (existing) {
  //   return redirect("/admin/status");
  // }

  const form = await request.formData();
  const rememberDevice = form.get("rememberDevice") === "1";

  const existing = await requireAdmin(request);
  if (existing) {
    if(rememberDevice) {
      const headers = new Headers();
      headers.append("Set-Cookie", buildDeviceHintSetCookie());
      return redirect("/admin/status", { headers });
    }
    return redirect("/admin/status");
  }

  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Only allow your admin email
  if (email !== process.env.ADMIN_EMAIL!.toLowerCase()) {
    return { error: "Invalid credentials." };
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("admin_users")
    .select("id, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (!data) return { error: "Invalid credentials." };

  const ok = await bcrypt.compare(password, data.password_hash);
  if (!ok) return { error: "Invalid credentials." };

  const { token, expiresAt } = await createAdminSession(data.id);
  const sessionCookie = buildSessionSetCookie(token, expiresAt);

  const headers = new Headers();
  headers.append("Set-Cookie", sessionCookie);

  if(rememberDevice) {
    const hintCookie = buildDeviceHintSetCookie();
    headers.append("Set-Cookie", hintCookie);
  }

  return redirect("/admin/status", { headers });
}

export default function AdminLogin() {
  const data = useActionData() as { error?: string } | undefined;

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1>Admin Login</h1>
      <p style={{ color: "#64748b" }}>
        Sign in to edit your portfolio content.
      </p>

      <Form method="post" style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            style={{ width: "100%", padding: 10 }}
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            style={{ width: "100%", padding: 10 }}
          />
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "Center" }}>
          <input type="checkbox" name="rememberDevice" value="1" />
          Remember this device
        </label>

        {data?.error && (
          <div style={{ color: "crimson" }}>{data.error}</div>
        )}

        <button type="submit" style={{ padding: 10 }}>
          Sign in
        </button>
      </Form>
    </div>
  );
}
