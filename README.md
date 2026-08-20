# 🌾 FarmSe - Smart Agricultural Marketplace

> **Direct from Soil to Table: Connecting Certified Growers with Conscious Consumers.**

FarmSe is a production-ready, full-stack smart agricultural marketplace built to eliminate intermediaries in the food supply chain. Farmers can list their seasonal crops, configure transparent prices and harvest dates, and manage fulfillment. Consumers can discover regional produce by category, harvest freshness, and location, place orders with direct escrow protection, and track delivery milestones in real-time.

---

## 📱 Multi-Platform & Deployment Ready

FarmSe is engineered from the ground up to serve as both:
1. **A Public Cloud Web Application** (accessible via browser URL on desktop, tablet, and mobile).
2. **A Native Android Mobile Application (APK)** packaged seamlessly via Capacitor from the same React/Vite codebase, connected to the same Express + PostgreSQL backend API.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, Axios |
| **Mobile Runtime** | Android Native WebView (Capacitor Ready) with bottom navigation and touch-optimized UI |
| **Backend API** | Node.js, Express.js, TypeScript, Zod, JWT, BcryptJS, Multer, Helmet, Morgan |
| **Database & ORM** | PostgreSQL (Production) & SQLite (Local Dev) via Prisma ORM |
| **Security & Headers** | Helmet CORS-enabled security policy, JWT RBAC (`CUSTOMER`, `FARMER`, `ADMIN`) |

---

## 📂 Project Architecture

```
FarmSe/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # Active database schema
│   │   ├── schema.postgres.prisma   # PostgreSQL production schema
│   │   └── seed.ts                  # Comprehensive database seeder
│   ├── src/
│   │   ├── config/                  # Multi-origin CORS & env configs
│   │   ├── controllers/             # REST API business logic
│   │   ├── middleware/              # Auth, RBAC guards, Multer, Zod validation
│   │   ├── models/                  # Prisma singleton
│   │   ├── routes/                  # Express route aggregators
│   │   ├── services/                # Payment abstraction, AI stubs, Notifications
│   │   ├── types/                   # TypeScript interfaces & DTOs
│   │   ├── utils/                   # Password, JWT, Standard response formatters
│   │   ├── app.ts                   # Express server setup with dynamic CORS
│   │   └── index.ts                 # Production server startup & graceful shutdown
│   ├── uploads/                     # Uploaded media storage
│   ├── .env.example                 # Production backend env template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Navbar, BottomNav (Android UX), Footer, ProtectedRoute
│   │   │   ├── marketplace/         # ProductCard, FilterSidebar, CategoryBar
│   │   │   └── reviews/             # ReviewSection, RatingStars
│   │   ├── context/                 # AuthContext, CartContext, WishlistContext, ToastContext
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── MarketplacePage.tsx
│   │   │   ├── ProductDetailsPage.tsx  # Sticky mobile purchase action bar
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── OrderSuccessPage.tsx
│   │   │   ├── OrderTrackingPage.tsx
│   │   │   ├── Auth/                # Login, Register, ForgotPassword
│   │   │   ├── Farmer/              # Dashboard, Products, Add/Edit Produce, Orders
│   │   │   ├── Customer/            # Dashboard, Orders, Wishlist, Profile
│   │   │   └── Admin/               # Dashboard, Farmers, Products, Orders, Users
│   │   ├── services/                # Axios API client with dynamic VITE_API_URL
│   │   ├── types/                   # Frontend TypeScript contracts
│   │   ├── App.tsx                  # React Router mapping with mobile safe padding
│   │   └── main.tsx
│   ├── .env.example                 # Production frontend env template
│   └── package.json
└── README.md
```

---

## ⚡ Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```
*Backend runs on `http://localhost:5000` (API Base: `http://localhost:5000/api`)*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 Demo Accounts (Pre-Seeded)

Use the **1-Click Quick Demo Sign In** buttons on the Login page or enter credentials manually:

| Role | Email | Password | Access / Capabilities |
|---|---|---|---|
| **Admin** | `admin@farmse.com` | `admin123` | Platform oversight, farmer approvals, moderation |
| **Farmer (Producer)** | `ramesh.patel@farmse.com` | `farmer123` | Patel Organic Orchards (Nashik), inventory & order fulfillment |
| **Farmer (Producer)** | `gurpreet.singh@farmse.com` | `farmer123` | Golden Wheat & Grain Hub (Ludhiana), grain listings & earnings |
| **Farmer (Producer)** | `lakshmi.narayanan@farmse.com` | `farmer123` | Malabar Spice & Highland Dairy (Wayanad), A2 dairy & spices |
| **Customer** | `rahul.verma@farmse.com` | `customer123` | Fresh crop discovery, cart, checkout, live order tracking |
| **Customer** | `priya.sharma@farmse.com` | `customer123` | Fresh produce buying, wishlist, customer profile |

---

## 🌐 Production Deployment Guide

### Step 1: Provision a Cloud PostgreSQL Database
Use a managed PostgreSQL provider such as **Neon.tech**, **Supabase**, **Render Postgres**, or **AWS RDS**:
1. Create a new PostgreSQL database instance (e.g. at [neon.tech](https://neon.tech)).
2. Copy the connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-green-hill.us-east-2.aws.neon.tech/farmse_db?sslmode=require"
   ```

### Step 2: Deploy the Backend API (Render / Railway / Fly.io)
1. Push your code to GitHub.
2. In [Render.com](https://render.com) or [Railway.app](https://railway.app), create a new **Web Service** pointing to the `backend/` directory.
3. Configure the build & start commands:
   - **Build Command**: `npm install && npm run prisma:deploy:pg && npm run prisma:seed:pg && npm run build`
   - **Start Command**: `npm run start`
4. Set Environment Variables in the cloud dashboard:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL="postgresql://username:password@ep-green-hill.us-east-2.aws.neon.tech/farmse_db?sslmode=require"
   JWT_SECRET="your_secure_jwt_random_secret_string"
   JWT_EXPIRES_IN="7d"
   CORS_ORIGIN="https://farmse.vercel.app,capacitor://localhost,http://localhost"
   CLIENT_URL="https://farmse.vercel.app"
   ```
5. Deploy. Your backend URL will be e.g. `https://farmse-api.onrender.com`.

### Step 3: Deploy the Frontend (Vercel / Netlify)
1. In [Vercel](https://vercel.com) or [Netlify](https://netlify.com), import your GitHub repository and select the `frontend/` directory.
2. Set Environment Variables:
   ```env
   VITE_API_URL=https://farmse-api.onrender.com/api
   ```
3. Set Build Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add single-page application redirect rule for React Router (e.g. `vercel.json` or `_redirects`):
   - `/*  /index.html  200`
5. Deploy. Your web app is now live at `https://farmse.vercel.app`.

---

## 🤖 Android APK Packaging with Capacitor

When you are ready to build the standalone Android APK, follow these steps:

### 1. Install Capacitor in Frontend
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init FarmSe com.farmse.app --web-dir=dist
```

### 2. Configure Capacitor for Production Backend
In `frontend/capacitor.config.json` (or `capacitor.config.ts`):
```json
{
  "appId": "com.farmse.app",
  "appName": "FarmSe",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  }
}
```

### 3. Build Web Bundle & Sync to Android
```bash
# Build the production frontend with your live backend API URL
VITE_API_URL=https://farmse-api.onrender.com/api npm run build

# Add the Android native project and copy dist files
npx cap add android
npx cap sync android
```

### 4. Open in Android Studio & Generate APK
```bash
npx cap open android
```
- In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
- The signed `.apk` file will be generated in `android/app/build/outputs/apk/debug/app-debug.apk` ready to install on Android phones.

---

## 📡 REST API Summary

- `POST /api/auth/register` - Create customer or farmer account
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Authenticated profile
- `GET /api/products` - Multi-filter marketplace search (category, price, location, organic)
- `POST /api/products` - Create harvest listing
- `GET /api/cart` - Cart subtotal & free delivery threshold
- `POST /api/orders/checkout` - Atomic order creation & inventory decrement
- `GET /api/orders/my-orders` - User order history & timeline
- `GET /api/farmer/dashboard` - Producer KPI revenue & order metrics
- `GET /api/admin/stats` - Platform GMV & farmer verification logs
- `POST /api/ai/price-prediction` - Extensible Mandi price forecasting
- `GET /api/health` - Service & database health probe

---

## 📜 License
MIT License
