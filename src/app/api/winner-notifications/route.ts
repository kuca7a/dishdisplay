import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

// GET - Fetch user's winner history and unseen notifications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("email");
    const type = searchParams.get("type") || "all"; // 'all', 'unseen', 'history'

    if (!userEmail) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    if (type === "unseen") {
      // Get only unseen notifications
      const { data, error } = await supabase.rpc(
        "get_unseen_winner_notifications",
        {
          p_email: userEmail,
        }
      );

      if (error) {
        console.error("Error fetching unseen notifications:", error);
        return NextResponse.json(
          { error: "Failed to fetch notifications" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        notifications: data || [],
      });
    } else if (type === "history") {
      // Get complete winner history
      const { data, error } = await supabase.rpc("get_winner_history", {
        p_email: userEmail,
      });

      if (error) {
        console.error("Error fetching winner history:", error);
        return NextResponse.json(
          { error: "Failed to fetch winner history" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        history: data || [],
      });
    } else {
      // Get both unseen and history
      const [unseenResult, historyResult] = await Promise.all([
        supabase.rpc("get_unseen_winner_notifications", { p_email: userEmail }),
        supabase.rpc("get_winner_history", { p_email: userEmail }),
      ]);

      if (unseenResult.error || historyResult.error) {
        console.error(
          "Error fetching notifications:",
          unseenResult.error || historyResult.error
        );
        return NextResponse.json(
          { error: "Failed to fetch notifications" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        notifications: unseenResult.data || [],
        history: historyResult.data || [],
      });
    }
  } catch (error) {
    console.error("Winner notifications API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Mark notification as seen
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, period_id } = body;

    if (!email || !period_id) {
      return NextResponse.json(
        { error: "Email and period_id are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc(
      "mark_winner_notification_seen",
      {
        p_winner_email: email,
        p_period_id: period_id,
      }
    );

    if (error) {
      console.error("Error marking notification as seen:", error);
      return NextResponse.json(
        { error: "Failed to mark notification as seen" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      marked: data,
    });
  } catch (error) {
    console.error("Winner notifications mark API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
