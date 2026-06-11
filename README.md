# XenoReach AI

> An AI-native Customer Engagement Platform built for the Xeno Engineering Internship Assignment 2026.

**Author:** Anish Sethi  
**Assignment:** Xeno Software Engineering Internship — June 2026

---

## The Problem I Solved

Modern retail marketers deal with three painful gaps:

1. **No unified customer view** — purchase history, churn risk, and engagement data live in different tools
2. **Campaign creation is manual and slow** — audience segmentation and message writing require dedicated analysts
3. **No closed-loop analytics** — marketers can't measure what actually drove revenue

XenoReach AI closes all three gaps in a single platform.

---

## What I Built

A full-stack AI-native CRM platform with:

- **Customer 360** — unified customer profiles with RFM scoring, churn probability, lifetime value, and next best action
- **Campaign Builder** — 5-step guided flow: Goal → Audience → Message → Channel → Launch
- **Campaign Lifecycle Engine** — real-time delivery simulation with RUNNING → PAUSED → COMPLETED state machine
- **AI Copilot** — natural language CRM queries powered by Gemini 2.0 Flash with intelligent CRM Intelligence fallback
- **AI Insights** — proactive business recommendations generated from live customer and campaign data
- **Analytics Dashboard** — revenue attribution, channel performance, funnel metrics, and trend analysis
- **Demo Mode** — zero-friction reviewer experience with pre-seeded data and bypassed authentication

---

## Architecture Decisions

### Why Node.js + Express (not NestJS)?
I chose Express for explicitness. Every route, middleware, and error handler is visible and intentional — no magic decorators or DI containers. For an internship assignment, clarity of code structure matters more than framework conventions.

### Why Prisma ORM?
Type-safe database access without writing raw SQL for every query. The schema acts as the single source of truth for both the database and TypeScript types, eliminating an entire class of runtime errors.

### Why Zustand (not Redux)?
Campaign builder state spans 5 steps and needs to survive page refreshes. Zustand with localStorage persistence achieves this in ~30 lines. Redux would require 5x the boilerplate for identical functionality.

### Why CRM Intelligence Fallback?
The Gemini API has quota limits. Rather than showing users a technical error, I built a CRM Intelligence layer that queries the real database and constructs business-relevant answers from live data. The reviewer never sees an API failure.

### Why polling instead of WebSockets?
For a 1000-customer demo dataset, a 5-second polling interval is indistinguishable from real-time. WebSockets would add significant infrastructure complexity (connection management, reconnection logic) for no perceptible UX benefit at this scale.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | API server |
| TypeScript 6 | Type safety |
| Prisma 5 + PostgreSQL | Database ORM |
| Neon (serverless Postgres) | Cloud database |
| Google Gemini 2.0 Flash | AI responses |
| Zod | Request validation |
| JWT | Authentication |
| Helmet + CORS | Security headers |

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16 (Turbopack) | React framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Utility styling |
| TanStack Query v5 | Server state + caching |
| Zustand v5 | Client state (campaign builder) |
| Recharts | Analytics charts |
| react-hot-toast | Toast notifications |
| Lucide React | Icon system |

---

## Features

### Customer 360
- 1,000 seeded Indian customer profiles (realistic names, cities, purchase history)
- RFM segmentation (Champions, Loyal, At-Risk, Lost)
- Churn probability scoring (0–100%)
- Lifetime value calculation
- Next Best Action recommendations
- Full-text search and multi-filter support

### Campaign Builder
- Goal translation (natural language → structured audience rules via AI)
- Dynamic audience sizing
- AI-generated message templates by channel
- Support for EMAIL, SMS, WHATSAPP, PUSH, RCS channels
- Draft auto-save with localStorage persistence
- 5-step wizard with validation at each step

### Campaign Lifecycle
- Full state machine: DRAFT → RUNNING → PAUSED → RUNNING → COMPLETED / CANCELLED
- Delivery simulation with realistic open/click/conversion rates
- Automatic completion when all recipients processed
- Manual complete/stop/pause/resume actions
- Campaign duplication

### AI Copilot
- Natural language interface for CRM queries
- Gemini 2.0 Flash primary path
- CRM Intelligence fallback (queries real DB, no hallucinations)
- Multi-turn conversation history
- Example prompts for reviewers

### Analytics
- Revenue attribution tracking
- Channel performance comparison (EMAIL vs SMS vs WHATSAPP vs PUSH vs RCS)
- 14/30/90-day trend analysis
- Campaign-level funnel: Sent → Delivered → Opened → Clicked → Converted
- Audience segmentation breakdown

---

## Project Structure

```
xenoreach-backend/
├── src/
│   ├── modules/
│   │   ├── ai/              # Gemini integration + CRM Intelligence fallback
│   │   ├── analytics/       # Revenue, channel, trend aggregations
│   │   ├── auth/            # JWT + Demo mode middleware
│   │   ├── campaigns/       # Full campaign lifecycle
│   │   ├── channel/         # Delivery simulator
│   │   ├── customers/       # Customer 360 queries
│   │   └── segments/        # RFM segmentation engine
│   ├── config/              # DB + env config
│   ├── middleware/          # Error handling, auth
│   └── shared/              # Response types, utilities
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed/                # 1000-customer seed script

xenoreach-frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   └── (dashboard)/     # Protected dashboard routes
│   ├── components/
│   │   ├── layout/          # Topbar, Sidebar
│   │   ├── modals/          # BaseModal (portal), Profile, Settings, etc.
│   │   └── copilot/         # AI Copilot panel
│   ├── lib/                 # API client, utilities
│   ├── store/               # Zustand stores
│   └── types/               # Shared TypeScript types
```

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (or Neon account)

### Backend
```bash
cd xenoreach-backend
npm install
cp .env.example .env        # Fill in DATABASE_URL, GEMINI_API_KEY, JWT_SECRET
npx prisma migrate deploy
npx ts-node prisma/seed/index.ts
npm run dev                  # http://localhost:4000
```

### Frontend
```bash
cd xenoreach-frontend
npm install
cp .env.local.example .env.local   # Set NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                         # http://localhost:3000
```

### Demo Access
Navigate to `http://localhost:3000` — Demo Mode auto-authenticates. No login required.

---

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for step-by-step Railway + Vercel deployment.

---

## Known Limitations & Trade-offs

| Limitation | Reason | Production Fix |
|---|---|---|
| Polling (5s) instead of WebSockets | Sufficient for demo scale | Add Socket.io for true real-time |
| Gemini quota limits | Free tier | Upgrade to paid tier or add rate limiting |
| No email sending | Simulation only | Integrate SendGrid / AWS SES |
| No pagination cursor | Offset-based pagination | Migrate to cursor pagination for scale |
| In-memory campaign simulator | Single-server assumption | Move to Redis queue + worker |

---

## What I Would Build Next

1. **Multi-brand support** — tenant isolation for multiple retail brands
2. **A/B testing** — split audience and compare message variants
3. **Predictive scheduling** — send messages at the optimal time per customer
4. **Revenue attribution model** — last-touch vs multi-touch attribution
5. **Webhook integrations** — Shopify, WooCommerce, custom CDP events

---

## Author

**Anish Sethi**  
Built as part of the Xeno Software Engineering Internship Assignment — June 2026.

This project was architected, implemented, tested, and deployed independently. AI tools were used as coding assistants, not as the architect. Every design decision, trade-off, and implementation choice was made deliberately.
