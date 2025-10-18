# Supabase Storage Setup Guide

## Required Storage Buckets

Your Solar Glow application needs the following storage buckets:

1. `products` - For product images
2. `avatars` - For user profile pictures
3. `forum-attachments` - For forum post attachments

## How to Create Storage Buckets in Supabase

Since your application lacks the admin privileges required to create buckets programmatically, you'll need to create them manually in the Supabase dashboard.

### Step-by-Step Guide

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Click on "Storage" in the left sidebar
4. Click the "New Bucket" button
5. Create each of the required buckets with the following settings:

For each bucket:

- **Name**: `products`, `avatars`, or `forum-attachments`
- **Public bucket**: Enabled (check the box)
- **File size limit**: 10MB (recommended)

### Security Settings

After creating the buckets, you'll need to set up Row Level Security (RLS) policies to control access:

1. Click on the bucket name in the Storage section
2. Go to the "Policies" tab
3. Create policies based on your application's needs:

#### Example Policies

**For the `products` bucket:**

- Allow anyone to view files (but only authenticated users to upload)
- Allow only admin users to delete files

**For the `avatars` bucket:**

- Allow users to view all avatars
- Allow users to upload/update only their own avatar

**For the `forum-attachments` bucket:**

- Allow anyone to view attachments
- Allow authenticated users to upload attachments
- Allow only the attachment owner or admin to delete attachments

## Troubleshooting

If you see warnings about missing storage buckets in your application, it means the app has detected that one or more of the required buckets are not set up in your Supabase project.

The application has been updated to check for the existence of required buckets rather than trying to create them automatically, which prevents errors related to insufficient permissions.
