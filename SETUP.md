# XenoReach AI — Setup Guide

## Prerequisites
- Node.js 18+ 
- npm 9+
- A PostgreSQL database (use free Neon.tech — no installation needed)

---

## 🗄️ Step 1: Get a Free Database (Neon.tech)

1. Go to **[neon.tech](https://neon.tech)** and sign up free
2. Create a new project: `xenoreach`
3. Click **"Connection Details"** → copy the **Connection string** 
   - It looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. Open `xenoreach-backend/.env` and replace `DATABASE_URL` with your Neon URL

```bash
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

---

## 🔑 Step 2: Configure API Keys

The Gemini API key is already set in `.env`:
```
GEMINI_API_KEY=<your-gemini-api-key>
```

For **Google OAuth** (optional — demo mode works without it):
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/auth/callback` to authorized redirect URIs
4. Add to `.env`: `GOOGLE_CLIENT_ID=your_id` and `GOOGLE_CLIENT_SECRET=your_secret`

---

## 🚀 Step 3: Run the Backend

```bash
cd xenoreach-backend

# Install dependencies (already done)
npm install

# Run database migration (creates all 9 tables)
npx prisma migrate dev --name init

# Seed with 1000 customers + 5000 orders + historical campaigns
npm run db:seed

# Start the backend dev server
npm run dev
```

Backend runs at: **http://localhost:4000**
Health check: **http://localhost:4000/health**

---

## 🖥️ Step 4: Run the Frontend

```bash
cd xenoreach-frontend

# Install dependencies (already done)  
npm install

# Start the dev server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## ✅ Quick Start (Demo Mode)

The app is pre-configured for **Demo Mode** — no OAuth needed:

1. Open http://localhost:3000
2. Click **"Continue with Demo Mode"**
3. Full access to all features with seeded data

---

## 📦 Architecture

| Component | Tech | Local | Production |
|-----------|------|-------|------------|
| Frontend | Next.js 15 | localhost:3000 | Vercel |
| Backend | Express + TypeScript | localhost:4000 | Render |
| Database | PostgreSQL | Neon.tech (free) | Neon.tech |
| AI | Gemini 2.0 Flash | — | Google AI |
| Auth | JWT + Google OAuth | Demo Mode | Google OAuth |

---

## 💰 Estimated Monthly Cost (Demo Usage)

| Service | Plan | Cost |
|---------|------|------|
| Vercel (Frontend) | Hobby (free) | $0 |
| Render (Backend) | Free Tier | $0 |
| Neon.tech (Database) | Free tier | $0 |
| Google AI (Gemini) | Pay-per-use | ~$1-3 |
| **Total** | | **~$6-8/month** |

---

## 🔧 Troubleshooting

**"Can't reach database server"** → Set `DATABASE_URL` to your Neon.tech connection string

**"Invalid or expired token"** → The demo JWT is valid for 7 days. Click "Continue with Demo Mode" again.

**AI features returning fallback data** → The Gemini API key is configured. Check internet connectivity.

**Frontend can't connect to backend** → Make sure `npm run dev` is running in `xenoreach-backend/` on port 4000.
