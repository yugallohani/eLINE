import './style.css';
import { router } from './router.js';
import { state } from './state.js';
import { shopRegistration } from './shopRegistration.js';
import { adminDashboard } from './adminDashboard.js';
import { barberLogin } from './barberLogin.js';
import { barberDashboard } from './barberDashboard.js';
import { shopList } from './shopList.js';
import { serviceSelection } from './serviceSelection.js';

// Set API URL - use same origin in production, localhost in development
window.API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');
console.log('API URL:', window.API_URL);

// Initialize app
function init() {
  const app = document.getElementById('app');
  
  // Handle routing
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  
  // Route handling
  if (path === '/shops') {
    shopList.render(app);
  } else if (path.startsWith('/shop/')) {
    const barberCode = path.split('/shop/')[1];
    serviceSelection.render(app, barberCode);
    
    // Attach form handler after render
    setTimeout(() => {
      const form = document.getElementById('join-queue-form');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          serviceSelection.handleJoinQueue(new FormData(form));
        };
      }
    }, 500);
  } else if (path === '/register-shop') {
    shopRegistration.render(app);
  } else if (path === '/application-submitted') {
    renderApplicationSubmitted(app);
  } else if (path === '/super-admin' || path === '/admin') {
    adminDashboard.init(app);
  } else if (path === '/barber-login') {
    barberLogin.render(app);
  } else if (path === '/barber-dashboard') {
    barberDashboard.init(app);
  } else if (path === '/queue' && params.get('token')) {
    router.renderQueueStatus(app, params.get('token'));
  } else {
    router.renderCustomer(app, params.get('business'));
  }
  
  // Connect WebSocket for live updates
  state.connectWebSocket();
}

// Application submitted success page
function renderApplicationSubmitted(app) {
  app.innerHTML = `
    <div class="bg-animated"></div>
    <div class="landing-page">
      <div class="landing-container">
        <div class="success-page">
          <div class="success-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="40" fill="url(#successGradient)"/>
              <path d="M25 40L35 50L55 30" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="80" y2="80">
                  <stop offset="0%" stop-color="#10b981"/>
                  <stop offset="100%" stop-color="#059669"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <h1 class="success-title">Application Submitted Successfully! 🎉</h1>
          <p class="success-subtitle">
            Thank you for applying to join eLINE. Your application is now under review.
          </p>
          
          <div class="success-info-box">
            <h3>What happens next?</h3>
            <div class="success-steps">
              <div class="success-step">
                <span class="step-number">1</span>
                <div>
                  <strong>Document Verification</strong>
                  <p>Our team will verify your documents within 24-48 hours</p>
                </div>
              </div>
              <div class="success-step">
                <span class="step-number">2</span>
                <div>
                  <strong>Approval Notification</strong>
                  <p>You'll receive an SMS with your unique Barber Code</p>
                </div>
              </div>
              <div class="success-step">
                <span class="step-number">3</span>
                <div>
                  <strong>Start Managing</strong>
                  <p>Login with your Barber Code and start using eLINE</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="success-actions">
            <button class="btn btn-primary btn-large" onclick="window.location.href='/'">
              Back to Home
            </button>
            <button class="btn btn-secondary btn-large" onclick="window.location.href='/barber-login'">
              Already Approved? Login
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}





// Handle browser navigation
window.addEventListener('popstate', init);

init();
