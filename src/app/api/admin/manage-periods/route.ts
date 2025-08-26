import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export async function POST() {
  try {
    const supabase = getServerSupabaseClient();

    // Call the period management function
    const { data: managementResults, error: managementError } = await supabase
      .rpc('manage_leaderboard_periods');

    if (managementError) {
      console.error('Period management error:', managementError);
      return NextResponse.json({
        success: false,
        error: managementError.message
      }, { status: 500 });
    }

    // Get current period status
    const { data: currentPeriods } = await supabase
      .from('leaderboard_periods')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(3);

    return NextResponse.json({
      success: true,
      message: 'Leaderboard periods managed successfully',
      actions_taken: managementResults,
      current_periods: currentPeriods,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Period management error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getServerSupabaseClient();

    // Just get current period status without making changes
    const { data: periods, error } = await supabase
      .from('leaderboard_periods')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    const currentDate = new Date().toISOString().split('T')[0];
    
    const periodsWithStatus = periods?.map(period => {
      const startDate = period.start_date as string;
      const endDate = period.end_date as string;
      
      return {
        ...period,
        is_current: currentDate >= startDate && currentDate <= endDate,
        week_status: currentDate >= startDate && currentDate <= endDate 
          ? 'CURRENT' 
          : currentDate > endDate 
          ? 'PAST' 
          : 'FUTURE'
      };
    }) || [];

    return NextResponse.json({
      success: true,
      periods: periodsWithStatus,
      current_date: currentDate
    });

  } catch (error) {
    console.error('Period status error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
