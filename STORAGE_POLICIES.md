# Supabase Storage Policies Setup

## Copy and paste these into your Supabase Dashboard → Storage → menu-images → Policies

### Policy 1: Allow Authenticated Uploads

```sql
CREATE POLICY "Allow authenticated uploads to menu-images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images'
  AND auth.role() = 'authenticated'
);
```

### Policy 2: Allow Public Read Access

```sql
CREATE POLICY "Allow public read access to menu-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'menu-images');
```

### Quick Fix (Development Only - Less Secure)

If you just want to test quickly:

```sql
CREATE POLICY "Allow all operations on menu-images"
ON storage.objects
FOR ALL
USING (bucket_id = 'menu-images');
```

## How to Apply:

1. Go to Supabase Dashboard
2. Storage → menu-images → Policies
3. Click "New Policy"
4. Choose "For full customization"
5. Paste one of the policies above
6. Click "Review" → "Save policy"

## Current Error Explanation:

The "new row violates row-level security policy" error means Supabase is correctly blocking unauthorized access to your storage bucket. You need to create policies that allow your authenticated users to upload images.
