/**
 * Create review-photos storage bucket in Supabase
 */
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createReviewBucket() {
  try {
    console.log('Creating review-photos bucket...');

    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('review-photos', {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ review-photos bucket already exists');
        return;
      }
      throw error;
    }

    console.log('✅ review-photos bucket created successfully');

    // Create RLS policy for review photos
    const { error: policyError } = await supabase
      .rpc('create_policy', {
        table_name: 'objects',
        policy_name: 'Allow authenticated users to upload review photos',
        operation: 'INSERT',
        expression: 'bucket_id = \'review-photos\' AND auth.role() = \'authenticated\''
      });

    if (policyError) {
      console.warn('Warning: Could not create RLS policy:', policyError.message);
    }

    console.log('✅ Setup complete! Review photos can now be uploaded.');

  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
    process.exit(1);
  }
}

createReviewBucket();
