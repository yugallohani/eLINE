import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export const authMiddleware = {
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  },

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  // Hash password
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  },

  // Compare password
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  },

  // Middleware to protect routes
  requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = authMiddleware.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    next();
  },

  // Middleware to require admin role
  requireAdmin(req, res, next) {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  }
};

// Create default admin if not exists
export async function ensureDefaultAdmin() {
  try {
    const adminCount = await prisma.admin.count();
    
    if (adminCount === 0) {
      const hashedPassword = await authMiddleware.hashPassword(
        process.env.ADMIN_PASSWORD || 'admin123'
      );
      
      await prisma.admin.create({
        data: {
          name: 'Super Admin',
          email: process.env.ADMIN_EMAIL || 'admin@eline.app',
          passwordHash: hashedPassword,
          role: 'super_admin'
        }
      });
      
      console.log('✅ Default admin created');
    }
  } catch (error) {
    console.error('Failed to create default admin:', error);
  }
}
