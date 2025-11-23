# eLINE - Smart Queue Management System

A modern, real-time queue management system for salons, clinics, and service businesses with a premium dark-themed UI.

## ✨ Features

### Customer Experience
- 📱 **QR Code Entry** - Scan and join instantly, no app installation
- ⏱️ **Live Wait Time Estimates** - See accurate wait times before joining
- 🔔 **Smart Notifications** - WhatsApp/SMS alerts when your turn approaches
- 📊 **Real-time Updates** - Track your position in the queue live
- 🎯 **Minimal Data Entry** - Just name and phone number

### Business Dashboard
- 👨‍💼 **Admin Panel** - Manage entire queue from one dashboard
- ✅ **Approval System** - Review and approve new customers
- 📈 **Live Analytics** - Track queue metrics in real-time
- 🔄 **Service Tracking** - Start/complete services with one click
- 📱 **Automated Notifications** - Customers notified automatically

### Technical Features
- ⚡ **Real-time WebSocket Updates** - Instant queue synchronization
- 🎨 **Modern UI** - Glassmorphism, smooth animations, premium design
- 📱 **Fully Responsive** - Works on all devices
- 🔒 **Secure** - Environment-based configuration
- 🚀 **Fast** - Built with Vite for optimal performance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- (Optional) Twilio account for SMS notifications

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
PORT=3000
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
APP_URL=http://localhost:3000
```

3. **Start the backend server:**
```bash
npm run server
```

4. **In a new terminal, start the frontend:**
```bash
npm run dev
```

5. **Access the application:**
- Customer View: http://localhost:5173
- Admin Dashboard: http://localhost:5173/admin

## 📱 Usage

### For Customers

1. Scan QR code or visit the business link
2. Select your desired service
3. View estimated wait time
4. Enter name and phone number
5. Receive confirmation with token number
6. Get notified when your turn approaches

### For Business Staff

1. Navigate to `/admin`
2. View all pending customers
3. Approve customers to add them to queue
4. Click "Start" when beginning service
5. Click "Complete" when service is finished
6. Monitor real-time queue statistics

## 🎨 UI Features

- **Dark Theme** - Easy on the eyes, modern aesthetic
- **Glassmorphism** - Frosted glass effects throughout
- **Smooth Animations** - Micro-interactions and transitions
- **Responsive Design** - Mobile-first approach
- **Live Updates** - Real-time queue changes without refresh

## 🔧 Tech Stack

### Frontend
- Vanilla JavaScript (ES6+)
- Vite (build tool)
- WebSocket (real-time updates)
- CSS3 (animations, glassmorphism)

### Backend
- Node.js + Express
- WebSocket Server (ws)
- Twilio (SMS notifications)
- QRCode generation

## 📊 API Endpoints

```
POST   /api/queue/join              - Join queue
GET    /api/queue                   - Get all queue entries
GET    /api/queue/status/:token     - Get customer status
POST   /api/queue/:id/approve       - Approve customer
POST   /api/queue/:id/start         - Start service
POST   /api/queue/:id/complete      - Complete service
DELETE /api/queue/:id               - Remove customer
GET    /api/qr/:businessId          - Generate QR code
```

## 🔔 Notification Flow

1. **Join Confirmation** - Sent immediately after joining
2. **Approval Notice** - When admin approves the request
3. **Upcoming Alert** - When 1-2 people ahead
4. **Turn Notification** - When it's customer's turn

## 🚀 Production Deployment

### Recommended Setup

1. **Database** - Replace in-memory storage with PostgreSQL/MongoDB
2. **Redis** - Add for session management and caching
3. **n8n** - Set up automation workflows for:
   - Peak hour predictions
   - No-show handling
   - Analytics reports
   - Calendar integrations

4. **Deploy to:**
   - Frontend: Vercel, Netlify, or Cloudflare Pages
   - Backend: Railway, Render, or DigitalOcean
   - Database: Supabase, PlanetScale, or MongoDB Atlas

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
APP_URL=https://yourdomain.com
```

## 🎯 Future Enhancements

- [ ] Multi-business support
- [ ] Staff assignment per service
- [ ] Payment integration (Razorpay)
- [ ] Google Calendar sync
- [ ] Analytics dashboard with charts
- [ ] Customer feedback system
- [ ] Loyalty program integration
- [ ] Mobile app (React Native)
- [ ] AI-powered wait time predictions
- [ ] Multi-language support

## 📄 License

MIT License - feel free to use for commercial projects!

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

Built with ❤️ for modern service businesses
