# Production Smoke Test Checklist

**Project:** XenoReach AI  
**Deployment Stack:** Vercel (Frontend) + Render (Backend) + Neon (Database)  
**Date:** June 11, 2026

Execute this checklist immediately after deploying to the production environment.

| Feature | Step-by-Step Action | Expected Result | Pass/Fail |
|---|---|---|---|
| **Dashboard** | 1. Navigate to the root URL (`/`).<br>2. Observe KPI cards. | The dashboard loads in under 1 second. KPIs (Total Customers, Revenue Attributed) display actual numbers (not 0). | [ ] |
| **Customer 360** | 1. Navigate to `/customers`.<br>2. Scroll through the list.<br>3. Click on a specific customer. | The list of 1,000 seeded customers loads and paginates. The customer profile displays RFM segmentation and Churn Probability. | [ ] |
| **AI Copilot** | 1. Open the Copilot sidebar.<br>2. Type: "Which customers are at highest churn risk?" | Copilot responds with a list of high-risk customers, utilizing either Gemini or the CRM Intelligence fallback gracefully. | [ ] |
| **Campaign Builder** | 1. Click "+ New Campaign".<br>2. Fill out Goal, Audience, Message, and Channel steps. | Each step validates successfully. AI translates the goal into an audience. Draft persistence works if the page is refreshed. | [ ] |
| **Campaign Launch** | 1. Complete the Campaign Builder wizard.<br>2. Click "Launch Campaign". | The Launch Success modal appears perfectly centered. The campaign appears in the list with status `RUNNING`. | [ ] |
| **Campaign Lifecycle** | 1. Click on the `RUNNING` campaign.<br>2. Click "Pause", then "Resume".<br>3. Wait for the simulation to finish. | State changes to `PAUSED` then back to `RUNNING`. Simulation events flow in real-time. Status eventually updates to `COMPLETED`. | [ ] |
| **Analytics** | 1. Navigate to `/analytics`.<br>2. Hover over the Revenue, Channel Performance, and Trends charts. | All charts render properly using Recharts. Tooltips display correct aggregated data values. | [ ] |
| **AI Insights** | 1. Navigate to `/insights`.<br>2. Read the proactive insights. | 4 AI-generated insights are visible, explaining current CRM trends and offering actionable recommendations. | [ ] |
| **Profile Modal** | 1. Click the Top-Right avatar.<br>2. Click "View Profile". | The Profile modal opens securely on top of all other elements, centered correctly. ESC or outside click closes it. | [ ] |
| **Settings Modal** | 1. Click the Top-Right avatar.<br>2. Click "Settings". | The Settings modal opens centered. Contains environment data (Demo Mode: Active). | [ ] |
| **Logout** | 1. Click the Top-Right avatar.<br>2. Click "Logout". | Local storage and auth state are cleared. User is redirected to the `/login` screen. | [ ] |

---
**Auditor Signature:** Anish Sethi
