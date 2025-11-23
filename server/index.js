import express from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './database.js';
import { notificationService } from './notifications.js';
import { automationService } from './automations.js';
import { authMiddleware, ensureDefaultAdmin } from './auth.js';
import { geminiAnalytics } from './geminiAnalytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({
  origin: true, // Allow same origin
  credentials: true
}));
app.use(compression());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Create uploads directory if it doesn't exist
import { mkdirSync, existsSync } from 'fs';
const uploadsDir = path.join(__dirname, '../uploads/documents');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// WebSocket connections
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  
  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Broadcast queue updates to all connected clients
function broadcastQueueUpdate() {
  const message = JSON.stringify({
    type: 'queue_update',
    timestamp: new Date().toISOString()
  });
  
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// Helper function to calculate estimated wait time
async function calculateEstimatedWait(businessId, serviceId) {
  const activeQueue = await prisma.customer.findMany({
    where: {
      businessId,
      status: { in: ['active', 'serving'] }
    },
    include: { service: true },
    orderBy: { joinedAt: 'asc' }
  });

  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });

  const totalWait = activeQueue.reduce((sum, c) => sum + c.service.duration, 0);
  return totalWait + (service?.duration || 0);
}

// Helper function to get next token number
async function getNextToken(businessId) {
  const lastCustomer = await prisma.customer.findFirst({
    where: { businessId },
    orderBy: { token: 'desc' }
  });
  return (lastCustomer?.token || 0) + 1;
}

// API Routes
app.post('/api/queue/join', async (req, res) => {
  try {
    const { name, phone, serviceId, businessId = 'demo' } = req.body;
    
    // Get or create business
    let business = await prisma.business.findUnique({
      where: { subdomain: businessId }
    });
    
    if (!business) {
      business = await prisma.business.findFirst();
    }

    const token = await getNextToken(business.id);
    const estimatedWait = await calculateEstimatedWait(business.id, serviceId);
    
    const customer = await prisma.customer.create({
      data: {
        businessId: business.id,
        serviceId,
        token,
        name,
        phone,
        status: 'pending',
        estimatedWait,
        notificationsSent: {}
      },
      include: {
        service: true,
        business: true
      }
    });
    
    console.log('✅ Customer created:', {
      name: customer.name,
      token: customer.token,
      id: customer.id
    });
    
    // Send confirmation notification
    await notificationService.sendConfirmation(customer);
    
    broadcastQueueUpdate();
    res.json(customer);
  } catch (error) {
    console.error('Join queue error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/queue', async (req, res) => {
  try {
    const { businessId = 'demo' } = req.query;
    
    let business = await prisma.business.findUnique({
      where: { subdomain: businessId }
    });
    
    if (!business) {
      business = await prisma.business.findFirst();
    }

    const queue = await prisma.customer.findMany({
      where: {
        businessId: business.id,
        status: { not: 'completed' }
      },
      include: {
        service: true
      },
      orderBy: { joinedAt: 'asc' }
    });
    
    res.json(queue);
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/queue/status/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Validate token parameter
    if (!token || isNaN(parseInt(token))) {
      console.error('Invalid token parameter:', token);
      return res.json({ customer: null, error: 'Invalid token' });
    }
    
    const tokenNumber = parseInt(token);
    console.log('Looking up customer with token:', tokenNumber);
    
    const customer = await prisma.customer.findFirst({
      where: { token: tokenNumber },
      include: {
        service: true,
        business: true
      }
    });
    
    if (!customer) {
      console.log('Customer not found for token:', tokenNumber);
      return res.json({ customer: null });
    }
    
    console.log('Customer found:', customer.name, 'Token:', customer.token);

    // Calculate position
    const position = await prisma.customer.count({
      where: {
        businessId: customer.businessId,
        status: { in: ['active', 'serving'] },
        joinedAt: { lt: customer.joinedAt }
      }
    });

    // Calculate estimated wait
    const ahead = await prisma.customer.findMany({
      where: {
        businessId: customer.businessId,
        status: { in: ['active', 'serving'] },
        joinedAt: { lt: customer.joinedAt }
      },
      include: { service: true }
    });

    const estimatedWait = ahead.reduce((sum, c) => sum + c.service.duration, 0);
    
    res.json({
      customer,
      position,
      estimatedWait
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/queue/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await prisma.customer.update({
      where: { id },
      data: { 
        status: 'active',
        approvedAt: new Date()
      },
      include: {
        service: true,
        business: true
      }
    });
    
    await notificationService.sendApproval(customer);
    
    broadcastQueueUpdate();
    res.json({ success: true });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/queue/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await prisma.customer.update({
      where: { id },
      data: { 
        status: 'serving',
        startedAt: new Date(),
        notifiedAt: new Date()
      },
      include: {
        service: true,
        business: true
      }
    });
    
    // Calculate actual wait time
    const actualWait = Math.floor(
      (customer.startedAt - customer.joinedAt) / (1000 * 60)
    );
    
    await prisma.customer.update({
      where: { id },
      data: { actualWait }
    });
    
    await notificationService.sendTurnNotification(customer);
    
    // Notify next customer in queue
    const nextCustomer = await prisma.customer.findFirst({
      where: {
        businessId: customer.businessId,
        status: 'active',
        joinedAt: { gt: customer.joinedAt }
      },
      include: {
        service: true,
        business: true
      },
      orderBy: { joinedAt: 'asc' }
    });
    
    if (nextCustomer) {
      await notificationService.sendUpcomingNotification(nextCustomer, 1);
    }
    
    broadcastQueueUpdate();
    res.json({ success: true });
  } catch (error) {
    console.error('Start service error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/queue/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.customer.update({
      where: { id },
      data: { 
        status: 'completed',
        completedAt: new Date()
      }
    });
    
    broadcastQueueUpdate();
    res.json({ success: true });
  } catch (error) {
    console.error('Complete service error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/queue/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.customer.update({
      where: { id },
      data: { 
        status: 'cancelled',
        completedAt: new Date()
      }
    });
    
    broadcastQueueUpdate();
    res.json({ success: true });
  } catch (error) {
    console.error('Remove customer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get list of all approved shops
app.get('/api/shops/list', async (req, res) => {
  try {
    const shops = await prisma.business.findMany({
      where: {
        status: 'approved',
        barberCode: { not: null }
      },
      include: {
        _count: {
          select: {
            services: { where: { active: true } },
            customers: { where: { status: { in: ['pending', 'active', 'serving'] } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(shops);
  } catch (error) {
    console.error('Get shops list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get business by barber code (for QR code scanning)
app.get('/api/business/:barberCode', async (req, res) => {
  try {
    const { barberCode } = req.params;
    
    const business = await prisma.business.findUnique({
      where: { barberCode },
      include: {
        _count: {
          select: {
            customers: { where: { status: { in: ['pending', 'active', 'serving'] } } }
          }
        }
      }
    });
    
    if (!business) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    const services = await prisma.service.findMany({
      where: {
        businessId: business.id,
        active: true
      },
      orderBy: { name: 'asc' }
    });
    
    res.json({ business, services });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Redirect route for QR codes with barber code
app.get('/shop/:barberCode', async (req, res) => {
  try {
    const { barberCode } = req.params;
    
    const business = await prisma.business.findUnique({
      where: { barberCode },
      select: { id: true }
    });
    
    if (!business) {
      return res.redirect('/shops');
    }
    
    // Redirect to original customer flow
    res.redirect(`/?business=${business.id}&join=true`);
  } catch (error) {
    console.error('QR redirect error:', error);
    res.redirect('/shops');
  }
});

// Generate QR code for business
app.get('/api/qr/:businessId', async (req, res) => {
  try {
    const QRCode = await import('qrcode');
    const { businessId } = req.params;
    const url = `${req.protocol}://${req.get('host')}/?business=${businessId}&join=true`;
    const qrCode = await QRCode.toDataURL(url);
    res.json({ qrCode, url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get services endpoint
app.get('/api/services', async (req, res) => {
  try {
    const { businessId = 'demo' } = req.query;
    
    let business = await prisma.business.findUnique({
      where: { subdomain: businessId }
    });
    
    if (!business) {
      business = await prisma.business.findFirst();
    }

    const services = await prisma.service.findMany({
      where: {
        businessId: business.id,
        active: true
      }
    });
    
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const { businessId = 'demo', days = 7 } = req.query;
    
    let business = await prisma.business.findUnique({
      where: { subdomain: businessId }
    });
    
    if (!business) {
      business = await prisma.business.findFirst();
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const analytics = await prisma.analytics.findMany({
      where: {
        businessId: business.id,
        date: { gte: startDate }
      },
      orderBy: { date: 'desc' }
    });
    
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ============================================
// SHOP APPLICATION ROUTES
// ============================================

// Upload documents endpoint
app.post('/api/upload/documents', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Generate URLs for uploaded files
    const urls = req.files.map(file => {
      return `/uploads/documents/${file.filename}`;
    });
    
    res.json({ 
      success: true, 
      urls: urls,
      message: `${req.files.length} file(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed: ' + error.message });
  }
});

// Submit shop application
app.post('/api/shop/apply', async (req, res) => {
  try {
    const applicationData = req.body;
    
    console.log('📝 Received shop application:', applicationData.shopName);
    
    // Create shop application
    const application = await prisma.shopApplication.create({
      data: {
        shopName: applicationData.shopName,
        ownerName: applicationData.ownerName,
        phone: applicationData.phone,
        email: applicationData.email,
        address: applicationData.address,
        street: applicationData.street,
        area: applicationData.area,
        city: applicationData.city,
        state: applicationData.state,
        pincode: applicationData.pincode,
        latitude: applicationData.latitude,
        longitude: applicationData.longitude,
        numberOfBarbers: parseInt(applicationData.numberOfBarbers),
        servicesOffered: applicationData.servicesPricing || applicationData.services || [],
        operatingHours: {
          opening: applicationData.openingTime,
          closing: applicationData.closingTime
        },
        shopPhotos: applicationData.shopPhotos || [],
        aadhaarUrl: applicationData.aadhaarUrl || '',
        panUrl: applicationData.panUrl || '',
        shopLicenseUrl: applicationData.shopLicenseUrl || '',
        gstCertUrl: applicationData.gstCertUrl || '',
        businessRegUrl: applicationData.businessRegUrl || '',
        status: 'pending'
      }
    });
    
    console.log('✅ Shop application created:', application.id);
    
    // Send confirmation SMS
    await notificationService.send(
      applicationData.phone,
      `Thank you for applying to eLINE! Your application for "${applicationData.shopName}" has been received. We'll review it within 24-48 hours and notify you.`
    );
    
    res.json({ success: true, applicationId: application.id });
  } catch (error) {
    console.error('Shop application error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit application' });
  }
});

// ============================================
// BARBER AUTHENTICATION ROUTES
// ============================================

// Barber login
app.post('/api/barber/login', async (req, res) => {
  try {
    const { barberCode, password } = req.body;
    
    // Find business by barber code
    const business = await prisma.business.findUnique({
      where: { barberCode: barberCode.toUpperCase() }
    });
    
    if (!business) {
      return res.status(401).json({ error: 'Invalid barber code' });
    }
    
    // Check if business is active
    if (business.status !== 'approved') {
      return res.status(403).json({ error: 'Shop is not active' });
    }
    
    // Verify password
    const isValid = await authMiddleware.comparePassword(password, business.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Generate token
    const token = authMiddleware.generateToken({
      id: business.id,
      email: business.email,
      role: 'barber'
    });
    
    res.json({
      token,
      business: {
        id: business.id,
        name: business.name,
        barberCode: business.barberCode,
        email: business.email
      }
    });
  } catch (error) {
    console.error('Barber login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get barber services
app.get('/api/barber/services', authMiddleware.requireAuth, async (req, res) => {
  try {
    const { businessId } = req.query;
    
    const services = await prisma.service.findMany({
      where: { businessId },
      orderBy: { name: 'asc' }
    });
    
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to load services' });
  }
});

// Update barber services
app.post('/api/barber/services', authMiddleware.requireAuth, async (req, res) => {
  try {
    const { businessId, servicesData } = req.body;
    
    const iconMap = {
      'Haircut (Men)': '✂️',
      'Haircut (Women)': '✂️',
      'Beard Trim': '🧔',
      'Hair Spa': '💆',
      'Facial (Basic)': '😊',
      'Waxing (Arms/Legs)': '✨'
    };
    
    const descriptionMap = {
      'Haircut (Men)': 'Professional men\'s haircut with styling',
      'Haircut (Women)': 'Basic women\'s haircut with styling',
      'Beard Trim': 'Beard shaping and trimming',
      'Hair Spa': 'Relaxing hair spa treatment',
      'Facial (Basic)': 'Basic facial treatment',
      'Waxing (Arms/Legs)': 'Arms and legs waxing service'
    };
    
    // Get existing services
    const existingServices = await prisma.service.findMany({
      where: { businessId }
    });
    
    // Deactivate all services first
    await prisma.service.updateMany({
      where: { businessId },
      data: { active: false }
    });
    
    // Update or create selected services
    for (const serviceData of servicesData) {
      const existing = existingServices.find(s => s.name === serviceData.name);
      
      if (existing) {
        // Update existing service
        await prisma.service.update({
          where: { id: existing.id },
          data: {
            price: serviceData.price,
            duration: serviceData.duration,
            active: true
          }
        });
      } else {
        // Create new service
        await prisma.service.create({
          data: {
            businessId,
            name: serviceData.name,
            icon: iconMap[serviceData.name] || '✂️',
            price: serviceData.price,
            duration: serviceData.duration,
            description: descriptionMap[serviceData.name] || '',
            active: true
          }
        });
      }
    }
    
    console.log(`✅ Updated ${servicesData.length} services for business ${businessId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Update services error:', error);
    res.status(500).json({ error: 'Failed to update services' });
  }
});

// Get barber history
app.get('/api/barber/history', authMiddleware.requireAuth, async (req, res) => {
  try {
    const { businessId, filter = 'today' } = req.query;
    
    // Calculate date range based on filter
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default: // today
        break;
    }
    
    const history = await prisma.customer.findMany({
      where: {
        businessId,
        status: { in: ['completed', 'cancelled'] },
        updatedAt: { gte: startDate }
      },
      include: {
        service: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

// Clear barber history
app.delete('/api/barber/history', authMiddleware.requireAuth, async (req, res) => {
  try {
    const { businessId } = req.query;
    
    // Delete completed and cancelled customers
    const result = await prisma.customer.deleteMany({
      where: {
        businessId,
        status: { in: ['completed', 'cancelled'] }
      }
    });
    
    console.log(`✅ Cleared ${result.count} history records for business ${businessId}`);
    
    res.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// ============================================
// ADMIN AUTHENTICATION ROUTES
// ============================================

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email }
    });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if admin is active
    if (!admin.active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }
    
    // Verify password
    const isValid = await authMiddleware.comparePassword(password, admin.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = authMiddleware.generateToken(admin);
    
    res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================
// ADMIN DASHBOARD ROUTES (Protected)
// ============================================

// Get dashboard stats
app.get('/api/admin/dashboard', authMiddleware.requireAuth, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get counts
    const [
      totalShops,
      activeShops,
      pendingApplications,
      todayCustomers,
      totalCustomers,
      todayRevenue
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { status: 'approved' } }),
      prisma.shopApplication.count({ where: { status: 'pending' } }),
      prisma.customer.count({ where: { createdAt: { gte: today } } }),
      prisma.customer.count(),
      prisma.customer.findMany({
        where: {
          createdAt: { gte: today },
          status: 'completed'
        },
        include: { service: true }
      }).then(customers => 
        customers.reduce((sum, c) => sum + (c.service?.price || 0), 0)
      )
    ]);
    
    // Get recent activity
    const recentCustomers = await prisma.customer.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        business: true,
        service: true
      }
    });
    
    // Get shop growth (last 7 days)
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const shopGrowth = await prisma.business.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      _count: true
    });
    
    // Get Gemini insights
    const platformInsights = await geminiAnalytics.generatePlatformInsights();
    
    res.json({
      stats: {
        totalShops,
        activeShops,
        pendingApplications,
        todayCustomers,
        totalCustomers,
        todayRevenue
      },
      recentActivity: recentCustomers,
      shopGrowth,
      aiInsights: platformInsights
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Get pending shop applications
app.get('/api/admin/applications', authMiddleware.requireAuth, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    
    const applications = await prisma.shopApplication.findMany({
      where: { status },
      orderBy: { submittedAt: 'desc' }
    });
    
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to load applications' });
  }
});

// Get single application details
app.get('/api/admin/applications/:id', authMiddleware.requireAuth, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await prisma.shopApplication.findUnique({
      where: { id }
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Failed to load application' });
  }
});

// Approve shop application
app.post('/api/admin/applications/:id/approve', authMiddleware.requireAuth, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const application = await prisma.shopApplication.findUnique({
      where: { id }
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Generate unique barber code
    const barberCode = generateBarberCode();
    
    // Generate temporary password
    const tempPassword = generateTempPassword();
    const passwordHash = await authMiddleware.hashPassword(tempPassword);
    
    // Create business
    const business = await prisma.business.create({
      data: {
        name: application.shopName,
        subdomain: generateSubdomain(application.shopName),
        ownerName: application.ownerName,
        phone: application.phone,
        email: application.email,
        address: application.address,
        street: application.street,
        area: application.area,
        city: application.city,
        state: application.state,
        pincode: application.pincode,
        latitude: application.latitude,
        longitude: application.longitude,
        numberOfBarbers: application.numberOfBarbers,
        operatingHours: application.operatingHours,
        shopPhotos: application.shopPhotos,
        aadhaarUrl: application.aadhaarUrl,
        panUrl: application.panUrl,
        shopLicenseUrl: application.shopLicenseUrl,
        gstCertUrl: application.gstCertUrl,
        businessRegUrl: application.businessRegUrl,
        status: 'approved',
        barberCode,
        passwordHash,
        verifiedAt: new Date(),
        verifiedBy: req.user.id
      }
    });
    
    // Create services from servicesOffered
    const servicesOffered = typeof application.servicesOffered === 'string' 
      ? JSON.parse(application.servicesOffered) 
      : application.servicesOffered;
    
    if (servicesOffered && typeof servicesOffered === 'object') {
      const servicePromises = Object.entries(servicesOffered)
        .filter(([_, service]) => service.enabled)
        .map(([name, service]) => 
          prisma.service.create({
            data: {
              businessId: business.id,
              name: name,
              duration: service.duration || 30,
              price: service.price || 0,
              active: true
            }
          })
        );
      
      await Promise.all(servicePromises);
    }
    
    // Update application
    await prisma.shopApplication.update({
      where: { id },
      data: {
        status: 'approved',
        businessId: business.id,
        reviewNotes: notes,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      }
    });
    
    // Send SMS with barber code and password
    await notificationService.send(
      application.phone,
      `🎉 Congratulations! Your shop "${application.shopName}" has been approved!\n\nBarber Code: ${barberCode}\nPassword: ${tempPassword}\n\nLogin at: ${process.env.APP_URL}/barber-login`
    );
    
    res.json({
      success: true,
      business,
      barberCode,
      tempPassword
    });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

// Reject shop application
app.post('/api/admin/applications/:id/reject', authMiddleware.requireAuth, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;
    
    const application = await prisma.shopApplication.findUnique({
      where: { id }
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Update application
    await prisma.shopApplication.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewNotes: `${reason}\n\n${notes || ''}`,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      }
    });
    
    // Send notification
    await notificationService.send(
      application.phone,
      `Your shop application for "${application.shopName}" needs attention. Reason: ${reason}. Please contact support for more details.`
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ error: 'Failed to reject application' });
  }
});

// Get all shops
app.get('/api/admin/shops', authMiddleware.requireAuth, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = status ? { status } : {};
    
    const shops = await prisma.business.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            customers: true,
            services: true
          }
        }
      }
    });
    
    res.json(shops);
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ error: 'Failed to load shops' });
  }
});

// Get shop details with analytics
app.get('/api/admin/shops/:id', authMiddleware.requireAuth, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const shop = await prisma.business.findUnique({
      where: { id },
      include: {
        services: true,
        customers: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { service: true }
        },
        analytics: {
          take: 30,
          orderBy: { date: 'desc' }
        }
      }
    });
    
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    // Get Gemini insights for this shop
    const insights = await geminiAnalytics.generateInsights(id);
    
    res.json({
      ...shop,
      aiInsights: insights
    });
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({ error: 'Failed to load shop' });
  }
});

// Suspend shop
app.post('/api/admin/shops/:id/suspend', authMiddleware.requireAuth, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    await prisma.business.update({
      where: { id },
      data: {
        status: 'suspended',
        verificationNotes: reason
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Suspend shop error:', error);
    res.status(500).json({ error: 'Failed to suspend shop' });
  }
});

// Reactivate shop
app.post('/api/admin/shops/:id/reactivate', authMiddleware.requireAuth, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.business.update({
      where: { id },
      data: {
        status: 'approved'
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Reactivate shop error:', error);
    res.status(500).json({ error: 'Failed to reactivate shop' });
  }
});

// Get platform analytics
app.get('/api/admin/analytics', authMiddleware.requireAuth, authMiddleware.requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get daily analytics
    const dailyAnalytics = await prisma.analytics.findMany({
      where: {
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });
    
    // Aggregate by date
    const aggregated = {};
    dailyAnalytics.forEach(a => {
      const date = a.date.toISOString().split('T')[0];
      if (!aggregated[date]) {
        aggregated[date] = {
          date,
          totalCustomers: 0,
          completedServices: 0,
          revenue: 0,
          avgWaitTime: []
        };
      }
      aggregated[date].totalCustomers += a.totalCustomers;
      aggregated[date].completedServices += a.completedServices;
      aggregated[date].revenue += a.revenue || 0;
      if (a.avgWaitTime) {
        aggregated[date].avgWaitTime.push(a.avgWaitTime);
      }
    });
    
    // Calculate averages
    const result = Object.values(aggregated).map(day => ({
      ...day,
      avgWaitTime: day.avgWaitTime.length > 0
        ? day.avgWaitTime.reduce((a, b) => a + b, 0) / day.avgWaitTime.length
        : 0
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// Helper functions
function generateBarberCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BARBER-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateTempPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateSubdomain(shopName) {
  return shopName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30) + '-' + Math.random().toString(36).substring(2, 6);
}

// Catch-all route to serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`🚀 eLINE server running on port ${PORT}`);
  console.log(`📱 Customer view: http://localhost:${PORT}`);
  console.log(`👨‍💼 Admin dashboard: http://localhost:${PORT}/admin`);
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Create default admin
    await ensureDefaultAdmin();
    
    // Start automation services
    automationService.start();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  Run: npm run db:push to set up database');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  automationService.stop();
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
