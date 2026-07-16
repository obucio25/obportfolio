import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect, useActionData, useLoaderData } from "react-router";

import { getSupabaseAdmin } from "../../lib/supabase.server";
import { requireAdmin } from "../../lib/adminAuth.server";

export const meta: MetaFunction = () => [{ title: "Edit Status" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const admin = await requireAdmin(request);
  if (!admin) return redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "header_status")
    .maybeSingle();

  return { status: data?.value ?? "Open for work", email: admin.email };
}

export async function action({ request }: ActionFunctionArgs) {
  const admin = await requireAdmin(request);
  if (!admin) return redirect("/admin/login");

  const form = await request.formData();
  const status = String(form.get("status") || "").trim();

  if (!status) return { error: "Status cannot be empty." };
  if (status.length > 60) return { error: "Keep it under 60 characters." };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: "header_status", value: status, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) return { error: "Failed to save status." };

  return { ok: true };
}

export default function AdminStatus() {
  const { status, email } = useLoaderData() as { status: string; email: string };
  const actionData = useActionData() as { error?: string; ok?: boolean } | undefined;

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: 16 }}>
      <h1>Edit Header Status</h1>
      <p style={{ color: "#64748b" }}>
        Signed in as <strong>{email}</strong>
      </p>

      <Form method="post" style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          Status text
          <input
            name="status"
            defaultValue={status}
            style={{ width: "100%", padding: 10 }}
          />
        </label>

        {actionData?.error && <div style={{ color: "crimson" }}>{actionData.error}</div>}
        {actionData?.ok && <div style={{ color: "green" }}>Saved ✅</div>}

        <button type="submit" style={{ padding: 10 }}>
          Save
        </button>
      </Form>

      <p style={{ marginTop: 18, color: "#64748b" }}>
        Tip: try “Open for work”, “Open to new grad roles”, etc.
      </p>
    </div>
  );
}
