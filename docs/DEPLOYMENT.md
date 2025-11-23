# Deployment Guide

## Quick Deploy Options

### 1. Railway (Recommended - Easiest)

Railway provides the simplest deployment with automatic HTTPS and environment management.

**Steps:**
1. Push code to GitHub
2. Visit [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables in Railway dashboard
6. Deploy automatically happens

**Environment Variables to Set:**
```
NODE_ENV=production
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
APP_URL=https://your-app.railway.app
```

**Cost:** ~$5-10/month

### 2. Vercel + Separate Backend

**Frontend (Vercel):**
```bash
npm install -g vercel
vercel --prod
```

**Backend (Railway/Render):**
Deploy backend separately and update API proxy in `vite.config.js`

### 3. DigitalOcean App Platform

**Steps:**
1. Create new app from GitHub
2. Set build command: `npm install && npm run build`
3. Set run command: `npm run server`
4. Add environment variables
5. Deploy

**Cost:** $5-12/month

### 4. Docker + Any VPS

**Build and run:**
```bash
docker build -t eline .
docker run -p 3000:3000 --env-file .env eline
```

**Or use docker-compose:**
```bash
docker-compose up -d
```

This includes PostgreSQL, Redis, and n8n for full automation.

### 5. Heroku

**Steps:**
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
git push heroku main
heroku config:set TWILIO_ACCOUNT_SID=xxx
heroku config:set TWILIO_AUTH_TOKEN=xxx
```

## Database Setup (Production)

### PostgreSQL Schema

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  token INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  service_id INTEGER NOT NULL,
  service_duration INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notified_at TIMESTAMP
);

CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  icon VARCHAR(10),
  active BOOLEAN DEFAULT true
);

CREATE TABLE customer_visits (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  visit_count INTEGER DEFAULT 1,
  last_visit TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  peak_hour INTEGER,
  total_customers INTEGER,
  avg_wait_time INTEGER,
  no_show_count INTEGER
);

CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_token ON customers(token);
CREATE INDEX idx_customer_visits_phone ON customer_visits(phone);
```

### Migrate from In-Memory to Database

Replace `server/queueManager.js` with database queries:

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class QueueManager {
  async addCustomer(name, phone, serviceId) {
    const result = await pool.query(
      `INSERT INTO customers (token, name, phone, service_id, service_duration, status)
       VALUES ((SELECT COALESCE(MAX(token), 0) + 1 FROM customers), $1, $2, $3, 
               (SELECT duration FROM services WHERE id = $3), 'pending')
       RETURNING *`,
      [name, phone, serviceId]
    );
    return result.rows[0];
  }
  
  async getQueue() {
    const result = await pool.query(
      'SELECT * FROM customers WHERE status != $1 ORDER BY joined_at',
      ['completed']
    );
    return result.rows;
  }
  
  // ... implement other methods
}
```

## SSL/HTTPS Setup

### Let's Encrypt (Free)

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

Update server to use certificates:
```javascript
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

### Cloudflare (Easiest)

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Always Use HTTPS"
4. Done! Cloudflare handles SSL automatically

## Performance Optimization

### 1. Enable Compression
```javascript
import compression from 'compression';
app.use(compression());
```

### 2. Add Redis Caching
```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache queue data
app.get('/api/queue', async (req, res) => {
  const cached = await redis.get('queue');
  if (cached) return res.json(JSON.parse(cached));
  
  const queue = await queueManager.getQueue();
  await redis.setex('queue', 10, JSON.stringify(queue));
  res.json(queue);
});
```

### 3. CDN for Static Assets
- Use Cloudflare CDN
- Or upload assets to AWS S3 + CloudFront

### 4. Database Connection Pooling
Already configured in PostgreSQL setup above.

## Monitoring

### 1. Error Tracking - Sentry
```bash
npm install @sentry/node
```

```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

### 2. Uptime Monitoring
- UptimeRobot (free)
- Pingdom
- Better Uptime

### 3. Analytics
- Plausible Analytics (privacy-friendly)
- Google Analytics
- Mixpanel

## Backup Strategy

### Automated Database Backups
```bash
# Daily backup cron job
0 2 * * * pg_dump $DATABASE_URL > /backups/eline_$(date +\%Y\%m\%d).sql
```

### Backup to S3
```bash
npm install aws-sdk

# backup.js
import AWS from 'aws-sdk';
import { exec } from 'child_process';

const s3 = new AWS.S3();

exec('pg_dump $DATABASE_URL', (error, stdout) => {
  s3.putObject({
    Bucket: 'eline-backups',
    Key: `backup-${Date.now()}.sql`,
    Body: stdout
  }).promise();
});
```

## Scaling

### Horizontal Scaling
- Use Redis for session storage
- Deploy multiple instances behind load balancer
- Use sticky sessions for WebSocket connections

### Vertical Scaling
- Start with 1GB RAM / 1 CPU
- Scale to 2GB RAM / 2 CPU when > 100 concurrent users
- Monitor with `pm2 monit`

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (CSP headers)
- [ ] CORS configured properly
- [ ] Admin routes password protected
- [ ] Regular dependency updates
- [ ] Database backups automated
- [ ] Error logs monitored

## Cost Estimates

### Minimal Setup (< 100 customers/day)
- Railway/Render: $5-10/month
- Twilio: $1-5/month (pay per SMS)
- Domain: $12/year
- **Total: ~$10-15/month**

### Medium Setup (100-500 customers/day)
- DigitalOcean Droplet: $12/month
- Managed PostgreSQL: $15/month
- Twilio: $10-20/month
- Domain + CDN: $15/month
- **Total: ~$50-60/month**

### Large Setup (500+ customers/day)
- AWS/GCP with auto-scaling: $100-200/month
- Managed database: $50/month
- Twilio: $50-100/month
- CDN + monitoring: $30/month
- **Total: ~$250-400/month**
