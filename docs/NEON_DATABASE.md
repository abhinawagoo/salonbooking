# Neon Database – Intermittent Connection Fixes

## Why "Sometimes Works, Sometimes Fails"?

Neon uses **Scale to Zero**: after ~5 minutes of inactivity, the database compute suspends. The first request after that triggers a **cold start** (500ms–several seconds). If your app’s connection timeout is too short, you get:

```
P1001: Can't reach database server at `ep-xxx-pooler.ap-southeast-1.aws.neon.tech:5432`
```

## Fixes

### 1. Add Connection Timeouts to `DATABASE_URL`

Append these params to your Neon connection string:

```
?sslmode=require&connect_timeout=30&pool_timeout=30
```

Example:

```
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=30&pool_timeout=30"
```

- `connect_timeout=30` – wait up to 30 seconds for the initial connection (covers cold starts)
- `pool_timeout=30` – wait up to 30 seconds for a connection from the pool

### 2. Use the Pooler URL

Neon provides two URLs:

- **Direct**: `ep-xxx.ap-southeast-1.aws.neon.tech` – direct DB connection
- **Pooler**: `ep-xxx-pooler.ap-southeast-1.aws.neon.tech` – connection pooler (recommended for serverless)

Use the **pooler** URL (with `-pooler` in the host) for Next.js / Vercel.

### 3. Same Region (Optional)

Host your app and Neon DB in the same region (e.g. `ap-southeast-1`) to reduce latency and cold-start impact.

### 4. Adjust Scale-to-Zero (Paid Plans)

On Neon’s Scale plan you can:

- Increase suspend timeout (e.g. 1 hour instead of 5 minutes)
- Disable scale-to-zero for always-on compute

Neon Console → Project → Branches → Edit compute → Suspend timeout.

## Quick Checklist

- [ ] `DATABASE_URL` includes `connect_timeout=30&pool_timeout=30`
- [ ] Using pooler URL (`-pooler` in hostname)
- [ ] App and DB in same region (if possible)
