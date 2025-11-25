# eLINE - Smart Queue Management System

> A modern, AI-powered queue management platform for barbershops and salons. Skip the wait, join digitally, and get notified when it's your turn.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://eline.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Overview

eLINE transforms traditional queue management into a seamless digital experience. Customers can join queues remotely via QR codes, receive real-time updates, and get SMS notifications when their turn approaches. Shop owners get a powerful dashboard with AI-powered analytics to optimize operations.

## ✨ Key Features

### For Customers
- 📱 **QR Code Access** - Scan shop QR code to instantly view services and join queue
- ⏱️ **Real-Time Wait Times** - See accurate estimates before joining
- 🔔 **Smart Notifications** - SMS/WhatsApp alerts when your turn is near
- 📊 **Live Queue Tracking** - Monitor your position in real-time
- 🎯 **Simple Registration** - Just name and phone number required

### For Shop Owners
- 👨‍💼 **Barber Dashboard** - Manage queue, approve customers, track services
- 📈 **AI-Powered Analytics** - Get insights on peak hours, popular services, and trends
- 🔄 **Service Management** - Customize services, pricing, and durations
- 📱 **Automated Notifications** - Customers notified automatically at each stage
- 💰 **Revenue Tracking** - Monitor daily/monthly earnings and customer metrics

### For Platform Admins
- 🏪 **Multi-Shop Management** - Approve and manage multiple barbershops
- 📊 **Platform Analytics** - View system-wide metrics and performance
- 🤖 **Gemini AI Insights** - Get AI-generated business recommendations
- 📄 **Application Review** - Verify shop documents and approve registrations
- 🔐 **Secure Authentication** - JWT-based auth with role-based access control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ database
- (Optional) Twilio account for SMS notifications
- (Optional) Google Gemini API key for AI insights

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/eline.git
cd eline
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/eline"

# Server
PORT=3000
APP_URL=http://localhost:5173

# Authentication
JWT_SECRET=your_secure_random_string
ADMIN_EMAIL=admin@eline.app
ADMIN_PASSWORD=admin123

# SMS Notifications (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# AI Analytics (Optional)
GEMINI_API_KEY=your_gemini_api_key
```

4. **Set up the database:**
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

5. **Start the application:**
```bash
# Development (runs both frontend and backend)
npm run dev:all

# Or run separately:
npm run server    # Backend on port 3000
npm run dev       # Frontend on port 5173
```

6. **Access the application:**
- Customer View: http://localhost:5173
- Shop List: http://localhost:5173/shops
- Barber Login: http://localhost:5173/barber-login
- Admin Dashboard: http://localhost:5173/admin

### Default Credentials
- **Admin:** admin@eline.app / admin123
- **Demo Barber:** BARBER-DEMO01 / demo123

## 📱 How It Works

### Customer Journey
1. **Discover** - Scan shop QR code or visit shop list page
2. **Browse** - View available services with pricing and wait times
3. **Select** - Choose a service and see estimated wait time
4. **Join** - Enter name and phone number to join queue
5. **Track** - Monitor queue position in real-time via unique token
6. **Notified** - Receive SMS when it's almost your turn

### Shop Owner Workflow
1. **Register** - Submit shop application with documents
2. **Approval** - Admin reviews and approves application
3. **Setup** - Receive barber code and password via SMS
4. **Login** - Access barber dashboard with credentials
5. **Manage** - Approve customers, start/complete services
6. **Analyze** - View AI-powered insights and analytics

### Admin Operations
1. **Review Applications** - Verify shop documents and details
2. **Approve Shops** - Generate barber codes and credentials
3. **Monitor Platform** - View system-wide analytics
4. **Manage Shops** - View details, delete shops if needed
5. **AI Insights** - Get Gemini-powered platform recommendations

## 🛠️ Tech Stack

### Frontend
- **Vanilla JavaScript (ES6+)** - Modern, modular architecture
- **Vite** - Lightning-fast build tool and dev server
- **CSS3** - Glassmorphism design with custom properties
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js + Express.js** - RESTful API server
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Reliable relational database
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing

### Integrations
- **Google Gemini AI** - Business insights and analytics
- **Twilio** - SMS notifications
- **WhatsApp Business API** - Rich messaging (optional)
- **QRCode** - Shop-specific QR code generation

### DevOps
- **Docker** - Containerization
- **Render** - Cloud hosting platform
- **Git** - Version control

## 📊 Key API Endpoints

### Queue Management
```
POST   /api/queue/join                    - Customer joins queue
GET    /api/queue/status/:token           - Get queue status by token
PATCH  /api/customers/:id/status          - Update customer status
```

### Authentication
```
POST   /api/barber/login                  - Barber login
POST   /api/admin/login                   - Admin login
```

### Shop Management
```
POST   /api/shop/apply                    - Submit shop application
GET    /api/shops/list                    - Get approved shops
POST   /api/admin/applications/:id/approve - Approve application
```

### Analytics
```
GET    /api/admin/dashboard               - Platform metrics
GET    /api/admin/insights                - AI-generated insights
GET    /api/admin/analytics?days=30       - Historical analytics
```

## 🚀 Deployment

### Deploy to Render (Recommended)

1. **Fork this repository**

2. **Create a new Web Service on Render:**
   - Connect your GitHub repository
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

3. **Add a PostgreSQL database:**
   - Create a new PostgreSQL instance on Render
   - Copy the Internal Database URL

4. **Set environment variables:**
   - Add all variables from `.env.example`
   - Set `DATABASE_URL` to your PostgreSQL URL
   - Set `APP_URL` to your Render service URL

5. **Deploy!** - Render will automatically build and deploy

### Manual Deployment

```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

## 📁 Project Structure

```
eLINE/
├── src/                    # Frontend source code
│   ├── main.js            # Application entry point
│   ├── router.js          # Client-side routing
│   ├── barberDashboard.js # Shop owner dashboard
│   ├── adminDashboard.js  # Platform admin panel
│   ├── shopRegistration.js # Shop application form
│   └── style.css          # Global styles
├── server/                 # Backend source code
│   ├── index.js           # Express server & API routes
│   ├── auth.js            # Authentication middleware
│   ├── database.js        # Prisma client
│   ├── geminiAnalytics.js # AI analytics service
│   ├── notifications.js   # SMS/WhatsApp service
│   └── automations.js     # Cron jobs & automation
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma      # Database models
│   └── seed.js            # Seed data
├── scripts/                # Utility scripts
├── uploads/                # User-uploaded files
└── index.html             # HTML entry point
```

## 🎯 Roadmap

- [x] Multi-shop support
- [x] AI-powered analytics
- [x] QR code generation
- [x] SMS notifications
- [x] Shop registration system
- [x] Document upload & verification
- [ ] Payment integration (Razorpay/Stripe)
- [ ] Customer feedback & ratings
- [ ] Appointment scheduling
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Loyalty program
- [ ] Email notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent analytics
- Twilio for reliable SMS delivery
- Prisma for excellent database tooling
- The open-source community

## 📧 Contact

For questions or support, please open an issue or contact [yugalalmora@gmail.com](mailto:yugalalmora@gmail.com)

---

**Built with ❤️ for modern barbershops and salons**

[Live Demo](https://eline.onrender.com) • [Report Bug](https://github.com/yourusername/eline/issues) • [Request Feature](https://github.com/yourusername/eline/issues)
