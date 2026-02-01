# Uploads with Cloudflare R2

Admin uploads (service images, hero videos, gallery photos) can be stored in **Cloudflare R2** when env vars are set. Otherwise they fall back to local `public/uploads/`.

## R2 bucket layout (one bucket, folders)

Use **one bucket** with three prefixes (folders):

| Folder   | Use              | Allowed types        |
|----------|------------------|----------------------|
| `services/` | Service images   | JPEG, PNG, WebP, GIF |
| `hero/`     | Hero videos (max 5) | MP4 only          |
| `gallery/`  | Gallery photos   | JPEG, PNG, WebP, GIF |

Example keys: `services/1738xxx-abc12.jpg`, `hero/1738xxx-def34.mp4`, `gallery/1738xxx-ghi56.jpg`.

## Setup

1. **Create bucket**
   - Cloudflare Dashboard → **R2** → **Create bucket** (e.g. `salon-media`).
   - Enable **Public access** for the bucket (or use a custom domain) and note the **Public bucket URL** (e.g. `https://pub-xxxxx.r2.dev`).

2. **Create API token**
   - R2 → **Manage R2 API Tokens** → **Create API token**.
   - Permissions: **Object Read & Write**.
   - Copy **Access Key ID** and **Secret Access Key**.

3. **Account ID**
   - In the right sidebar of the R2 page, copy your **Account ID**.

4. **Environment variables** (in `.env`):

```env
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="salon-media"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

`R2_PUBLIC_URL` must be the base URL for the bucket (no trailing slash). Use the R2 public URL or your custom domain.

## Admin UI

- **Customize** → Hero videos: upload up to 5 MP4 files; each is shown with a **Remove** button. Uploads go to `hero/`.
- **Customize** → Gallery: upload photos; each has **Remove**. Uploads go to `gallery/`.
- **Admin** → Edit service → **Upload image** or **Replace with new**; **Remove image** clears it. Uploads go to `services/`.

Removing a video or photo in the UI only removes it from settings (and from the list). It does not delete the object from R2. You can delete old objects in the R2 dashboard if you want to free space.

## Without R2

If R2 env vars are not set, uploads are written to `public/uploads/` and the API returns relative URLs like `/uploads/filename.jpg`. The app works the same; only storage location changes.
