# 🔑 Test Credentials

## All Login Credentials for Testing

### 🔐 **Super Admin Portal**
**URL:** http://localhost:5173/super-admin

```
Email: admin@eline.app
Password: admin123
```

**Features:**
- Dashboard with real-time stats
- Gemini AI insights
- Review shop applications
- Approve/reject shops
- Manage all shops
- Platform analytics

---

### 💈 **Barber Dashboard**
**URL:** http://localhost:5173/barber-login

```
Barber Code: BARBER-DEMO01
Password: demo123
```

**Shop Details:**
- Shop Name: Demo Salon
- Email: demo@eline.app
- Status: Approved

**Features:**
- View queue
- Approve customers
- Manage services
- Start/complete services
- View analytics
- Gemini AI insights

---

### 👤 **Customer (No Login Required)**
**URL:** http://localhost:5173/?business=demo

**Test Flow:**
1. Select service
2. Enter name: "Test Customer"
3. Enter phone: "+1234567890"
4. Join queue
5. Get token number
6. Track status

---

## 🎯 Quick Test Guide

### **Test 1: Admin Login**
```bash
1. Open: http://localhost:5173/super-admin
2. Email: admin@eline.app
3. Password: admin123
4. Click: Login to Admin Panel
5. See: Dashboard with stats
```

### **Test 2: Barber Login**
```bash
1. Open: http://localhost:5173/barber-login
2. Barber Code: BARBER-DEMO01
3. Password: demo123
4. Click: Login to Dashboard
5. See: Barber dashboard
```

### **Test 3: Customer Flow**
```bash
1. Open: http://localhost:5173/?business=demo
2. Click: Join Queue
3. Select: Haircut
4. Name: Test User
5. Phone: +1234567890
6. Click: Join Queue
7. See: Token number
```

---

## 📊 Database Access

### **Prisma Studio (Database GUI)**
```bash
npm run db:studio
```
**URL:** http://localhost:5555

**View:**
- All businesses
- Customers in queue
- Services
- Analytics
- Admins

---

## 🔄 Reset Demo Data

If you need to reset:

```bash
# Reset database
./scripts/reset-and-setup.sh

# Or manually
docker exec eline-postgres psql -U postgres -c "DROP DATABASE eline;"
docker exec eline-postgres psql -U postgres -c "CREATE DATABASE eline;"
npm run db:push
npm run db:seed
```

---

## 🆘 Troubleshooting

### **Admin Login Not Working:**
- Check email: admin@eline.app
- Check password: admin123
- Clear browser cache
- Check server logs

### **Barber Login Not Working:**
- Check barber code: BARBER-DEMO01 (uppercase)
- Check password: demo123
- Make sure backend is running
- Check server logs

### **Customer Can't Join Queue:**
- Make sure backend is running
- Check database connection
- View browser console for errors

---

## 📝 Notes

### **Passwords:**
- All passwords are hashed with bcrypt
- Demo passwords are for testing only
- Change in production

### **Barber Code Format:**
- Always uppercase
- Format: BARBER-XXXXXX
- 6 random characters
- Generated on shop approval

### **Token Format:**
- Sequential numbers
- Starts from 1
- Resets daily (optional)

---

## 🎉 All Systems Ready!

You can now test:
- ✅ Admin portal
- ✅ Barber dashboard
- ✅ Customer queue
- ✅ Shop registration
- ✅ Real-time updates
- ✅ AI insights

**Happy testing! 🚀**
