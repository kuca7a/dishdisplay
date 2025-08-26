import { NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/supabase-server';

export async function POST() {
  try {
    const supabase = getServerSupabaseClient();

    const results = [];

    // Step 1: Check if display_name column exists
    console.log('Step 1: Checking display_name column...');
    const { data: columns } = await supabase.rpc('exec', {
      sql: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'diner_profiles' AND column_name = 'display_name';
      `
    });

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      // Add display_name column
      const { error: addColumnError } = await supabase.rpc('exec', {
        sql: `ALTER TABLE diner_profiles ADD COLUMN display_name TEXT;`
      });
      results.push({ step: 'add_display_name_column', error: addColumnError });
    }

    // Step 2: Update existing profiles with display names
    console.log('Step 2: Setting display names...');
    const { error: updateError } = await supabase.rpc('exec', {
      sql: `
        UPDATE diner_profiles 
        SET display_name = SPLIT_PART(email, '@', 1)
        WHERE display_name IS NULL OR display_name = '';
      `
    });
    results.push({ step: 'update_display_names', error: updateError });

    // Step 3: Get current diner profile
    console.log('Step 3: Checking diner profile...');
    const { data: dinerProfile, error: profileError } = await supabase
      .from('diner_profiles')
      .select('*')
      .eq('email', 'hdcatalyst@gmail.com')
      .maybeSingle();

    results.push({ step: 'get_diner_profile', data: dinerProfile, error: profileError });

    // Step 4: Ensure current leaderboard period exists
    console.log('Step 4: Checking leaderboard period...');
    let { data: period } = await supabase
      .from('leaderboard_periods')
      .select('id')
      .eq('status', 'active')
      .maybeSingle();

    if (!period) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Monday
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6); // Sunday

      const { data: newPeriod, error: periodError } = await supabase
        .from('leaderboard_periods')
        .insert({
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active'
        })
        .select('id')
        .single();

      period = newPeriod;
      results.push({ step: 'create_leaderboard_period', data: period, error: periodError });
    }

    // Step 5: Add sample points if profile and period exist
    if (dinerProfile && period) {
      console.log('Step 5: Adding sample points...');
      
      // Add visit points
      const { error: visitError } = await supabase
        .from('diner_points')
        .upsert({
          diner_id: dinerProfile.id,
          leaderboard_period_id: period.id,
          points: 10,
          earned_from: 'visit',
          source_id: crypto.randomUUID()
        }, { ignoreDuplicates: true });

      // Add review points
      const { error: reviewError } = await supabase
        .from('diner_points')
        .upsert({
          diner_id: dinerProfile.id,
          leaderboard_period_id: period.id,
          points: 25,
          earned_from: 'review',
          source_id: crypto.randomUUID()
        }, { ignoreDuplicates: true });

      results.push({ step: 'add_visit_points', error: visitError });
      results.push({ step: 'add_review_points', error: reviewError });

      // Update rankings
      const { error: rankingError } = await supabase
        .from('leaderboard_rankings')
        .upsert({
          leaderboard_period_id: period.id,
          diner_id: dinerProfile.id,
          total_points: 35,
          rank: 1,
          is_winner: true
        }, { ignoreDuplicates: true });

      results.push({ step: 'update_rankings', error: rankingError });
    }

    // Step 6: Final verification
    console.log('Step 6: Final verification...');
    const { data: finalProfiles } = await supabase
      .from('diner_profiles')
      .select('*')
      .limit(5);

    const { data: finalPoints } = await supabase
      .from('diner_points')
      .select('*')
      .limit(5);

    const { data: finalRankings } = await supabase
      .from('leaderboard_rankings')
      .select('*')
      .limit(5);

    return NextResponse.json({
      success: true,
      message: 'Schema fix completed',
      results,
      verification: {
        profiles: finalProfiles,
        points: finalPoints,
        rankings: finalRankings
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
