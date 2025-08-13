import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log("API: Updating restaurant with ID:", id);
    console.log("API: Update data:", body);

    const supabase = getServerSupabaseClient();

    // Update the restaurant using service role (bypasses RLS)
    const { data, error } = await supabase
      .from("restaurants")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("API: Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      console.error("API: No restaurant found with ID:", id);
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    console.log("API: Update successful:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API: Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
