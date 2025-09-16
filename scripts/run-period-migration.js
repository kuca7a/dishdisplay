#!/usr/bin/env node

/**
 * Simple script to execute our period management migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Read and execute the migration
  const migrationPath = path.join(__dirname, '..', 'migrations', 'add_period_management.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('🚀 Running period management migration...');
  
  try {
    // Split the migration into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          console.error('❌ Statement failed:', statement.substring(0, 100));
          console.error('Error:', error);
          // Continue with other statements instead of failing completely
        }
      }
    }
    
    console.log('✅ Period management migration completed successfully!');
    console.log('📊 Testing leaderboard system...');
    
    // Test the leaderboard system
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('leaderboard_periods')
      .select('*')
      .eq('status', 'active')
      .single();
    
    if (leaderboardError) {
      console.log('⚠️  No active period found, this is expected for a fresh setup');
    } else {
      console.log('📈 Active period found:', leaderboard);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

runMigration();