# 🚀 FarmSe Production Deployment Guide

This guide provides the exact step-by-step instructions to deploy **FarmSe** to a free/low-cost production cloud environment:

- **Frontend**: [Vercel](https://vercel.com) (React + Vite SPA)
- **Backend**: [Render](https://render.com) (Node.js + Express.js API)
- **Database**: [Neon](https://neon.tech) (Serverless PostgreSQL)
- **Source Control**: [GitHub](https://github.com)
- **Mobile Packaging**: [Capacitor](https://capacitorjs.com) (Android APK)

---

## 🔑 Environment Variables Reference Table

### 1. Frontend (Vercel)

| Variable | Required | Description | Example Production Value |
|---|---|---|---|
| `VITE_API_URL` | **YES** | Absolute URL to your live Render backend API (including `/api`) | `https://farmse-api.onrender.com/api` |

### 2. Backend (Render)

| Variable | Required | Description | Example Production Value |
|---|---|---|---|
| `PORT` | **YES** | Port for Express server (automatically assigned by Render, defaults to 5000) | `5000` |
| `NODE_ENV` | **YES** | Node environment mode | `production` |
| `DATABASE_URL` | **YES** | Connection string from Neon PostgreSQL with `?sslmode=require` | `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/farmse?sslmode=require` |
| `JWT_SECRET` | **YES** | Random high-entropy secret key for signing JWT tokens | `generate_random_64_character_string` |
| `JWT_EXPIRES_IN` | Optional | JWT expiration duration (default: `7d`) | `7d` |
| `FRONTEND_URL` | **YES** | Deployed Vercel frontend URL | `https://farmse.vercel.app` |
| `CORS_ORIGIN` | **YES** | Comma-separated allowed origins (includes Vercel URL and mobile schemes) | `https://farmse.vercel.app,capacitor://localhost,http://localhost` |
| `CLIENT_URL` | Optional | Fallback client URL for notification links | `https://farmse.vercel.app` |

---

## 📦 Deployment Steps (Exact Sequence)

```
[ Step 1: Push to GitHub ] 
        │
        ▼
[ Step 2: Create Neon PostgreSQL Database ] 
        │
        ▼
[ Step 3: Deploy Backend API on Render ] 
        │
        ▼
[ Step 4: Deploy Frontend on Vercel ] 
        │
        ▼
[ Step 5: Update CORS & Test Production ]
```

---

### Step 1: Push Code to GitHub

1. Initialize Git locally and create your first commit:
   ```bash
   git init
   git add .
   git commit -m "feat: production-ready FarmSe marketplace with mobile-first UI"
   ```
2. Create a new repository on [github.com/new](https://github.com/new) (e.g. `farmse-marketplace`).
3. Link and push your repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/farmse-marketplace.git
   git push -u origin main
   ```

---

### Step 2: Create Neon PostgreSQL Database

1. Sign up / Log in to [Neon.tech](https://neon.tech).
2. Click **Create Project**:
   - Project Name: `farmse-production`
   - Database Name: `farmse_db`
   - Region: Select the region closest to your users (e.g. `Asia Pacific (Singapore)` or `US East`).
3. Copy the provided connection string from the Neon dashboard:
   ```env
   postgresql://farmse_owner:AbC123XYZ@ep-green-hill-123456.ap-southeast-1.aws.neon.tech/farmse_db?sslmode=require
   ```

---

### Step 3: Deploy Backend API on Render

1. Log in to [Render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository `farmse-marketplace`.
4. Configure the Web Service:
   - **Name**: `farmse-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm install --include=dev && npx prisma generate && npx prisma db push --accept-data-loss && npm run prisma:seed && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run start
     ```
   - **Plan**: `Free`
5. Add **Environment Variables** in the Render Dashboard:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `DATABASE_URL` = *(Paste your Neon connection string from Step 2)*
   - `JWT_SECRET` = *(Click "Generate" in Render or enter a random secure string)*
   - `JWT_EXPIRES_IN` = `7d`
   - `CORS_ORIGIN` = `http://localhost:5173,capacitor://localhost,http://localhost` *(Will add Vercel URL in Step 5)*
   - `FRONTEND_URL` = `http://localhost:5173` *(Will update in Step 5)*
6. Click **Create Web Service**.
7. Wait for the build to finish. Once live, Render will give you a public URL (e.g., `https://farmse-api.onrender.com`).
8. Test the health probe in your browser or curl:
   ```
   https://farmse-api.onrender.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "FarmSe API",
     "version": "1.0.0"
   }
   ```

---

### Step 4: Deploy Frontend on Vercel

1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your `farmse-marketplace` GitHub repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variables**:
   - `VITE_API_URL` = `https://farmse-api.onrender.com/api` *(Your Render backend URL + /api)*
6. Click **Deploy**.
7. Vercel will build and assign you a live production URL (e.g., `https://farmse.vercel.app`).

---

### Step 5: Connect Frontend to Backend (Final CORS Sync)

1. Return to your [Render Dashboard](https://dashboard.render.com) > `farmse-api` > **Environment**.
2. Update the environment variables with your actual live Vercel URL:
   - `FRONTEND_URL` = `https://farmse.vercel.app`
   - `CORS_ORIGIN` = `https://farmse.vercel.app,capacitor://localhost,http://localhost`
3. Click **Save Changes** (Render will automatically re-deploy with updated CORS).

---

## 🧪 Production Verification & Testing Checklist

Once both services are live, verify all modules:

### 1. API Health & Database Connectivity
Open `https://farmse-api.onrender.com/api/health` — it should return HTTP 200 with `"status": "healthy"`.

### 2. Category & Product Listings
Open `https://farmse.vercel.app/marketplace` — products and categories should load with images, ratings, and filters.

### 3. Authentication Verification
Open `https://farmse.vercel.app/login`:
- Test **1-Click Demo Login** for Customer (`rahul.verma@farmse.com` / `customer123`).
- Test **1-Click Demo Login** for Farmer (`ramesh.patel@farmse.com` / `farmer123`).
- Test **1-Click Demo Login** for Admin (`admin@farmse.com` / `admin123`).
- Test new account registration at `/register`.

### 4. Cart & Checkout Verification
1. As a customer, add an organic harvest item to the cart.
2. Go to `/cart`, review quantities and free delivery progress.
3. Click **Proceed to Checkout** (`/checkout`).
4. Enter delivery address, choose Mock UPI / Card / COD, and click **Place Order**.
5. Verify redirection to `/order-success/:id` and test the 5-step live tracking at `/orders/track/:id`.

### 5. Farmer Operations Verification
1. Log in as farmer `ramesh.patel@farmse.com`.
2. Go to `/farmer/dashboard` — verify KPI revenue and incoming orders.
3. Advance order status from `CONFIRMED` ➔ `PREPARING` ➔ `SHIPPED` ➔ `DELIVERED`.
4. Go to `/farmer/products/new` — list a test crop with photo and pricing.

---

## 📱 Future Android APK Packaging with Capacitor

When you are ready to build the Android `.apk`:

```bash
cd frontend

# 1. Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor project
npx cap init FarmSe com.farmse.app --web-dir=dist

# 3. Build web distribution with live Render API URL
VITE_API_URL=https://farmse-api.onrender.com/api npm run build

# 4. Add Android platform & sync
npx cap add android
npx cap sync android

# 5. Open in Android Studio
npx cap open android
```

In Android Studio:
- Select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
- Locate output file: `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🛠️ Production Troubleshooting

### Issue 1: CORS error in browser console (`Access-Control-Allow-Origin`)
- **Cause**: Backend `CORS_ORIGIN` does not match the exact Vercel domain.
- **Fix**: Check your Render environment variables. Ensure `CORS_ORIGIN` contains your exact Vercel URL without trailing slash (e.g. `https://farmse.vercel.app`).

### Issue 2: Page reload returns 404 on Vercel (`Cannot GET /marketplace`)
- **Cause**: Single-Page App (SPA) rewrite rules missing.
- **Fix**: Verify `frontend/vercel.json` exists in your repository with the rewrite rule `{ "source": "/(.*)", "destination": "/" }`.

### Issue 3: Render Free Tier spins down on inactivity
- **Note**: Render free tier services go to sleep after 15 minutes of inactivity and take ~30 seconds to spin back up on the first request.
- **Fix**: You can use a free health check monitor (such as [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org)) to ping `https://farmse-api.onrender.com/api/health` every 10 minutes to keep it warm.

### Issue 4: Database Connection Limit on Neon
- **Cause**: Too many idle Prisma connections.
- **Fix**: Ensure your Neon connection string uses connection pooling by utilizing the `-pooler` endpoint provided in the Neon dashboard if scaling beyond free tier limits.
