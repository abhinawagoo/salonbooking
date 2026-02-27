# Cloudflare R2 – Media Storage Setup

All admin uploads (banner, videos, service images, gallery, subcategory images) go to **Cloudflare R2** when configured. Otherwise they fall back to local `public/uploads/`.

---

## 1. R2 Credentials You Need

| Key | Where to Get It | Example |
|-----|-----------------|---------|
| **R2_ACCOUNT_ID** | Cloudflare Dashboard → R2 → right sidebar | `a1b2c3d4e5f6g7h8i9j0` |
| **R2_ACCESS_KEY_ID** | R2 → Manage R2 API Tokens → Create token → copy Access Key ID | `abc123...` |
| **R2_SECRET_ACCESS_KEY** | Same token creation → copy Secret Access Key | `xyz789...` |
| **R2_BUCKET_NAME** | Name you give when creating the bucket | `salon-media` |
| **R2_PUBLIC_URL** | Bucket → Settings → Public access URL (or custom domain) | `https://pub-xxxxx.r2.dev` |

---

## 2. Step-by-Step Setup

### A. Create bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**
2. Click **Create bucket**
3. Name it (e.g. `salon-media`)
4. Click **Create bucket**

### B. Enable public access

1. Open your bucket
2. Go to **Settings**
3. Under **Public access**, click **Allow Access**
4. Copy the **Public bucket URL** (e.g. `https://pub-xxxxx.r2.dev`) – no trailing slash

### B2. Add CORS policy (required for images to load on your website)

Without CORS, images from R2 will be blocked by the browser when your site (e.g. `https://www.shahnazsalonsasaram.com`) loads them. Add a CORS policy:

1. In your bucket → **Settings** → **CORS Policy** → **Add CORS policy**
2. Switch to the **JSON** tab
3. Paste this (replace with your domain if needed):

```json
[
  {
    "AllowedOrigins": ["https://www.shahnazsalonsasaram.com", "https://shahnazsalonsasaram.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "HEAD"]
  }
]
```

Or to allow all origins (simpler for public images):

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"]
  }
]
```

4. Click **Save**
5. CORS can take up to 30 seconds to propagate

### C. Create API token

1. R2 → **Manage R2 API Tokens** (top right)
2. **Create API token**
3. Name: `salon-uploads`
4. Permissions: **Object Read & Write**
5. Bucket: **Apply to specific buckets only** → select `salon-media`
6. Create → copy **Access Key ID** and **Secret Access Key** (secret shown only once)

### D. Get Account ID

- In the R2 page right sidebar, copy **Account ID**

---

## 3. Add to `.env` (or Vercel)

```env
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="salon-media"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

`R2_PUBLIC_URL` = base URL for the bucket, no trailing slash. Use the R2 public URL or your custom domain.

---

## 4. Media Types & R2 Folders

| Upload Type | R2 Folder | Allowed Formats | Max Size | Used For |
|-------------|-----------|-----------------|----------|----------|
| **Hero banner** | `hero/` | JPEG, PNG, WebP | 10 MB | Homepage top image |
| **Hero videos** | `hero/` | MP4 | 80 MB | Homepage video carousel (max 5) |
| **Service images** | `service/` | JPEG, PNG, WebP, GIF | 10 MB | Service cards in admin |
| **Gallery images** | `gallery/` | JPEG, PNG, WebP, GIF | 10 MB | Gallery section on homepage |
| **Subcategory images** | `subcategory/` | JPEG, PNG, WebP, GIF | 10 MB | Category/subcategory icons |

Example object keys:
- `hero/1738xxx-abc12.jpg` (banner)
- `hero/1738xxx-def34.mp4` (video)
- `service/1738xxx-ghi56.jpg`
- `gallery/1738xxx-jkl78.png`
- `subcategory/1738xxx-mno90.webp`

---

## 5. Where Uploads Happen in Admin

| Admin Section | Upload Type | UI Location |
|---------------|-------------|-------------|
| **Customize** | Hero banner | Hero Banner → Upload image |
| **Customize** | Hero videos | Hero Videos → Add video (MP4) |
| **Customize** | Gallery | Gallery → Add photos |
| **Admin** (Services) | Service image | Edit service → Upload / Replace image |
| **Admin** (Categories) | Subcategory image | Edit subcategory → Upload image |

---

## 6. Without R2

If R2 env vars are not set, uploads go to `public/uploads/` and URLs are relative (e.g. `/uploads/xxx.jpg`). The app works the same; only storage location changes.

---

## 7. Delete / Cleanup

- **Remove** in the UI removes the URL from settings and deletes the object from R2 (when URL is from R2).
- Local uploads are not deleted from disk when removed in UI.
- You can manually delete old objects in the R2 dashboard to free space.
