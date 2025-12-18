# Cloudflare R2 Avatar Storage Setup Guide

## 🚀 Quick Setup

Follow these steps to configure Cloudflare R2 for avatar storage:

### 1. Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2** in the sidebar
3. Click **Create bucket**
4. Name it `avatars` (or your preferred name)
5. Click **Create bucket**

### 2. Enable Public Access (Optional but Recommended)

1. Go to your bucket settings
2. Click **Settings** tab
3. Under **Public access**, click **Allow Access**
4. Choose **Custom domain** or **R2.dev subdomain**:
   - **Custom domain**: Connect your own domain (e.g., `cdn.yourdomain.com`)
   - **R2.dev subdomain**: Get a free `pub-xxxxx.r2.dev` URL

### 3. Create API Token

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Configure:
   - **Token name**: `avatar-uploads`
   - **Permissions**: `Object Read & Write`
   - **Bucket**: Select your `avatars` bucket (or All buckets)
   - **TTL**: Optional (leave blank for no expiration)
4. Click **Create API token**
5. **Copy and save** these values:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (e.g., `https://xxxxx.r2.cloudflarestorage.com`)

### 4. Add Environment Variables

Add these to your `.env.local` file:

```env
# Cloudflare R2 Configuration
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key-id-here
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key-here
R2_BUCKET_NAME=avatars
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
# OR if using custom domain:
# R2_PUBLIC_URL=https://cdn.yourdomain.com
```

**Important values to replace:**
- `R2_ENDPOINT`: Your R2 endpoint from step 3
- `R2_ACCESS_KEY_ID`: Access Key ID from step 3
- `R2_SECRET_ACCESS_KEY`: Secret Access Key from step 3
- `R2_BUCKET_NAME`: Your bucket name from step 1
- `R2_PUBLIC_URL`: Your public URL from step 2

### 5. Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## ✅ Testing

1. Visit `/admin/settings` or `/profile`
2. Click **Upload Photo**
3. Select an image
4. Image should upload to R2 and display immediately

## 🔒 Security Features

The API route (`/api/upload/avatar`) includes:
- ✅ **Authentication check** - Only logged-in users can upload
- ✅ **User verification** - Users can only upload their own avatars
- ✅ **File validation** - Images only, max 2MB
- ✅ **Auto-cleanup** - Old avatars are deleted when uploading new ones
- ✅ **Unique filenames** - `avatars/{userId}-{timestamp}.{ext}`

## 📁 File Structure

Uploaded avatars are stored as:
```
uploads/avatars/
  ├── {userId}-{timestamp}.jpg
  ├── {userId}-{timestamp}.png
  └── {userId}-{timestamp}.webp
```

## 🌐 Public URLs

Images are accessible at:
```
{R2_PUBLIC_URL}/uploads/avatars/{userId}-{timestamp}.{ext}
```

Example:
```
https://pub-xxxxx.r2.dev/uploads/avatars/user123-1234567890.jpg
```

## 💰 Pricing

Cloudflare R2 has generous free tier:
- **10 GB storage** - Free
- **1 million Class A operations/month** - Free
- **10 million Class B operations/month** - Free
- **No egress fees** - Ever!

## 🆘 Troubleshooting

### Upload fails with "Unauthorized"
- Make sure `.env.local` has correct R2 credentials
- Restart your dev server after adding env vars

### Images don't display
- Check `R2_PUBLIC_URL` is correct
- Verify bucket has public access enabled
- Check browser console for CORS errors

### "Endpoint not found" error
- Verify `R2_ENDPOINT` includes `/` at the end if needed
- Make sure endpoint URL matches your Cloudflare account

## 🔄 Migration from Supabase Storage

If you previously used Supabase Storage:
1. Old Supabase avatars will still work
2. New uploads go to R2
3. When user updates avatar, new one goes to R2
4. Old Supabase files remain (manual cleanup needed if desired)

## 📝 Notes

- R2 is S3-compatible, so we use AWS SDK
- Images are cached with `max-age=31536000` (1 year)
- Old avatars are automatically deleted on new upload
- Component works with both Supabase and R2 URLs

---

**Ready to use!** Once configured, avatar uploads will use Cloudflare R2 storage. 🎉
