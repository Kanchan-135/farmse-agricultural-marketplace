# ✅ FarmSe Production Deployment Checklist

Use this interactive checklist to track your deployment progress across GitHub, Neon, Render, Vercel, and application feature testing.

---

## 1. 🐙 GitHub & Repository Setup
- [ ] Local Git repository initialized (`git init`)
- [ ] Sensitive files (`.env`, `dev.db`, `node_modules/`, `dist/`) confirmed in `.gitignore`
- [ ] Clean commit created on `main` branch
- [ ] Remote GitHub repository created on [github.com](https://github.com)
- [ ] Code pushed to GitHub (`git push -u origin main`)

---

## 2. 🐘 Neon PostgreSQL Database
- [ ] Neon project created (`farmse-production`)
- [ ] Database `farmse_db` created in chosen region
- [ ] PostgreSQL connection string copied (`DATABASE_URL`) with `?sslmode=require`

---

## 3. 🚀 Render Backend Deployment
- [ ] Render Web Service created connected to GitHub repo (`backend` root directory)
- [ ] Build command set: `npm install && npx prisma generate && npx prisma db push && npm run prisma:seed && npm run build`
- [ ] Start command set: `npm run start`
- [ ] Environment variables configured:
  - [ ] `NODE_ENV` = `production`
  - [ ] `PORT` = `5000`
  - [ ] `DATABASE_URL` = *(Neon connection string)*
  - [ ] `JWT_SECRET` = *(High-entropy secret key)*
  - [ ] `JWT_EXPIRES_IN` = `7d`
  - [ ] `CORS_ORIGIN` = `http://localhost:5173,capacitor://localhost,http://localhost`
  - [ ] `FRONTEND_URL` = `http://localhost:5173`
- [ ] Backend build succeeded on Render
- [ ] Health probe verified: `https://<your-render-url>/api/health` returns `{"status":"healthy"}`

---

## 4. ⚡ Vercel Frontend Deployment
- [ ] Vercel project imported from GitHub (`frontend` root directory)
- [ ] Framework preset confirmed as `Vite`
- [ ] Build command confirmed as `npm run build`
- [ ] Output directory confirmed as `dist`
- [ ] Environment variable configured:
  - [ ] `VITE_API_URL` = `https://<your-render-url>/api`
- [ ] Deployment succeeded and live URL obtained (e.g. `https://farmse.vercel.app`)
- [ ] Single Page App deep linking verified (no 404 on page refresh)

---

## 5. 🔄 Final CORS & Environment Sync
- [ ] Render `CORS_ORIGIN` updated to include live Vercel URL: `https://farmse.vercel.app,capacitor://localhost,http://localhost`
- [ ] Render `FRONTEND_URL` updated to `https://farmse.vercel.app`
- [ ] Render service redeployed with new CORS settings

---

## 6. 🧪 Production Feature Verification
- [ ] **Landing Page**: Loads hero, category carousel, and featured crops cleanly
- [ ] **Marketplace**: Multi-filters (category, price, location, organic, stock) work in real-time
- [ ] **Authentication**:
  - [ ] Customer login works (`rahul.verma@farmse.com` / `customer123`)
  - [ ] Farmer login works (`ramesh.patel@farmse.com` / `farmer123`)
  - [ ] Admin login works (`admin@farmse.com` / `admin123`)
  - [ ] New user registration works
- [ ] **Shopping Cart & Checkout**:
  - [ ] Add to cart increments counter
  - [ ] Checkout form accepts shipping address and contact phone
  - [ ] Mock UPI / Card / COD orders place successfully
  - [ ] Redirects to Order Success page with order receipt
- [ ] **Order Tracking**: 5-step live timeline displays accurate fulfillment status
- [ ] **Farmer Dashboard**:
  - [ ] Revenue and order metrics reflect real-time transactions
  - [ ] Product inventory CRUD and stock toggles work
  - [ ] Order fulfillment status dropdown updates order pipeline
- [ ] **Customer Dashboard**:
  - [ ] Active orders and past order history display correctly
  - [ ] Wishlist saves and removes favorites
  - [ ] Profile address and password change work
- [ ] **Admin Dashboard**:
  - [ ] Platform GMV, total farmers, and total users show accurate counts
  - [ ] Farmer approval / suspension toggle works
  - [ ] Global catalog moderation works
- [ ] **Mobile Responsiveness**:
  - [ ] Tested on Android / mobile screen viewports (360px - 480px)
  - [ ] Bottom navigation bar displays cleanly with live badges
  - [ ] Product Details sticky buy bar accessible
  - [ ] Forms and buttons are comfortably touchable

---

## 7. 📱 Future Android APK (Capacitor)
- [ ] Capacitor dependencies installed in `frontend/`
- [ ] `VITE_API_URL` set to live Render URL for Android production build
- [ ] `npx cap sync android` ran successfully
- [ ] Android project builds cleanly in Android Studio
