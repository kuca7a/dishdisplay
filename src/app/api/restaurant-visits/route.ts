import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurant_id");

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    console.log("Fetching visit statistics for restaurant:", restaurantId);

    // Get visit statistics - simplified query first
    const { data: visits, error: visitsError } = await supabaseServer
      .from("diner_visits")
      .select("id, visit_date, diner_id")
      .eq("restaurant_id", restaurantId)
      .order("visit_date", { ascending: false });

    if (visitsError) {
      console.error("Error fetching visits:", visitsError);
      return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
    }

    // Calculate statistics
    const totalVisits = visits?.length || 0;
    
    // Calculate this month's visits
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthVisits = visits?.filter(visit => 
      new Date(visit.visit_date as string) >= startOfMonth
    ).length || 0;

    // Calculate last month's visits for comparison
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthVisits = visits?.filter(visit => {
      const visitDate = new Date(visit.visit_date as string);
      return visitDate >= startOfLastMonth && visitDate <= endOfLastMonth;
    }).length || 0;

    // Calculate percentage change
    const percentageChange = lastMonthVisits > 0 
      ? ((thisMonthVisits - lastMonthVisits) / lastMonthVisits) * 100 
      : thisMonthVisits > 0 ? 100 : 0;

    // Get unique visitors count
    const uniqueVisitors = new Set(visits?.map(visit => visit.diner_id)).size;

    // Recent visits (last 10) - simplified without diner details for now
    const recentVisits = visits?.slice(0, 10).map(visit => ({
      id: visit.id,
      date: visit.visit_date,
      diner_id: visit.diner_id
    })) || [];

    const statistics = {
      totalVisits,
      thisMonthVisits,
      lastMonthVisits,
      percentageChange: Math.round(percentageChange * 10) / 10, // Round to 1 decimal
      uniqueVisitors,
      recentVisits
    };

    console.log("Visit statistics calculated:", statistics);

    return NextResponse.json(statistics);
  } catch (error) {
    console.error("Restaurant visits API error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
