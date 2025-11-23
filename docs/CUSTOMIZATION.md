# Customization Guide

## Branding

### 1. Change Logo and Colors

Edit `src/style.css`:

```css
:root {
  /* Change primary brand color */
  --accent-primary: #6366f1; /* Your brand color */
  --accent-secondary: #8b5cf6; /* Secondary color */
  
  /* Update gradient */
  --accent-gradient: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}

/* Change logo text */
.logo {
  /* Add your custom font */
  font-family: 'YourFont', sans-serif;
}
```

### 2. Add Your Logo Image

Replace text logo with image in `src/router.js`:

```javascript
<header class="header">
  <img src="/logo.png" alt="Your Business" class="logo-img" style="height: 48px;">
</header>
```

### 3. Customize Services

Edit `src/state.js`:

```javascript
services: [
  { id: 1, name: 'Your Service 1', duration: 30, icon: '✂️' },
  { id: 2, name: 'Your Service 2', duration: 45, icon: '💆' },
  // Add more services
]
```

**Available Emoji Icons:**
- Haircut: ✂️
- Spa: 💆
- Massage: 💆‍♂️
- Nails: 💅
- Makeup: 💄
- Doctor: 👨‍⚕️
- Dentist: 🦷
- Eye: 👁️
- Injection: 💉
- Pills: 💊
- Lab: 🔬

### 4. Custom Notification Messages

Edit `server/notifications.js`:

```javascript
async sendConfirmation(customer) {
  const message = `
    Welcome to [YOUR BUSINESS]! 
    Your token: #${customer.token}
    
    We'll notify you when it's your turn.
    
    Track status: ${process.env.APP_URL}/queue?token=${customer.token}
  `;
  await this.sendSMS(customer.phone, message);
}
```

## Multi-Language Support

### 1. Create Language Files

```javascript
// src/i18n/en.js
export default {
  selectService: 'Select Your Service',
  estimatedWait: 'Estimated Wait Time',
  joinQueue: 'Join Queue',
  yourToken: 'Your Token',
  peopleAhead: 'people ahead'
};

// src/i18n/es.js
export default {
  selectService: 'Selecciona Tu Servicio',
  estimatedWait: 'Tiempo de Espera Estimado',
  joinQueue: 'Unirse a la Cola',
  yourToken: 'Tu Token',
  peopleAhead: 'personas delante'
};
```

### 2. Use Translations

```javascript
import en from './i18n/en.js';
import es from './i18n/es.js';

const lang = localStorage.getItem('lang') || 'en';
const t = lang === 'es' ? es : en;

// Use in templates
<h2>${t.selectService}</h2>
```

## Business-Specific Features

### 1. Add Staff Assignment

```javascript
// In service selection
services: [
  { 
    id: 1, 
    name: 'Haircut', 
    duration: 30, 
    icon: '✂️',
    staff: ['John', 'Sarah', 'Mike']
  }
]

// Let customer choose staff
<select class="input">
  ${service.staff.map(s => `<option>${s}</option>`)}
</select>
```

### 2. Add Service Pricing

```javascript
services: [
  { 
    id: 1, 
    name: 'Haircut', 
    duration: 30, 
    icon: '✂️',
    price: 25
  }
]

// Display in UI
<div class="service-price">$${service.price}</div>
```

### 3. Add Appointment Booking

Allow customers to book specific time slots instead of just joining queue:

```javascript
// Add time slot selection
<div class="time-slots">
  <button class="time-slot">10:00 AM</button>
  <button class="time-slot">10:30 AM</button>
  <button class="time-slot">11:00 AM</button>
</div>
```

### 4. Add Customer Notes

```javascript
// In join queue form
<div class="input-group">
  <label class="input-label">Special Requests (Optional)</label>
  <textarea class="input" id="customer-notes" rows="3"></textarea>
</div>

// Save with customer data
const notes = document.getElementById('customer-notes').value;
await api.joinQueue(name, phone, serviceId, notes);
```

## UI Customization

### 1. Change Theme

Light theme option:

```css
/* Add to style.css */
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e5e5e5;
  --text-primary: #000000;
  --text-secondary: #666666;
  --glass-bg: rgba(0, 0, 0, 0.05);
}
```

Toggle button:

```javascript
<button onclick="toggleTheme()">🌓 Toggle Theme</button>

<script>
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', 
    current === 'light' ? 'dark' : 'light'
  );
}
</script>
```

### 2. Add Background Video

```html
<div class="bg-video">
  <video autoplay muted loop>
    <source src="/background.mp4" type="video/mp4">
  </video>
</div>
```

```css
.bg-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.1;
}

.bg-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 3. Add Sound Notifications

```javascript
// Play sound when turn is near
const notificationSound = new Audio('/notification.mp3');

if (position <= 2) {
  notificationSound.play();
}
```

### 4. Add Confetti Animation

```bash
npm install canvas-confetti
```

```javascript
import confetti from 'canvas-confetti';

// When customer's turn
if (customer.status === 'serving') {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}
```

## Advanced Features

### 1. Add Payment Integration

```javascript
// Razorpay integration
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

const options = {
  key: 'YOUR_RAZORPAY_KEY',
  amount: service.price * 100, // in paise
  currency: 'INR',
  name: 'Your Business',
  description: service.name,
  handler: function(response) {
    // Payment successful
    joinQueue(name, phone, serviceId, response.razorpay_payment_id);
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

### 2. Add Customer Loyalty Program

```javascript
// Track visits
const visits = await getCustomerVisits(phone);

if (visits >= 5) {
  // Show discount
  <div class="loyalty-badge">
    🎉 You've earned a 20% discount!
  </div>
}
```

### 3. Add Photo Upload

For services that need reference photos:

```javascript
<input type="file" accept="image/*" id="reference-photo">

// Upload to cloud storage
const formData = new FormData();
formData.append('photo', photoFile);
await fetch('/api/upload', { method: 'POST', body: formData });
```

### 4. Add Video Consultation

For remote consultations:

```javascript
// Integrate with Zoom/Google Meet
<button onclick="startVideoCall()">
  📹 Start Video Consultation
</button>

function startVideoCall() {
  window.open(`https://meet.google.com/new`, '_blank');
}
```

## Mobile App Wrapper

Convert to mobile app using Capacitor:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
```

Add push notifications:

```bash
npm install @capacitor/push-notifications
```

## White Label Solution

To offer eLINE to multiple businesses:

1. **Multi-tenancy database schema:**
```sql
CREATE TABLE businesses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  subdomain VARCHAR(100) UNIQUE,
  logo_url TEXT,
  primary_color VARCHAR(7),
  settings JSONB
);

ALTER TABLE customers ADD COLUMN business_id INTEGER REFERENCES businesses(id);
```

2. **Dynamic branding:**
```javascript
const business = await getBusinessBySubdomain(req.hostname);
document.documentElement.style.setProperty('--accent-primary', business.primary_color);
```

3. **Separate admin panels:**
```
https://salon1.eline.com/admin
https://clinic2.eline.com/admin
```
