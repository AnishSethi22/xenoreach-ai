# Final Deployment Checklist
**Project:** XenoReach AI  
**Author:** Anish Sethi

This checklist is for your final, manual deployment to the free cloud infrastructure. Do not proceed to the next step until the current one is verified.

---

### Step 1: Database (Neon.tech)
- [ ] Neon project is created.
- [ ] You have copied the PostgreSQL Connection String.
- [ ] **Verification:** You ran the Prisma migrations locally using this DB to ensure the schema is created. *(Note: You can skip this if you already ran `npx prisma migrate dev` locally).*

---

### Step 2: Backend (Render.com)
- [ ] Connect your GitHub account to Render.
- [ ] Create a New **Web Service**.
- [ ] Select the `xenoreach-ai` repository.
- [ ] The `render.yaml` blueprint should automatically configure the build commands. Verify they are:
  - **Build Command:** `npm install && npm run build`
  - **Start Command:** `npm start`
  - **Root Directory:** `xenoreach-backend`
- [ ] Input the Environment Variables:
  - `NODE_ENV=production`
  - `DATABASE_URL` = *(Your Neon URL)*
  - `GEMINI_API_KEY` = *(Your Gemini API Key)*
  - `GEMINI_MODEL=gemini-2.0-flash`
  - `JWT_SECRET` = *(Any long random string)*
  - `JWT_EXPIRES_IN=7d`
  - `FRONTEND_URL` = *(Leave blank for now, we will update this after Step 3)*
  - `DEMO_MODE=true`
- [ ] Click **Deploy**.
- [ ] **Verification:** Go to `https://<your-render-url>.onrender.com/health` and verify you see `{"status": "healthy"}`.

---

### Step 3: Frontend (Vercel.com)
- [ ] Connect your GitHub account to Vercel.
- [ ] Import the `xenoreach-ai` repository.
- [ ] Set the **Root Directory** to `xenoreach-frontend`.
- [ ] The Next.js preset should auto-configure the build commands (`npm run build`).
- [ ] Input the Environment Variable:
  - `NEXT_PUBLIC_API_URL` = `https://<your-render-url>.onrender.com` *(From Step 2)*
- [ ] Click **Deploy**.
- [ ] **Verification:** Go to the Vercel URL and verify the login screen loads.

---

### Step 4: Final Linkage
- [ ] Go back to Render Dashboard -> Web Service -> Environment.
- [ ] Update `FRONTEND_URL` to be your new Vercel URL.
- [ ] Save and Render will automatically restart.
- [ ] **Verification:** Open your Vercel URL, click "Demo Login", and verify the Dashboard loads with data.
