# TestAi Deployment Guide

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Railway       │────▶│   Neon          │
│   (Frontend)    │     │   (Backend)     │     │   (PostgreSQL)  │
│   Next.js       │     │   Express       │     │   Database      │
│   FREE          │     │   FREE ($5)     │     │   FREE          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Total Cost: $0/month** (all free tiers)

---

## Step 1: Set Up PostgreSQL on Neon (2 minutes)

1. Go to **https://neon.tech** → Sign up with GitHub
2. Click **Create Project**
   - Project name: `testai`
   - Region: Choose closest to your users
3. Copy the **Connection String** (looks like):
   ```
   postgresql://neondb_owner:xxxx@ep-xxx.us-east-2.aws.neon.tech/testai?sslmode=require
   ```
4. Go to **SQL Editor** tab
5. Run these migration files in order:
   - `backend/src/migrations/001_create_tables.sql`
   - `backend/src/migrations/002_seed_data.sql`
   - `backend/src/migrations/003_add_missing_tables.sql`

---

## Step 2: Deploy Backend to Railway (5 minutes)

1. Go to **https://railway.app** → Sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `testai-platform` repo
4. Click **+ New** → **Database** → **PostgreSQL** (Railway provides one, but we'll use Neon)
5. Go to **Variables** tab and add:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `JWT_SECRET` | Generate a random string (e.g., `openssl rand -base64 32`) |
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://testai-platform.vercel.app` |

6. Go to **Settings** tab:
   - Root Directory: `backend`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

7. Deploy → Wait for build to complete
8. Copy your backend URL (e.g., `backend-production-xxxx.up.railway.app`)

---

## Step 3: Deploy Frontend to Vercel (3 minutes)

1. Go to **https://vercel.com/new** → Sign in with GitHub
2. Click **Import Git Repository**
3. Select `testai-platform` repo
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: **frontend**
   - Build Command: `pnpm build` (or leave default)
   - Output Directory: `.next` (or leave default)

5. Go to **Environment Variables** and add:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://backend-production-xxxx.up.railway.app` |

6. Click **Deploy**
7. Wait for deployment to complete

---

## Step 4: Update Railway with Vercel URL

1. Go back to Railway → Your project → **Variables**
2. Update `FRONTEND_URL` to your actual Vercel URL:
   ```
   https://testai-platform-xxx.vercel.app
   ```

---

## Step 5: Test Everything

1. Visit your Vercel URL
2. Login with:
   - **Super Admin:** `admin@testai.com` / `Password123!`
   - **Tenant Admin:** `tenantadmin@testai.com` / `Password123!`
   - **Student:** `student@testai.com` / `Password123!`
3. Test all features

---

## Environment Variables Reference

### Backend (Railway)
```
DATABASE_URL=postgresql://neondb_owner:xxxx@ep-xxx.us-east-2.aws.neon.tech/testai?sslmode=require
JWT_SECRET=your-random-secret-here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://testai-platform.vercel.app
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://backend-production-xxxx.up.railway.app
```

---

## Troubleshooting

### CORS Error
- Ensure `FRONTEND_URL` in Railway matches your exact Vercel URL
- Redeploy backend after changing variables

### Database Connection Error
- Ensure Neon database is running
- Check connection string includes `?sslmode=require`
- Run migration SQL files if tables don't exist

### Build Error
- Check Railway build logs
- Ensure `pnpm` is available (should be by default)

---

## Useful Commands

```bash
# Generate JWT secret
openssl rand -base64 32

# Test backend health
curl https://backend-production-xxxx.up.railway.app/health

# View Railway logs
railway logs

# Redeploy
railway up
```
