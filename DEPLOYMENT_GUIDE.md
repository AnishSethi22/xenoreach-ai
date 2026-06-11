# XenoReach AI — Deployment Guide

**Author:** Anish Sethi  
**Last Updated:** June 2026

---

## Prerequisites

- Render account (https://render.com)
- Vercel account (https://vercel.com)
- Neon PostgreSQL database (https://neon.tech) — already provisioned
- Node.js 18+ locally

---

## Phase 1 — Backend Deployment (Render)

### Step 1: Create Web Service

1. Log in to https://render.com
2. Click **New** → **Web Service**
3. Select **Build and deploy from a Git repository**
4. Connect your GitHub account and select your repository

### Step 2: Configure Web Service

| Setting | Value |
|---|---|
| Name | xenoreach-backend |
| Environment | Node |
| Region | (Select closest to Neon DB, e.g., US East) |
| Branch | main |
| Root Directory | xenoreach-backend |
| Build Command | `npm run build` |
| Start Command | `npm start` |

### Step 3: Set Environment Variables

In Render dashboard → Environment section, add:

```env
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:<PASSWORD>@ep-crimson-violet-aqm73kvw.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-2.0-flash
JWT_SECRET=<strong-random-secret-min-32-chars>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://<your-vercel-domain>.vercel.app
DEMO_MODE=true
```

> ⚠️ **IMPORTANT:** Never commit `.env` files. The DATABASE_URL and GEMINI_API_KEY in the local `.env` are for development only.

*(Note: Render will automatically configure the port. `render.yaml` at the root of the project can also be used as a Blueprint for automated provisioning.)*

### Step 4: Deploy

Click **Create Web Service**. Render will:
1. Clone the repository
2. Run `npm install` and `npm run build`
3. Start the application

### Step 5: Verify Backend

Once deployed, visit:
```
https://<your-render-domain>/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "demoMode": true
}
```

Also verify:
- `GET /api/v1/campaigns` returns campaign list
- `GET /api/v1/customers` returns 1000 customers
- `GET /api/v1/analytics/overview` returns metrics

---

## Phase 2 — Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. Log in to https://vercel.com
2. Click **Add New Project** → **Import Git Repository**
3. Select your repository
4. Set **Root Directory** to: `xenoreach-frontend`

### Step 2: Configure Build

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `xenoreach-frontend` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

### Step 3: Set Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://<your-render-domain>.onrender.com
```

> This is the only required frontend environment variable. The API URL must point to your live Render backend.

### Step 4: Deploy

Click **Deploy**. Vercel will:
1. Run `npm install`
2. Run `npm run build`
3. Deploy to Vercel Edge Network

### Step 5: Verify Frontend

Visit your Vercel URL. You should see:
- Login page (or auto-redirect to dashboard in Demo Mode)
- Dashboard loading with live data from Render backend
- All KPI cards populated
- Campaign list visible

---

## Phase 3 — Post-Deployment Verification Checklist

Run through this checklist after every deployment:

### Backend
- [ ] `GET /health` returns `{"status": "healthy"}`
- [ ] `GET /api/v1/campaigns` returns campaigns
- [ ] `GET /api/v1/customers?limit=5` returns customers
- [ ] `POST /api/v1/ai/copilot` with `{"question": "test"}` returns a response
- [ ] `GET /api/v1/analytics/overview` returns analytics data

### Frontend
- [ ] Dashboard loads without console errors
- [ ] Customer 360 list loads
- [ ] Campaign list shows all statuses (RUNNING, COMPLETED, DRAFT)
- [ ] Campaign detail page loads
- [ ] Campaign builder (New Campaign) works — all 5 steps
- [ ] AI Copilot opens and responds
- [ ] Analytics page loads charts
- [ ] AI Insights page loads
- [ ] Profile modal opens centered
- [ ] Settings modal opens centered
- [ ] Logout redirects to login

---

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | Set to `production` |
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `GEMINI_MODEL` | ✅ | `gemini-2.0-flash` |
| `JWT_SECRET` | ✅ | Min 32 chars, random |
| `JWT_EXPIRES_IN` | ✅ | `7d` |
| `FRONTEND_URL` | ✅ | Vercel deployment URL |
| `DEMO_MODE` | ✅ | `true` for reviewer access |

### Frontend (Vercel)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Render backend URL |

---

## Rollback Steps

### Backend Rollback (Render)
1. Go to Render dashboard → web service
2. Go to **Deploys**
3. Select an earlier successful deploy
4. Click **Deploy This Branch/Commit** again
5. Verify `/health` endpoint responds

### Frontend Rollback (Vercel)
1. Go to Vercel dashboard → Deployments
2. Click the previous successful deployment
3. Click **Promote to Production**
4. Verify dashboard loads

### Database Rollback
The Neon database is shared between environments. To roll back schema:
```bash
cd xenoreach-backend
npx prisma migrate resolve --rolled-back <migration-name>
```

> ⚠️ Data changes (new campaigns, customers) cannot be rolled back automatically. Always back up before running migrations.

---

*Deployment Guide by Anish Sethi — XenoReach AI, June 2026*
