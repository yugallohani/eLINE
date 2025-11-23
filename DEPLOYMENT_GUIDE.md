# eLINE Deployment Guide - Render Only 🚀

## Single Service Deployment (Frontend + Backend on Render)

### Step 1: Create Render Account (2 mins)

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

---

### Step 2: Create PostgreSQL Database (15 mins)

1. **Click "New +" → "PostgreSQL"**

2. **Configure Database:**
   - Name: `eline-db`
   - Database: `eline`
   - User: `eline`
   - Region: **Singapore** (or closest to you)
   - PostgreSQL Version: 16
   - Plan: **Free**

3. **Click "Create Database"**

4. **WAIT 10-15 minutes** for database provisioning
   - You'll see "Creating..." status
   - Wait until it shows "Available"

5. **Copy Database URL:**
   - Once available, click on the database
   - Find "Internal Database URL"
   - Copy it (starts with `postgres://`)
   - Keep it handy for next step

---

### Step 3: Deploy Full Stack Service (20 mins)

1. **Click "New +" → "Web Service"**

2. **Connect Repository:**
   - Click "Connect a repository"
   - Find and select: `yugallohani/eLINE`
   - Click "Connect"

3. **Configure Service:**
   - **Name:** `eline`
   - **Region:** Same as database (Singapore)
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Runtime:** Node
   - **Build Command:** 
     ```
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command:**
     ```
     npm run server
     ```
   - **Plan:** Free

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   Add these variables:
   
   ```
   NODE_ENV=production
   ```
   
   ```
   DATABASE_URL=<paste your database URL from Step 2>
   ```
   
   ```
   JWT_SECRET=eline-super-secret-jwt-key-2024-change-this-in-production
   ```
   
   ```
   PORT=10000
   ```

5. **Click "Create Web Service"**

6. **Wait for Build (5-10 minutes)**
   - You'll see build logs
   - Wait for "Build successful"
   - Then wait for "Deploy live"

7. **Your App is Live!**
   - You'll get a URL like: `https://eline.onrender.com`
   - Copy this URL

---

### Step 4: Initialize Database (5 mins)

1. **Go to your service dashboard**

2. **Click "Shell" tab** (top right)

3. **Run database migration:**
   ```bash
   npx prisma db push
   ```
   Wait for "✅ Database synchronized"

4. **Create demo data (optional):**
   ```bash
   node scripts/seed-demo-barber.js
   ```

5. **Done!** Your database is ready

---

### Step 5: Test Your Deployment (5 mins)

1. **Visit your URL:** `https://eline.onrender.com`

2. **Test Homepage:**
   - Should see eLINE landing page
   - Click "Join Queue" button

3. **Test Admin Panel:**
   - Go to: `https://eline.onrender.com/super-admin`
   - Login:
     - Email: `admin@eline.app`
     - Password: `admin123`

4. **Test Barber Login:**
   - Go to: `https://eline.onrender.com/barber-login`
   - If you ran seed script:
     - Code: `BARBER-DEMO`
     - Password: `demo123`

5. **Test Shop Registration:**
   - Go to: `https://eline.onrender.com/register-shop`
   - Fill and submit form

---

## Your Deployed URLs

After deployment:

- **Full App:** `https://eline.onrender.com`
- **Admin Panel:** `https://eline.onrender.com/super-admin`
- **Barber Login:** `https://eline.onrender.com/barber-login`
- **Shop Registration:** `https://eline.onrender.com/register-shop`
- **API:** `https://eline.onrender.com/api/*`

---

## Important Notes

### ⚠️ Render Free Tier Limitations:

1. **Spins down after 15 minutes of inactivity**
   - First request takes 30-50 seconds to wake up
   - Keep a tab open during demo

2. **750 hours/month free**
   - More than enough for demo and testing

3. **Automatic deploys**
   - Every push to `main` branch triggers new deployment

### 💡 For Demo Tomorrow:

1. **Wake up service 10 minutes before demo:**
   - Visit `https://eline.onrender.com`
   - Wait for it to load
   - Keep tab open

2. **Test all flows beforehand:**
   - Customer queue joining
   - Barber dashboard
   - Admin panel

3. **Have backup plan:**
   - Take screenshots
   - Record video demo
   - Have localhost ready

---

## Troubleshooting

### Service won't start:
- Check build logs in Render dashboard
- Verify all environment variables are set
- Check DATABASE_URL is correct

### Database connection failed:
- Verify DATABASE_URL in environment variables
- Make sure database is "Available" status
- Run `npx prisma db push` in Shell

### Page shows 404:
- Wait 30-50 seconds (service is waking up)
- Check deployment status in dashboard
- Verify build completed successfully

### API calls failing:
- Check browser console for errors
- Verify service is running
- Check logs in Render dashboard

---

## Deployment Checklist

- [ ] Create Render account
- [ ] Create PostgreSQL database (wait for provisioning)
- [ ] Copy database URL
- [ ] Create web service
- [ ] Add environment variables
- [ ] Wait for build and deploy
- [ ] Run database migration in Shell
- [ ] Test all pages
- [ ] Create demo data
- [ ] Test on mobile
- [ ] Ready for demo! 🎉

---

## After Deployment

### Create Demo Accounts:

1. **Admin already exists:**
   - Email: `admin@eline.app`
   - Password: `admin123`

2. **Create demo shop:**
   - Register via `/register-shop`
   - Approve via admin panel
   - Get barber code

3. **Generate QR codes:**
   - Use production URL
   - Print or display on device

---

## Cost Breakdown

- **Render Web Service:** FREE (750 hrs/month)
- **PostgreSQL Database:** FREE
- **Total:** $0/month 💰

---

## Need Help?

- **Render Docs:** https://render.com/docs
- **Check Logs:** Render Dashboard → Your Service → Logs
- **Database Issues:** Render Dashboard → Database → Logs
- **Build Errors:** Check build logs in deployment

---

## Next Steps

1. ✅ Deploy to Render (follow steps above)
2. ✅ Test all features
3. ✅ Build QR code flow (I'll do this)
4. ✅ Build shop list (I'll do this)
5. ✅ Generate QR codes
6. ✅ Demo ready! 🚀
