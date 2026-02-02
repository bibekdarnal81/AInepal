This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## R2 Object Storage

This project includes Cloudflare R2 object storage integration for file uploads and management.

### Setup R2 Credentials

1. **Create a Cloudflare R2 Bucket**:
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to R2 Object Storage
   - Click "Create bucket" and give it a name
   - Note your bucket name

2. **Generate R2 API Tokens**:
   - In the R2 dashboard, click "Manage R2 API Tokens"
   - Click "Create API token"
   - Give it a name and select appropriate permissions (Read & Write)
   - Copy the Access Key ID and Secret Access Key
   - Find your Account ID in the Cloudflare dashboard (top right corner)

3. **Configure Environment Variables**:
   
   Add the following to your `.env.local` file:
   
   ```bash
   # Cloudflare R2 Configuration
   R2_ACCOUNT_ID=your_account_id_here
   R2_ACCESS_KEY_ID=your_access_key_id_here
   R2_SECRET_ACCESS_KEY=your_secret_access_key_here
   R2_BUCKET_NAME=your_bucket_name_here
   R2_PUBLIC_URL=https://your-bucket.r2.dev  # Optional: only if using public access
   ```

4. **Optional - Enable Public Access**:
   - In your R2 bucket settings, you can enable public access
   - Configure a custom domain or use the default R2.dev domain
   - Add the public URL to `R2_PUBLIC_URL` environment variable

### Usage

#### Using the API Routes

**Upload a file**:
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/your/file.jpg"
```

**List files**:
```bash
curl http://localhost:3000/api/files
```

**Delete a file**:
```bash
curl -X DELETE http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -d '{"key": "uploads/1234567890-file.jpg"}'
```

#### Using the React Component

Import and use the `FileUpload` component in your pages:

```tsx
import FileUpload from '@/components/file-upload';

export default function MyPage() {
  return (
    <FileUpload
      onUploadComplete={(file) => {
        console.log('File uploaded:', file);
      }}
      onUploadError={(error) => {
        console.error('Upload error:', error);
      }}
      maxSizeMB={10}
    />
  );
}
```

#### Using the R2 Operations Directly

```typescript
import { uploadFile, deleteFile, listFiles } from '@/lib/r2/operations';

// Upload a file
const result = await uploadFile({
  buffer: fileBuffer,
  key: 'path/to/file.jpg',
  contentType: 'image/jpeg',
});

// List files
const files = await listFiles({ prefix: 'uploads/' });

// Delete a file
await deleteFile('path/to/file.jpg');
```

### File Upload Limits

- **Maximum file size**: 10MB (configurable in `/app/api/upload/route.ts`)
- **Allowed file types**: Images (JPEG, PNG, GIF, WebP), PDF, TXT, CSV (configurable)

### Troubleshooting

**"Missing required R2 configuration" error**:
- Ensure all required environment variables are set in `.env.local`
- Restart your development server after adding environment variables

**Upload fails with 403 error**:
- Verify your R2 API tokens have the correct permissions
- Check that the bucket name is correct

**File URL returns 404**:
- If using public URLs, ensure public access is enabled on your bucket
- If using presigned URLs, they expire after 1 hour by default

#  AINepal
# Ainepal
# AInepal
