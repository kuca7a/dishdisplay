# Supabase Storage Setup Guide

## Quick Setup for Image Uploads

Your image upload feature is ready, but you need to create a storage bucket in Supabase first.

### Step 1: Create Storage Bucket

1. **Go to your Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Sign in and select your project

2. **Navigate to Storage**
   - Click **"Storage"** in the left sidebar
   - Click **"New bucket"**

3. **Configure the Bucket**
   ```
   Bucket name: menu-images
   Public bucket: ✅ (checked)
   File size limit: 5242880 (5MB)
   Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp
   ```

4. **Click "Create bucket"**

### Step 2: Set Row Level Security (Optional but Recommended)

After creating the bucket, you can set up security policies:

1. Go to **Storage > Policies**
2. Create a new policy for the `menu-images` bucket
3. Use this SQL for basic security:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload menu images" ON storage.objects
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id = 'menu-images'
  AND (storage.foldername(name))[1] = auth.jwt() ->> 'email'
);

-- Allow public read access to images
CREATE POLICY "Allow public read access to menu images" ON storage.objects
FOR SELECT
USING (bucket_id = 'menu-images');
```

### Step 3: Test the Upload

1. **Go to your Menu Management page**
2. **Click "Add New Item"**
3. **Try uploading an image using:**
   - File selection (click "Choose File")
   - Camera capture (click "Take Photo" on mobile)
   - URL input (as fallback)

## Features Included

✅ **File Upload**: Choose images from device
✅ **Camera Capture**: Take photos directly (mobile)
✅ **Drag & Drop**: Drag images onto upload area
✅ **Image Compression**: Automatic optimization
✅ **Progress Indicator**: Shows upload progress
✅ **Error Handling**: Clear error messages
✅ **URL Fallback**: Enter image URLs if storage isn't set up
✅ **Preview**: See images before uploading

## Troubleshooting

**"Bucket not found" error?**
- Make sure you created the `menu-images` bucket
- Check the bucket name is exactly `menu-images`
- Ensure the bucket is marked as public

**Images not loading?**
- Check your Supabase URL and keys are correct
- Verify the bucket has public read access

**Upload fails?**
- Check file size (max 5MB)
- Ensure file is an image (JPG, PNG, WEBP)
- Verify your internet connection

## Next Steps

Once storage is set up, your users can:
- Upload high-quality menu item photos
- Take pictures directly with their camera
- Automatically optimized images for fast loading
- Professional-looking menu displays
