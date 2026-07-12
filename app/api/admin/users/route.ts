import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * POST /api/admin/users
 *
 * Creates a new user with full auth credentials (email + password).
 * Only existing admin users can call this endpoint.
 *
 * Body: { email, password, full_name, role, phone? }
 */
export async function POST(request: Request) {
  try {
    // ── 1. Verify the caller is authenticated and has admin role ──
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Read-only session checking — no need to set cookies
          },
        },
      }
    );

    const {
      data: { user: caller },
    } = await supabase.auth.getUser();

    if (!caller) {
      return NextResponse.json({ error: "Unauthorized — not authenticated" }, { status: 401 });
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (!callerProfile || callerProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — admin role required" }, { status: 403 });
    }

    // ── 2. Parse & validate the request body ──
    const { email, password, full_name, role, phone } = await request.json();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, full_name, role" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const VALID_ROLES = ["admin", "manager", "teacher", "caregiver", "parent"];
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }

    // ── 3. Create auth user using service-role client ──
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // auto-confirm so user can log in immediately
        user_metadata: { full_name, role },
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // ── 4. Update the profile (the trigger creates one, but we set the correct data) ──
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        full_name,
        role,
        phone: phone || null,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      // Rollback — delete the auth user we just created
      await adminClient.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: `Failed to create profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    // ── 5. If role is teacher/caregiver/manager/admin, auto-create a staff record ──
    const STAFF_ROLES = ["teacher", "caregiver", "manager", "admin"];
    if (STAFF_ROLES.includes(role)) {
      await adminClient.from("staff").insert({
        profile_id: authData.user.id,
        role,
        shift_start: "08:00",
        shift_end: "16:00",
        status: "off",
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        full_name,
        role,
        phone: phone || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
