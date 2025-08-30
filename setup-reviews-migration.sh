#!/bin/bash

echo "🗄️  DishDisplay - Menu Item Reviews Migration"
echo "=============================================="
echo ""
echo "⚠️  IMPORTANT: The review system requires database tables that don't exist yet."
echo ""
echo "📋 To fix the 500 error when submitting reviews, you need to run this SQL in your Supabase dashboard:"
echo ""
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the entire contents of: migrations/create_menu_item_reviews.sql"
echo "4. Click 'Run' to execute the migration"
echo ""
echo "🔗 Migration file location: $(pwd)/migrations/create_menu_item_reviews.sql"
echo ""
echo "📊 This migration will create:"
echo "   • menu_item_reviews table (for storing reviews)"
echo "   • diner_profiles table (if not exists)"
echo "   • menu_item_reviews_with_diner view (for displaying reviews with diner info)"
echo "   • Row Level Security policies"
echo "   • Automatic rating calculation triggers"
echo ""
echo "✅ After running the migration, reviews will work properly!"
echo ""

# Check if the migration file exists
if [ -f "migrations/create_menu_item_reviews.sql" ]; then
    echo "📄 Migration file found. Here are the first few lines:"
    echo "----------------------------------------"
    head -20 migrations/create_menu_item_reviews.sql
    echo "----------------------------------------"
    echo "... (truncated, see full file for complete migration)"
else
    echo "❌ Migration file not found at migrations/create_menu_item_reviews.sql"
fi
