# eLINE Deployment Guide 🚀

## Quick Deployment Steps

### Step 1: Deploy Backend to Render (30 mins)

1. **Go to [render.com](https://render.com)** and sign up with GitHub

2. **Create PostgreSQL Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `eline-db`
   - Database: `eline`
   - User: `eline`
   - Region: Choose closest to you
   - Plan: **Free**
   - Click "Create Database"
   - **WAIT 10-15 minutes** for provisioning
   - Copy the "Internal Database URL" (starts with `postgres://`)

3. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo: `yugallohani/eLINE`
   - Name: `eline-backend`
   - Region: Same as database
   - Branch: `main`
   - Root Directory: (leave empty)
   - Runtime: **Node**
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm run server`
   - Plan: **Free**

4. **Add Environment Variables:**
   Click "Environment" tab and add:
   ```
   NODE_ENV=production
   DATABASE_URL=<paste your database URL from step 2>
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=3000
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 5-10 minutes for build
   - Note your backend URL: `https://eline-backend.onrender.com`

6. **Run Database Migration:**
   - Go to your service → "Shell" tab
   - Run: `npx prisma db push`
   - Run: `node scripts/seed-demo-barber.js` (optional - for demo data)

---

### Step 2: Deploy Frontend to Vercel (10 mins)

1. **Go to [vercel.com](https://vercel.com)** and sign up with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Import `yugallohani/eLINE`
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Vite**
   - Root Directory: (leave as is)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variable:**
   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://eline-backend.onrender.com
     ```
   - Select all environments (Production, Preview, Development)

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Note your frontend URL: `https://eline.vercel.app`

---

### Step 3: Update Backend with Frontend URL

1. **Go back to Render dashboard**
2. **Open your `eline-backend` service**
3. **Go to "Environment" tab**
4. **Add new environment variable:**
   ```
   FRONTEND_URL=https://eline.vercel.app
   ```
5. **Save Changes** (service will auto-redeploy)

---

### Step 4: Test Your Deployment

1. **Visit your frontend:** `https://eline.vercel.app`
2. **Test customer flow:** Click "Join Queue"
3. **Test barber login:** Go to `/barber-login`
4. **Test admin panel:** Go to `/super-admin`
   - Email: `admin@eline.app`
   - Password: `admin123`

---

## Your Deployed URLs

After deployment, you'll have:

- **Frontend:** `https://eline.vercel.app`
- **Backend API:** `https://eline-backend.onrender.com`
- **Database:** Managed by Render

---

## Important Notes

### Render Free Tier Limitations:
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⚠️ **Takes 30-50 seconds to wake up** on first request
- ✅ **750 hours/month free** (enough for demo)
- ✅ **PostgreSQL database included**

### For Demo Tomorrow:
1. **Wake up the backend** 10 minutes before demo
2. **Visit** `https://eline-backend.onrender.com/api/health` to wake it up
3. **Keep a tab open** to prevent sleep during demo

---

## Troubleshooting

### Backend not responding:
- Wait 30-50 seconds (it's waking up)
- Check Render logs for errors
- Verify DATABASE_URL is correct

### Frontend can't connect to backend:
- Check VITE_API_URL in Vercel
- Check CORS settings in backend
- Check browser console for errors

### Database connection failed:
- Verify DATABASE_URL in Render
- Run `npx prisma db push` in Render shell
- Check database is running in Render

---

## Next Steps After Deployment

1. ✅ Test all features on production
2. ✅ Create demo shop accounts
3. ✅ Generate QR codes with production URL
4. ✅ Test on mobile devices
5. ✅ Prepare for demo tomorrow!

---

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Check service logs in respective dashboards
