# Gallery Image Upload System

## Architecture Overview

```
           Client (Admin)
                 │
                 ├── 1. Select images in GalleryForm
                 ├── 2. POST /api/upload (multipart form-data)
                 │      ├── file: <image>
                 │      └── dir: "gallery"
                 │
                 ▼
         /api/upload route (src/app/api/upload/route.ts)
                 │
                 ├── Validate MIME (jpeg, png, webp, avif)
                 ├── Decode with Sharp
                 ├── Resize to max 1200px width (without enlargement)
                 ├── Convert to JPEG @ 70% quality
                 │
                 ▼
         Write to: {UPLOAD_DIR}/uploads/gallery/{timestamp}-{random}.jpg
                 │
                 ▼
         Return: { urls: ["/uploads/gallery/{filename}.jpg"] }
                 │
                 ▼
          3. Client calls createGalleryImagesBatch({ urls, caption, category })
                 │
                 ▼
          Prisma: INSERT INTO gallery_images (url, caption, category)
                 │
                 ▼
          4. router.refresh() → re-reads gallery_images from DB
```

## File Storage

### Upload Path Resolution

The upload API determines the save location as follows (`src/app/api/upload/route.ts:21`):

```ts
const baseDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public")
const uploadDir = path.join(baseDir, "uploads", subDir)
```

| Environment | `UPLOAD_DIR` | `process.cwd()` | Result |
|------------|-------------|-----------------|--------|
| Development | unset | `/project/root` | `/project/root/public/uploads/gallery/` |
| Standalone | unset | `/project/root/.next/standalone` | `/.next/standalone/public/uploads/gallery/` |
| Standalone | `/absolute/path` | — | `/absolute/path/uploads/gallery/` |

### URL Serving

The returned URL `/uploads/gallery/{filename}.jpg` is served as a **static file** by the Next.js server. In development mode, it reads from `<project>/public/uploads/gallery/`. In production (standalone), it reads from `<standalone>/public/uploads/gallery/`.

## The Deployment Problem

### Issue: Uploaded images disappear or 404 after `next build`

The root cause is that **standalone output** (`output: "standalone"` in `next.config.ts`) creates a self-contained runtime in `.next/standalone/`. The server runs from this directory, so `process.cwd()` resolves to `.next/standalone/`, not the project root.

```
Project root:  /home/kswms/apps/prisan/
Standalone:    /home/kswms/apps/prisan/.next/standalone/

Upload writes to:  .next/standalone/public/uploads/gallery/{file}
Served from:       .next/standalone/public/uploads/gallery/{file}

If uploads go here but a rebuild clears or doesn't copy them → 404
```

### Symlink Solution (current deploy.sh)

The deploy script (`deploy.sh`) handles this with a **symlink**:

```bash
# Remove the uploads dir from standalone
rm -rf .next/standalone/public/uploads

# Replace with a symlink to the persistent uploads directory
ln -s /home/kswms/apps/prisan/public/uploads /home/kswms/apps/prisan/.next/standalone/public/uploads
```

This ensures:
- Uploaded files are physically stored in `/home/kswms/apps/prisan/public/uploads/` (persistent across deploys)
- The standalone server can read/write through the symlink
- The URL `/uploads/...` resolves correctly

### UPLOAD_DIR Alternative

For environments where symlinks are problematic, set `UPLOAD_DIR` to an absolute path outside the build tree:

```bash
# In .env or runtime environment
UPLOAD_DIR=/var/data/prisan-uploads
```

When set, the upload API writes directly to `/var/data/prisan-uploads/uploads/gallery/`.  
**But** the Next.js server does NOT serve files from outside the `public/` directory. You would need either:

1. A reverse proxy rule (nginx/apache) to serve `/uploads/*` from `/var/data/prisan-uploads/uploads/`
2. Or symlink `/var/data/prisan-uploads/uploads/` → `<standalone>/public/uploads/`

## Image Processing Pipeline

### API Route (`src/app/api/upload/route.ts`)

```ts
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]
MAX_WIDTH = 1200
JPEG_QUALITY = 70
```

| Step | Operation | Detail |
|------|-----------|--------|
| 1 | MIME validation | Rejects anything not in `ALLOWED_TYPES` |
| 2 | Decode | Sharp reads the raw Buffer |
| 3 | Resize | If width > 1200px, downscale to 1200px (maintains aspect ratio, no upscaling) |
| 4 | Encode | Always outputs JPEG at quality 70 |
| 5 | Filename | `{timestamp}-{random6}.jpg` (e.g. `1717654321-a1b2c3.jpg`) |
| 6 | Save | Writes to `{UPLOAD_DIR}/uploads/{subDir}/{filename}` |

### Input constraints

- **Body size limit**: 5 MB (configured in `next.config.ts` via `serverActions.bodySizeLimit`)
- Client-side `accept="image/*"` on the file input
- The upload endpoint is a raw Next.js API Route (`/api/upload`), **not** a Server Action, so the body size limit does not apply to uploads — only the server's HTTP body parser limit (default ~10MB in Next.js)

## Client-Side Upload Flow

### `GalleryForm` (`src/app/admin/gallery/gallery-form.tsx`)

The admin upload form uses a **parallel upload** pattern:

1. User selects files → `handleSelect` fires
2. For each file, a preview is created via `URL.createObjectURL(file)`
3. Each file is immediately uploaded to `/api/upload` via `fetch()`
4. As each upload completes, the item's state updates from "Uploading..." to "Uploaded"
5. Once all uploads complete (`allUploaded = true`), the "Save" button becomes active
6. On form submit, `createGalleryImagesBatch()` saves the URLs to the database

```
User selects files
        │
        ▼
  ┌─ Preview 1 ─► fetch(/api/upload) ─► Uploaded ✓ ──┐
  ├─ Preview 2 ─► fetch(/api/upload) ─► Uploaded ✓ ──┤
  ├─ Preview 3 ─► fetch(/api/upload) ─► Uploading… ──┤
  └─ Preview 4 ─► fetch(/api/upload) ─► Uploaded ✓ ──┘
        │                                      │
        ▼                                      ▼
   Submit disabled                        Submit enabled
   (not all uploaded)                     createGalleryImagesBatch()
```

## Server Actions

All gallery server actions are in `src/lib/actions.ts` (lines 606–647):

### `getGalleryImages()`
```ts
// Returns all gallery images ordered by createdAt desc
// Used by both admin and public pages
// No auth required (public gallery is visible to everyone)
```

### `createGalleryImagesBatch(data)`
```ts
// Requires admin session (calls requireAdmin())
// Input: { urls: string[], caption?: string, category: string }
// Uses prisma.galleryImage.createMany() for bulk insert
// Revalidates: /admin/gallery and /gallery
```

### `deleteGalleryImage(id)`
```ts
// Requires admin session
// Deletes the database record
// Does NOT delete the physical file from disk
// Revalidates: /admin/gallery and /gallery
```

## Database Model

```prisma
model GalleryImage {
  id        String   @id @default(cuid())
  url       String                                    // e.g. "/uploads/gallery/1717654321-a1b2c3.jpg"
  caption   String?                                   // Optional display text
  category  String                                    // "hair" | "nails" | "skincare" | "makeup" | "massage"
  createdAt DateTime @default(now()) @map("created_at")

  @@map("gallery_images")
}
```

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Upload returns 500 | Missing `sharp` native addon in standalone | Ensure `post-build.sh` step 6 copies `node_modules/sharp/` |
| Image URL returns 404 after deploy | Upload written to stale directory; symlink broken | Run deploy script (recreates symlink) or verify `UPLOAD_DIR` |
| "No files provided" | Missing `dir` form field | Client sends `dir: "gallery"` automatically |
| Invalid file type | MIME check fails | Ensure file is JPEG/PNG/WebP/AVIF |
| Images visible in admin but not public page | Missing `revalidatePath("/gallery")` | Call `revalidatePath` in the server action |
| Uploads lost after `npm run build:prod` | `post-build.sh` copies old uploads then new build overwrites standalone | Set `UPLOAD_DIR` to persistent path outside project |

### Verifying the Deploy

After deployment, check that the symlink is correct:

```bash
# On the production server
ls -la /home/kswms/apps/prisan/.next/standalone/public/uploads
# Should show: lrwxrwxrwx ... uploads -> /home/kswms/apps/prisan/public/uploads

# Check that uploaded files exist
ls /home/kswms/apps/prisan/public/uploads/gallery/
```

### Quick Fix: Rebuild + Re-symlink

```bash
cd /home/kswms/apps/prisan
npm run build
rm -rf .next/standalone/public/uploads
ln -s /home/kswms/apps/prisan/public/uploads /home/kswms/apps/prisan/.next/standalone/public/uploads
pm2 restart prisan
```
