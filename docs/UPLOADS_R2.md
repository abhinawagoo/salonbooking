# Uploads with Cloudflare R2

Admin uploads (banner, videos, service images, gallery, subcategory) are stored in **Cloudflare R2** when env vars are set. Otherwise they fall back to local `public/uploads/`.

**For full setup:** see **[docs/R2_SETUP.md](./R2_SETUP.md)** – credentials, step-by-step, and media types.

## Quick reference

| Folder        | Use              | Formats                    |
|---------------|------------------|----------------------------|
| `hero/`       | Banner image, hero videos | JPEG, PNG, WebP, MP4 |
| `service/`    | Service images   | JPEG, PNG, WebP, GIF       |
| `gallery/`    | Gallery photos   | JPEG, PNG, WebP, GIF       |
| `subcategory/`| Subcategory icons| JPEG, PNG, WebP, GIF       |

## Env vars

```env
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="salon-media"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

## Without R2

If R2 env vars are not set, uploads go to `public/uploads/` with relative URLs like `/uploads/filename.jpg`.
