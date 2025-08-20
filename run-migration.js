#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * This script helps you run the nutritional fields migration.
 * 
 * IMPORTANT: You need to run the SQL migration in your Supabase dashboard first!
 * 
 * The migration file is located at: ./migrations/add_menu_nutritional_fields.sql
 * 
 * Steps to run the migration:
 * 1. Go to your Supabase dashboard
 * 2. Navigate to SQL Editor
 * 3. Copy and paste the contents of add_menu_nutritional_fields.sql
 * 4. Run the SQL migration
 * 5. After migration is successful, you can use the updated forms
 */

const fs = require('fs');
const path = require('path');

console.log('🗃️  DishDisplay Database Migration Helper');
console.log('==========================================\n');

const migrationPath = path.join(__dirname, 'migrations', 'add_menu_nutritional_fields.sql');

if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found at:', migrationPath);
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📋 Migration SQL to run in Supabase:');
console.log('=====================================\n');
console.log(migrationSQL);
console.log('\n=====================================');

console.log('\n📌 Steps to run this migration:');
console.log('1. Copy the SQL above');
console.log('2. Go to your Supabase dashboard');
console.log('3. Navigate to: SQL Editor');
console.log('4. Paste the SQL and click "Run"');
console.log('5. Verify the migration completed successfully');
console.log('\n⚠️  Until this migration is run, the menu forms with nutritional');
console.log('   information will not work and may show 404 errors.');

console.log('\n✅ After migration, your menu items will have:');
console.log('   - detailed_description (required)');
console.log('   - calories (required)');
console.log('   - allergens (required array)');
console.log('   - ingredients (required)');

console.log('\n🎯 This will enable the new nutritional information features!');
