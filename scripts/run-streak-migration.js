/**
 * Run database migration for streak and profile completion features
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Running streak and profile completion migration...');

    // Add streak fields
    console.log('Adding streak tracking fields...');
    await supabase.rpc('exec', {
      sql: `
        ALTER TABLE diner_profiles 
        ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_visit_date DATE,
        ADD COLUMN IF NOT EXISTS streak_updated_at TIMESTAMP WITH TIME ZONE;
      `
    });

    // Add profile completion fields
    console.log('Adding profile completion fields...');
    await supabase.rpc('exec', {
      sql: `
        ALTER TABLE diner_profiles 
        ADD COLUMN IF NOT EXISTS profile_completion_bonus_claimed BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;
      `
    });

    // Add indexes
    console.log('Creating indexes...');
    await supabase.rpc('exec', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_diner_profiles_last_visit_date ON diner_profiles(last_visit_date);
        CREATE INDEX IF NOT EXISTS idx_diner_profiles_current_streak ON diner_profiles(current_streak);
      `
    });

    // Update existing profiles
    console.log('Updating existing profile completion percentages...');
    await supabase.rpc('exec', {
      sql: `
        UPDATE diner_profiles 
        SET profile_completion_percentage = (
          CASE WHEN profile_photo_url IS NOT NULL AND profile_photo_url != '' THEN 25 ELSE 0 END +
          CASE WHEN bio IS NOT NULL AND LENGTH(bio) > 10 THEN 25 ELSE 0 END +
          CASE WHEN dietary_preferences IS NOT NULL AND dietary_preferences != '' THEN 25 ELSE 0 END +
          CASE WHEN location IS NOT NULL AND location != '' THEN 25 ELSE 0 END
        );
      `
    });

    console.log('✅ Migration completed successfully!');
    console.log('📊 New features available:');
    console.log('  🔥 Visit streaks (3+ consecutive days = +15 bonus points)');
    console.log('  📝 Profile completion bonus (100% complete = +25 points)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
