# 📝 Changelog

## v2.0.0 - Real-Time Database & Automations (Latest)

### 🎉 Major Updates

#### ✅ Real-Time Database (PostgreSQL + Prisma)
- **Persistent data** - No more data loss on server restart
- **Multi-business support** - Manage multiple locations
- **Customer visit tracking** - Loyalty program ready
- **Analytics storage** - Historical data and insights
- **Notification logging** - Track all sent messages

#### 🤖 Built-in Automations (No n8n Required)
- **No-show detection** - Auto-remove after 15 minutes
- **Feedback requests** - Auto-send after service completion
- **Loyalty rewards** - Auto-award every 5 visits
- **Daily analytics** - Auto-generate at midnight
- **Upcoming notifications** - Auto-notify when 1-2 ahead

#### 📱 WhatsApp Business API Integration
- **Free messaging** - No per-message cost
- **Rich media** - Images, buttons, templates
- **Higher engagement** - 98% open rate
- **Fallback to SMS** - Automatic failover
- **Delivery tracking** - Know when messages are read

#### 📊 Enhanced Features
- **Real-time analytics** - Track performance metrics
- **Visit history** - Customer loyalty tracking
- **Revenue tracking** - Monitor earnings
- **Peak hour detection** - Optimize staffing
- **Notification history** - Audit trail

### 🔧 Technical Improvements
- **Prisma ORM** - Type-safe database queries
- **Connection pooling** - Better performance
- **Database migrations** - Version control for schema
- **Automated backups** - Data safety
- **Rate limiting** - API protection
- **Compression** - Faster responses

### 📚 New Documentation
- `DATABASE_SETUP.md` - Complete database guide
- `WHATSAPP_SETUP.md` - WhatsApp integration guide
- `CHANGELOG.md` - This file

### 🗄️ Database Schema
```
businesses → services → customers
                     ↓
              customer_visits
                     ↓
              analytics
                     ↓
              notifications
                     ↓
              automation_logs
```

### 🔄 Migration from v1.0

**Old (In-Memory):**
```javascript
queueManager.addCustomer(name, phone, serviceId);
```

**New (Database):**
```javascript
await prisma.customer.create({
  data: { name, phone, serviceId, businessId }
});
```

**Benefits:**
- ✅ Data persists across restarts
- ✅ Multi-business support
- ✅ Historical analytics
- ✅ Audit trails
- ✅ Scalable

### 📦 New Dependencies
```json
{
  "@prisma/client": "^5.7.0",
  "prisma": "^5.7.0",
  "node-cron": "^3.0.3",
  "axios": "^1.6.2",
  "compression": "^1.7.4",
  "express-rate-limit": "^7.1.5"
}
```

### 🚀 New npm Scripts
```bash
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:studio    # Open database GUI
npm run db:seed      # Seed demo data
```

### ⚙️ New Environment Variables
```env
DATABASE_URL=postgresql://...
WHATSAPP_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id
```

---

## v1.0.0 - Initial Release

### Features
- ✅ Customer queue management
- ✅ Admin dashboard
- ✅ Real-time WebSocket updates
- ✅ SMS notifications (Twilio)
- ✅ QR code generation
- ✅ Modern dark UI
- ✅ Responsive design
- ✅ In-memory data storage

### Tech Stack
- Frontend: Vite + Vanilla JS
- Backend: Express + WebSocket
- Notifications: Twilio SMS
- Storage: In-memory

### Documentation
- README.md
- QUICKSTART.md
- FEATURES.md
- API.md
- DEPLOYMENT.md
- CUSTOMIZATION.md

---

## Upgrade Guide

### From v1.0 to v2.0

**1. Install new dependencies:**
```bash
npm install
```

**2. Set up PostgreSQL:**
```bash
# See DATABASE_SETUP.md for detailed instructions

# Quick start with Docker:
docker run --name eline-postgres \
  -e POSTGRES_DB=eline \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15-alpine
```

**3. Configure environment:**
```bash
# Add to .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/eline"
```

**4. Initialize database:**
```bash
npm run db:push
npm run db:seed
```

**5. Start application:**
```bash
npm run dev:all
```

**6. Optional - Enable WhatsApp:**
```bash
# See WHATSAPP_SETUP.md
# Add to .env:
WHATSAPP_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id
```

### Breaking Changes

**None!** The API remains backward compatible. Old endpoints still work.

### Deprecated

- `server/queueManager.js` - Replaced with database queries
- In-memory storage - Now uses PostgreSQL

---

## Roadmap

### v2.1 (Coming Soon)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Video consultations
- [ ] Payment integration (Razorpay/Stripe)
- [ ] Staff management
- [ ] Appointment booking

### v2.2
- [ ] AI-powered wait time predictions
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Customer feedback system
- [ ] Email notifications

### v3.0
- [ ] White-label SaaS platform
- [ ] Subscription management
- [ ] Multi-location management
- [ ] Advanced reporting
- [ ] API marketplace

---

## Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

---

## Support

- 📚 Documentation: See docs/ folder
- 🐛 Issues: Open GitHub issue
- 💬 Discussions: GitHub Discussions
- 📧 Email: support@eline.app

---

**Thank you for using eLINE! 🎉**
