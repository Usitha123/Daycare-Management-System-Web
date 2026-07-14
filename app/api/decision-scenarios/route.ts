import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/decision-scenarios
 * Query params: ?model_type=staffing (optional filter)
 * Returns the current user's saved scenarios.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const modelType = searchParams.get("model_type");

    let query = supabase
      .from("decision_scenarios")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (modelType) {
      query = query.eq("model_type", modelType);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ scenarios: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/decision-scenarios
 * Body: { name, model_type, parameters }
 * Creates a new saved scenario for the current user.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, model_type, parameters } = await request.json();

    if (!name || !model_type || !parameters) {
      return NextResponse.json(
        { error: "Missing required fields: name, model_type, parameters" },
        { status: 400 }
      );
    }

    const VALID_MODEL_TYPES = ["staffing", "cost", "breakeven", "growth", "profit"];
    if (!VALID_MODEL_TYPES.includes(model_type)) {
      return NextResponse.json(
        { error: `Invalid model_type. Must be one of: ${VALID_MODEL_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("decision_scenarios")
      .insert({
        user_id: user.id,
        name,
        model_type,
        parameters,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ scenario: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
