import { state, api } from './state.js';
import { whatsappNotification } from './whatsappNotification.js';

export const router = {
  renderCustomer(app, businessId) {
    // Check if we should show landing page or service selection
    const urlParams = new URLSearchParams(window.location.search);
    const showLanding = !urlParams.has('join');
    
    if (showLanding) {
      this.renderLandingPage(app);
    } else {
      app.innerHTML = `
        <div class="bg-animated"></div>
        <div class="container">
          <header class="header">
            <h1 class="logo">eLINE</h1>
          </header>
          <div id="customer-view"></div>
        </div>
      `;
      this.renderServiceSelection();
    }
  },

  renderLandingPage(app) {
    app.innerHTML = `
      <div class="bg-animated"></div>
      <div class="landing-page">
        <div class="landing-container">
          <!-- Hero Section -->
          <div class="hero-section">
            <div class="hero-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="40" fill="url(#gradient)"/>
                <path d="M35 25L45 35M45 35L35 45M45 35L55 25M45 35L55 45" stroke="white" stroke-width="3" stroke-linecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="80" y2="80">
                    <stop offset="0%" stop-color="#6366f1"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <h1 class="hero-title">
              Welcome to <span class="hero-brand">eLINE</span>
            </h1>
            
            <p class="hero-subtitle">
              Smart queue management for barber shops. Skip the wait, join the queue<br>
              digitally, and get notified when it's your turn.
            </p>
            
            <div class="hero-buttons">
              <button class="btn btn-primary btn-large" onclick="window.location.href='/?join=true'">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="margin-right: 8px;">
                  <path d="M4 4H8V8H4V4ZM12 4H16V8H12V4ZM4 12H8V16H4V12Z" fill="currentColor"/>
                </svg>
                Join Queue (Customer)
              </button>
              <button class="btn btn-secondary btn-large" onclick="window.location.href='/barber-login'">
                Barber Dashboard
              </button>
            </div>
            
            <div style="margin-top: 24px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
              <a href="/register-shop" style="color: var(--text-secondary); text-decoration: none; font-size: 14px; transition: color 0.3s;" onmouseover="this.style.color='var(--accent-primary)'" onmouseout="this.style.color='var(--text-secondary)'">
                🏪 Register Your Shop
              </a>
              <span style="color: var(--text-tertiary);">•</span>
              <a href="/super-admin" style="color: var(--text-secondary); text-decoration: none; font-size: 14px; transition: color 0.3s;" onmouseover="this.style.color='var(--accent-primary)'" onmouseout="this.style.color='var(--text-secondary)'">
                🔐 Super Admin Portal
              </a>
            </div>
          </div>

          <!-- Features Section -->
          <div class="features-section">
            <div class="feature-card">
              <div class="feature-icon" style="color: #0ea5e9;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <h3 class="feature-title">Scan & Join</h3>
              <p class="feature-description">
                Simply scan the QR code at the shop to join the queue instantly
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon" style="color: #f59e0b;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <h3 class="feature-title">Real-time Updates</h3>
              <p class="feature-description">
                Get live updates on your queue position and estimated wait time
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon" style="color: #10b981;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M23 21V19C23 17.1362 21.7252 15.5701 20 15.126" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 3.12598C17.7252 3.56992 19 5.13616 19 7C19 8.86384 17.7252 10.4301 16 10.874" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <h3 class="feature-title">Smart Notifications</h3>
              <p class="feature-description">
                Receive timely alerts when your turn is approaching
              </p>
            </div>
          </div>

          <!-- How It Works Section -->
          <div class="how-it-works-section">
            <h2 class="section-title">How eLINE Works</h2>
            
            <div class="how-it-works-grid">
              <!-- For Customers -->
              <div class="how-it-works-card">
                <h3 class="how-it-works-heading">For Customers</h3>
                <p class="how-it-works-subheading">Simple steps to skip the wait</p>
                
                <div class="steps-list">
                  <div class="step-item">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <h4 class="step-title">Scan QR Code</h4>
                      <p class="step-description">Found at your barber shop</p>
                    </div>
                  </div>
                  
                  <div class="step-item">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <h4 class="step-title">Enter Details</h4>
                      <p class="step-description">Name and service type</p>
                    </div>
                  </div>
                  
                  <div class="step-item">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <h4 class="step-title">Get Approved</h4>
                      <p class="step-description">Barber confirms you're present</p>
                    </div>
                  </div>
                  
                  <div class="step-item">
                    <div class="step-number">4</div>
                    <div class="step-content">
                      <h4 class="step-title">Relax & Wait</h4>
                      <p class="step-description">Get notified when it's your turn</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- For Barbers -->
              <div class="how-it-works-card">
                <h3 class="how-it-works-heading" style="color: #f59e0b;">For Barbers</h3>
                <p class="how-it-works-subheading">Manage your shop effortlessly</p>
                
                <div class="steps-list">
                  <div class="step-item">
                    <div class="step-number" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">1</div>
                    <div class="step-content">
                      <h4 class="step-title">Approve Requests</h4>
                      <p class="step-description">Only approve present customers</p>
                    </div>
                  </div>
                  
                  <div class="step-item">
                    <div class="step-number" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">2</div>
                    <div class="step-content">
                      <h4 class="step-title">Manage Queue</h4>
                      <p class="step-description">Call next, remove no-shows</p>
                    </div>
                  </div>
                  
                  <div class="step-item">
                    <div class="step-number" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">3</div>
                    <div class="step-content">
                      <h4 class="step-title">Control Flow</h4>
                      <p class="step-description">Pause queue during busy times</p>
                    </div>
                  </div>
                  
                  <div class="step-item">
                    <div class="step-number" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">4</div>
                    <div class="step-content">
                      <h4 class="step-title">Happy Customers</h4>
                      <p class="step-description">Reduce waiting stress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA Section -->
          <div class="cta-section">
            <h2 class="cta-title">Ready to Transform Your Shop?</h2>
            <p class="cta-subtitle">
              Join thousands of barber shops already using eLINE to improve customer experience
            </p>
            <button class="btn btn-cta" onclick="window.location.href='/register-shop'">
              Get Started Today
            </button>
            <p style="margin-top: 16px; font-size: 14px; color: var(--text-tertiary);">
              Already have an account? <a href="/barber-login" style="color: var(--accent-primary); text-decoration: none;">Login here</a>
            </p>
          </div>

          <!-- Footer -->
          <div class="landing-footer">
            <p>&copy; 2025 eLINE. Smart Queue Management System.</p>
          </div>
        </div>
      </div>
    `;
  },
  
  async renderServiceSelection() {
    const view = document.getElementById('customer-view');
    view.innerHTML = `
      <div class="glass-card fade-in">
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="font-size: 32px; margin-bottom: 16px;">Select Your Service</h2>
          <p style="color: var(--text-secondary);">Choose a service to see estimated wait time</p>
        </div>
        <div class="services-grid" id="services-grid"><div class="spinner"></div></div>
        <div style="margin-top: 32px; text-align: center;">
          <button class="btn btn-secondary" onclick="window.location.href='/'">
            ← Back to Home
          </button>
        </div>
      </div>
    `;
    
    // Fetch services and queue data
    const [services, queue] = await Promise.all([
      api.getServices(),
      api.getQueue()
    ]);
    
    const grid = document.getElementById('services-grid');
    grid.innerHTML = '';
    
    if (services.length === 0) {
      grid.innerHTML = '<p style="color: var(--text-secondary);">No services available</p>';
      return;
    }
    
    // Calculate current wait time based on active queue
    const activeQueue = queue.filter(q => q.status === 'active' || q.status === 'serving');
    const currentWaitTime = activeQueue.reduce((sum, c) => sum + (c.service?.duration || 0), 0);
    
    services.forEach(service => {
      const estimatedWait = currentWaitTime + service.duration;
      const queueLength = activeQueue.length;
      
      const card = document.createElement('div');
      card.className = 'service-card service-card-enhanced';
      card.innerHTML = `
        <div class="service-wait-time">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          ~${estimatedWait} min wait
        </div>
        <div class="service-icon">${service.icon}</div>
        <div class="service-name">${service.name}</div>
        <div class="service-duration">Service time: ${service.duration} min</div>
        ${queueLength > 0 ? `<div style="color: var(--text-secondary); font-size: 13px; margin-top: 8px;">${queueLength} ${queueLength === 1 ? 'person' : 'people'} in queue</div>` : '<div style="color: var(--success); font-size: 13px; margin-top: 8px;">✓ No wait!</div>'}
        ${service.price ? `
          <div class="service-price-tag">
            <span class="service-price">₹${service.price}</span>
            <span class="service-duration-badge">${service.duration} min</span>
          </div>
        ` : ''}
      `;
      card.onclick = () => this.showEstimate(service, estimatedWait, queueLength);
      grid.appendChild(card);
    });
  },
  
  async showEstimate(service, preCalculatedWait, queueLength) {
    const view = document.getElementById('customer-view');
    
    // Calculate wait time if not provided
    let totalWaitTime = preCalculatedWait;
    let activeQueueLength = queueLength;
    
    if (!totalWaitTime) {
      const queue = await api.getQueue();
      const activeQueue = queue.filter(q => q.status !== 'completed');
      totalWaitTime = activeQueue.reduce((sum, q) => sum + (q.service?.duration || 0), 0) + service.duration;
      activeQueueLength = activeQueue.length;
    }
    
    const estimatedTime = new Date(Date.now() + totalWaitTime * 60000);
    const timeString = estimatedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    view.innerHTML = `
      <div class="glass-card fade-in">
        <button class="btn btn-secondary btn-sm" onclick="window.location.href='/?join=true'" style="margin-bottom: 24px;">
          ← Back to Services
        </button>
        
        <div style="text-align: center; padding: 32px 0;">
          <div class="service-icon" style="font-size: 72px;">${service.icon}</div>
          <h3 style="font-size: 32px; margin: 24px 0; font-weight: 700;">${service.name}</h3>
          
          <!-- Wait Time Display -->
          <div style="background: var(--bg-tertiary); border-radius: 20px; padding: 32px; margin: 32px 0;">
            <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 32px;">
              <div>
                <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Estimated Wait</div>
                <div class="wait-time" style="font-size: 48px;">${totalWaitTime} min</div>
              </div>
              <div>
                <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Expected Time</div>
                <div style="font-size: 32px; font-weight: 700; color: var(--accent-primary);">${timeString}</div>
              </div>
              <div>
                <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">Queue Position</div>
                <div style="font-size: 32px; font-weight: 700; color: var(--text-primary);">#${activeQueueLength + 1}</div>
              </div>
            </div>
          </div>
          
          <!-- Service Details -->
          <div style="display: flex; justify-content: center; gap: 24px; margin: 24px 0; flex-wrap: wrap;">
            <div class="badge badge-active" style="padding: 12px 20px; font-size: 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px; vertical-align: middle;">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              ${service.duration} minutes
            </div>
            ${service.price ? `
              <div class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 12px 20px; font-size: 14px;">
                ₹${service.price}
              </div>
            ` : ''}
            ${activeQueueLength > 0 ? `
              <div class="badge badge-pending" style="padding: 12px 20px; font-size: 14px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px; vertical-align: middle;">
                  <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                ${activeQueueLength} in queue
              </div>
            ` : `
              <div class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 12px 20px; font-size: 14px;">
                ✓ No wait!
              </div>
            `}
          </div>
        </div>
        
        <!-- Join Form -->
        <div style="margin-top: 40px; max-width: 500px; margin-left: auto; margin-right: auto;">
          <h3 style="font-size: 20px; margin-bottom: 24px; text-align: center;">Join the Queue</h3>
          
          <div class="input-group">
            <label class="input-label">Your Name *</label>
            <input type="text" class="input" id="customer-name" placeholder="John Doe" required>
          </div>
          
          <div class="input-group">
            <label class="input-label">Phone Number *</label>
            <input type="tel" class="input" id="customer-phone" placeholder="+1 234 567 8900" required>
          </div>
          
          <div class="input-group">
            <label class="input-label">Email (Optional)</label>
            <input type="email" class="input" id="customer-email" placeholder="john@example.com">
          </div>
          
          <div class="input-group">
            <label class="input-label">Special Requests (Optional)</label>
            <textarea class="input" id="customer-notes" rows="3" placeholder="Any specific requirements..."></textarea>
          </div>
          
          <div style="background: var(--bg-tertiary); border-radius: 12px; padding: 16px; margin: 24px 0;">
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
              💡 <strong>What happens next:</strong><br>
              1. You'll receive a confirmation with your token number<br>
              2. The barber will approve your request<br>
              3. You'll get notified when it's almost your turn<br>
              4. Feel free to step out - we'll keep you updated!
            </p>
          </div>
          
          <div style="display: flex; gap: 16px; margin-top: 32px;">
            <button class="btn btn-primary" style="flex: 1;" id="join-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-right: 8px;">
                <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Confirm & Join Queue
            </button>
            <button class="btn btn-secondary" onclick="window.location.href='/?join=true'">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('join-btn').onclick = async () => {
      const name = document.getElementById('customer-name').value.trim();
      const phone = document.getElementById('customer-phone').value.trim();
      const email = document.getElementById('customer-email').value.trim();
      const notes = document.getElementById('customer-notes').value.trim();
      
      if (!name || !phone) {
        alert('⚠️ Please enter your name and phone number');
        return;
      }
      
      // Show loading state
      const btn = document.getElementById('join-btn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; margin: 0 auto;"></div>';
      btn.disabled = true;
      
      try {
        const result = await api.joinQueue(name, phone, service.id);
        
        // Validate result has token
        if (!result || !result.token) {
          throw new Error('Invalid response from server');
        }
        
        console.log('Queue joined successfully:', result);
        
        // Show WhatsApp-style notification
        whatsappNotification.show({
          name: result.name,
          token: result.token,
          serviceName: service.name,
          estimatedWait: result.estimatedWait || service.duration
        }, {
          name: result.business?.name || 'Demo Salon'
        });
        
        // Redirect after showing notification (increased delay for database sync)
        setTimeout(() => {
          window.location.href = `/queue?token=${result.token}`;
        }, 3000);
      } catch (error) {
        console.error('Join queue error:', error);
        alert('❌ Failed to join queue. Please try again.');
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    };
  },
  
  async renderQueueStatus(app, token) {
    app.innerHTML = `
      <div class="bg-animated"></div>
      <div class="container">
        <header class="header">
          <h1 class="logo">eLINE</h1>
        </header>
        <div class="glass-card fade-in">
          <div id="queue-status"></div>
        </div>
      </div>
    `;
    
    state.currentToken = token;
    this.updateQueueStatus();
    
    // Subscribe to updates
    state.subscribe(() => this.updateQueueStatus());
  },
  
  async updateQueueStatus() {
    const statusDiv = document.getElementById('queue-status');
    if (!statusDiv) return;
    
    const data = await api.getQueueStatus(state.currentToken);
    
    if (!data.customer) {
      statusDiv.innerHTML = `
        <div class="queue-status">
          <h2 style="font-size: 32px; color: var(--error);">Token Not Found</h2>
          <p style="color: var(--text-secondary); margin-top: 16px;">
            This token may have expired or been removed.
          </p>
        </div>
      `;
      return;
    }
    
    const { customer, position, estimatedWait } = data;
    
    let statusMessage = '';
    let statusClass = '';
    
    if (customer.status === 'pending') {
      statusMessage = 'Waiting for approval...';
      statusClass = 'badge-pending';
    } else if (customer.status === 'serving') {
      statusMessage = '🎉 Your turn! Please proceed to the counter';
      statusClass = 'badge-serving pulse';
    } else if (customer.status === 'active') {
      statusMessage = `${position} ${position === 1 ? 'person' : 'people'} ahead`;
      statusClass = 'badge-active';
    }
    
    statusDiv.innerHTML = `
      <div class="queue-status">
        <div class="badge ${statusClass}" style="font-size: 16px; padding: 12px 24px;">
          ${statusMessage}
        </div>
        <div class="token-number">#${customer.token}</div>
        <h3 style="font-size: 24px; margin-bottom: 8px;">Hello, ${customer.name}!</h3>
        <p style="color: var(--text-secondary); margin-bottom: 32px;">
          Service: ${state.services.find(s => s.id === customer.serviceId)?.name}
        </p>
        
        ${customer.status !== 'serving' ? `
          <div class="wait-time">${estimatedWait} min</div>
          <p class="queue-position">Estimated wait time</p>
        ` : ''}
        
        <div style="margin-top: 48px; padding: 24px; background: var(--bg-tertiary); border-radius: 16px;">
          <p style="color: var(--text-secondary); font-size: 14px;">
            💡 You'll receive a notification when it's almost your turn. Feel free to step out!
          </p>
        </div>
      </div>
    `;
  },
  
  async renderAdmin(app) {
    app.innerHTML = `
      <div class="bg-animated"></div>
      <div class="container">
        <header class="header" style="display: flex; justify-content: space-between; align-items: center;">
          <h1 class="logo">eLINE Admin</h1>
          <button class="btn btn-secondary btn-sm" onclick="location.href='/'">
            Customer View
          </button>
        </header>
        <div id="admin-dashboard"></div>
      </div>
    `;
    
    this.updateAdminDashboard();
    
    // Subscribe to updates
    state.subscribe(() => this.updateAdminDashboard());
    
    // Refresh every 5 seconds
    setInterval(() => this.updateAdminDashboard(), 5000);
  },
  
  async updateAdminDashboard() {
    const dashboard = document.getElementById('admin-dashboard');
    if (!dashboard) return;
    
    const queue = await api.getQueue();
    const pending = queue.filter(q => q.status === 'pending').length;
    const active = queue.filter(q => q.status === 'active').length;
    const serving = queue.filter(q => q.status === 'serving').length;
    const totalWait = queue.filter(q => q.status !== 'completed')
      .reduce((sum, q) => sum + q.serviceDuration, 0);
    
    dashboard.innerHTML = `
      <div class="dashboard-grid fade-in">
        <div class="stat-card">
          <div class="stat-value">${pending}</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${active}</div>
          <div class="stat-label">In Queue</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${serving}</div>
          <div class="stat-label">Being Served</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalWait}</div>
          <div class="stat-label">Total Wait (min)</div>
        </div>
      </div>
      
      <div class="glass-card">
        <h2 style="font-size: 24px; margin-bottom: 24px;">Queue Management</h2>
        <div style="overflow-x: auto;">
          <table class="queue-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="queue-tbody"></tbody>
          </table>
        </div>
      </div>
    `;
    
    const tbody = document.getElementById('queue-tbody');
    queue.filter(q => q.status !== 'completed').forEach(customer => {
      const service = state.services.find(s => s.id === customer.serviceId);
      const row = document.createElement('tr');
      
      let statusBadge = '';
      let actions = '';
      
      if (customer.status === 'pending') {
        statusBadge = '<span class="badge badge-pending">Pending</span>';
        actions = `
          <button class="btn btn-success btn-sm" onclick="window.approveCustomer(${customer.id})">
            Approve
          </button>
          <button class="btn btn-danger btn-sm" onclick="window.removeCustomer(${customer.id})">
            Reject
          </button>
        `;
      } else if (customer.status === 'active') {
        statusBadge = '<span class="badge badge-active">Active</span>';
        actions = `
          <button class="btn btn-primary btn-sm" onclick="window.startService(${customer.id})">
            Start
          </button>
          <button class="btn btn-danger btn-sm" onclick="window.removeCustomer(${customer.id})">
            Remove
          </button>
        `;
      } else if (customer.status === 'serving') {
        statusBadge = '<span class="badge badge-serving">Serving</span>';
        actions = `
          <button class="btn btn-success btn-sm" onclick="window.completeService(${customer.id})">
            Complete
          </button>
        `;
      }
      
      row.innerHTML = `
        <td><strong>#${customer.token}</strong></td>
        <td>${customer.name}</td>
        <td>${customer.phone}</td>
        <td>${service?.icon} ${service?.name}</td>
        <td>${statusBadge}</td>
        <td><div class="action-buttons">${actions}</div></td>
      `;
      
      tbody.appendChild(row);
    });
    
    // Attach global functions for actions
    window.approveCustomer = async (id) => {
      await api.approveCustomer(id);
      this.updateAdminDashboard();
    };
    
    window.startService = async (id) => {
      await api.startService(id);
      this.updateAdminDashboard();
    };
    
    window.completeService = async (id) => {
      await api.completeService(id);
      this.updateAdminDashboard();
    };
    
    window.removeCustomer = async (id) => {
      if (confirm('Remove this customer from queue?')) {
        await api.removeCustomer(id);
        this.updateAdminDashboard();
      }
    };
  }
};
