# API Documentation

Base URL: `https://your-domain.com/api`

## Authentication

Currently, the API is open for customer endpoints. Admin endpoints should be protected with authentication in production.

**Recommended:** Add JWT authentication for admin routes.

## Endpoints

### Customer Endpoints

#### Join Queue
```http
POST /api/queue/join
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "serviceId": 1
}
```

**Response:**
```json
{
  "id": 1234567890,
  "token": 23,
  "name": "John Doe",
  "phone": "+1234567890",
  "serviceId": 1,
  "serviceDuration": 25,
  "status": "pending",
  "joinedAt": "2025-11-21T10:30:00.000Z"
}
```

#### Get Queue Status
```http
GET /api/queue/status/:token
```

**Response:**
```json
{
  "customer": {
    "id": 1234567890,
    "token": 23,
    "name": "John Doe",
    "status": "active"
  },
  "position": 3,
  "estimatedWait": 45
}
```

#### Get Full Queue
```http
GET /api/queue
```

**Response:**
```json
[
  {
    "id": 1234567890,
    "token": 23,
    "name": "John Doe",
    "phone": "+1234567890",
    "serviceId": 1,
    "serviceDuration": 25,
    "status": "active",
    "joinedAt": "2025-11-21T10:30:00.000Z"
  }
]
```

### Admin Endpoints

#### Approve Customer
```http
POST /api/queue/:id/approve
```

**Response:**
```json
{
  "success": true
}
```

#### Start Service
```http
POST /api/queue/:id/start
```

**Response:**
```json
{
  "success": true
}
```

#### Complete Service
```http
POST /api/queue/:id/complete
```

**Response:**
```json
{
  "success": true
}
```

#### Remove Customer
```http
DELETE /api/queue/:id
```

**Response:**
```json
{
  "success": true
}
```

### Utility Endpoints

#### Generate QR Code
```http
GET /api/qr/:businessId
```

**Response:**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "url": "https://your-domain.com/?business=salon123"
}
```

## WebSocket Events

Connect to: `wss://your-domain.com`

### Events Received

#### Queue Update
```json
{
  "type": "queue_update",
  "queue": [
    {
      "id": 1234567890,
      "token": 23,
      "status": "active"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `400` - Bad Request (invalid data)
- `404` - Not Found (invalid token/ID)
- `500` - Server Error

## Rate Limiting

**Recommended for production:**
- Customer endpoints: 10 requests/minute per IP
- Admin endpoints: 100 requests/minute per IP

```javascript
import rateLimit from 'express-rate-limit';

const customerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10
});

app.use('/api/queue/join', customerLimiter);
```

## Error Responses

```json
{
  "error": "Error message here"
}
```

## Webhooks (for n8n/Zapier)

Configure these webhooks to trigger automation:

### Customer Joined
```json
POST https://your-automation-url.com/customer-joined
{
  "event": "customer_joined",
  "customer": { ... },
  "timestamp": "2025-11-21T10:30:00.000Z"
}
```

### Service Completed
```json
POST https://your-automation-url.com/service-completed
{
  "event": "service_completed",
  "customer": { ... },
  "duration": 25,
  "timestamp": "2025-11-21T11:00:00.000Z"
}
```

### Customer No-Show
```json
POST https://your-automation-url.com/no-show
{
  "event": "no_show",
  "customer": { ... },
  "timestamp": "2025-11-21T11:15:00.000Z"
}
```
