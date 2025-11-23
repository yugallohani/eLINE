// Admin Dashboard Module
export const adminDashboard = {
  token: null,
  admin: null,
  currentView: 'dashboard',
  
  async init(app) {
    // Check if logged in
    this.token = localStorage.getItem('adminToken');
    
    if (!this.token) {
      this.renderLogin(app);
      return;
    }
    
    // Verify token and load dashboard
    try {
      await this.loadDashboard(app);
    } catch (error) {
      localStorage.removeItem('adminToken');
      this.renderLogin(app);
    }
  },
  
  renderLogin(app) {
    app.innerHTML = `
      <div class="bg-animated"></div>
      <div class="landing-page">
        <div class="landing-container">
          <div class="login-page">
            <div class="login-card glass-card">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 class="logo" style="font-size: 48px; margin-bottom: 8px;">eLINE</h1>
                <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Super Admin Portal</h2>
                <p style="color: var(--text-secondary);">Manage platform and verify shop applications</p>
              </div>
              
              <form id="admin-login-form" class="login-form">
                <div class="input-group">
                  <label class="input-label">Email Address</label>
                  <input type="email" class="input" name="email" placeholder="admin@eline.app" required autofocus>
                </div>
                
                <div class="input-group">
                  <label class="input-label">Password</label>
                  <input type="password" class="input" name="password" placeholder="Enter your password" required>
                </div>
                
                <div id="login-error" style="display: none; color: var(--error); margin-bottom: 16px; font-size: 14px;"></div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 24px;" id="login-btn">
                  🔐 Login to Admin Panel
                </button>
              </form>
              
              <div style="text-align: center; margin-top: 24px;">
                <a href="/" style="color: var(--text-secondary); text-decoration: none; font-size: 14px;">
                  ← Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('admin-login-form').onsubmit = async (e) => {
      e.preventDefault();
      await this.handleLogin(e.target, app);
    };
  },
  
  async handleLogin(form, app) {
    const btn = document.getElementById('login-btn');
    const errorDiv = document.getElementById('login-error');
    const formData = new FormData(form);
    
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; margin: 0 auto;"></div>';
    errorDiv.style.display = 'none';
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      this.token = data.token;
      this.admin = data.admin;
      localStorage.setItem('adminToken', data.token);
      
      await this.loadDashboard(app);
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = '🔐 Login to Admin Panel';
    }
  },
  
  async loadDashboard(app) {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load dashboard');
      }
      
      const data = await response.json();
      this.renderDashboard(app, data);
    } catch (error) {
      console.error('Dashboard load error:', error);
      throw error;
    }
  },
  
  renderDashboard(app, data) {
    app.innerHTML = `
      <div class="bg-animated"></div>
      <div class="admin-container">
        <!-- Sidebar -->
        <div class="admin-sidebar">
          <div class="admin-logo">
            <h1 class="logo">eLINE</h1>
            <p style="font-size: 12px; color: var(--text-tertiary);">Admin Portal</p>
          </div>
          
          <nav class="admin-nav">
            <a href="#" class="admin-nav-item active" data-view="dashboard">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
              </svg>
              Dashboard
            </a>
            <a href="#" class="admin-nav-item" data-view="applications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Applications
              ${data.stats.pendingApplications > 0 ? `<span class="badge badge-warning">${data.stats.pendingApplications}</span>` : ''}
            </a>
            <a href="#" class="admin-nav-item" data-view="shops">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V9Z" stroke="currentColor" stroke-width="2"/>
                <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2"/>
              </svg>
              Shops
            </a>
            <a href="#" class="admin-nav-item" data-view="analytics">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 3V21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Analytics
            </a>
          </nav>
          
          <div class="admin-user">
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 600; font-size: 14px;">${this.admin?.name || 'Admin'}</div>
              <div style="font-size: 12px; color: var(--text-tertiary);">${this.admin?.email || ''}</div>
            </div>
            <button class="btn btn-secondary btn-sm" id="logout-btn" style="width: 100%;">
              Logout
            </button>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="admin-main">
          <div id="admin-content">
            ${this.renderDashboardView(data)}
          </div>
        </div>
      </div>
    `;
    
    // Attach event listeners
    this.attachDashboardListeners(app);
  },
  
  renderDashboardView(data) {
    return `
      <div class="admin-header">
        <h1>Dashboard Overview</h1>
        <p style="color: var(--text-secondary);">Real-time platform analytics and insights</p>
      </div>
      
      <!-- Stats Grid -->
      <div class="admin-stats-grid">
        <div class="admin-stat-card">
          <div class="stat-icon" style="background: rgba(99, 102, 241, 0.1); color: var(--accent-primary);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 9L12 2L21 9V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V9Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">${data.stats.activeShops}</div>
            <div class="stat-label">Active Shops</div>
          </div>
        </div>
        
        <div class="admin-stat-card">
          <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--warning);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">${data.stats.pendingApplications}</div>
            <div class="stat-label">Pending Applications</div>
          </div>
        </div>
        
        <div class="admin-stat-card">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" stroke-width="2"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">${data.stats.todayCustomers}</div>
            <div class="stat-label">Customers Today</div>
          </div>
        </div>
        
        <div class="admin-stat-card">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">₹${data.stats.todayRevenue}</div>
            <div class="stat-label">Revenue Today</div>
          </div>
        </div>
      </div>
      
      <!-- AI Insights -->
      ${data.aiInsights ? `
        <div class="admin-section">
          <h2 class="admin-section-title">🤖 AI-Powered Insights</h2>
          <div class="ai-insights-card glass-card">
            <p style="white-space: pre-wrap; line-height: 1.8;">${data.aiInsights}</p>
          </div>
        </div>
      ` : ''}
      
      <!-- Recent Activity -->
      <div class="admin-section">
        <h2 class="admin-section-title">Recent Activity</h2>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Shop</th>
                <th>Service</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              ${data.recentActivity.map(activity => `
                <tr>
                  <td><strong>${activity.name}</strong></td>
                  <td>${activity.business?.name || 'N/A'}</td>
                  <td>${activity.service?.name || 'N/A'}</td>
                  <td><span class="badge badge-${activity.status === 'completed' ? 'active' : activity.status === 'serving' ? 'serving' : 'pending'}">${activity.status}</span></td>
                  <td>${new Date(activity.createdAt).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  attachDashboardListeners(app) {
    // Navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.onclick = async (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        
        // Update active state
        document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Load view
        await this.loadView(view);
      };
    });
    
    // Logout
    document.getElementById('logout-btn').onclick = () => {
      localStorage.removeItem('adminToken');
      window.location.href = '/super-admin';
    };
  },
  
  async loadView(view) {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="spinner" style="margin: 48px auto;"></div>';
    
    try {
      switch(view) {
        case 'dashboard':
          const dashData = await this.fetchDashboard();
          content.innerHTML = this.renderDashboardView(dashData);
          break;
        case 'applications':
          await this.renderApplicationsView(content);
          break;
        case 'shops':
          await this.renderShopsView(content);
          break;
        case 'analytics':
          await this.renderAnalyticsView(content);
          break;
      }
    } catch (error) {
      content.innerHTML = `<div style="color: var(--error); padding: 48px; text-align: center;">Failed to load view: ${error.message}</div>`;
    }
  },
  
  async fetchDashboard() {
    const response = await fetch('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  },
  
  async renderApplicationsView(content) {
    const response = await fetch('/api/admin/applications', {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    const applications = await response.json();
    
    content.innerHTML = `
      <div class="admin-header">
        <h1>Shop Applications</h1>
        <p style="color: var(--text-secondary);">Review and approve new shop registrations</p>
      </div>
      
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Shop Name</th>
              <th>Owner</th>
              <th>Location</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${applications.map(app => `
              <tr>
                <td><strong>${app.shopName}</strong></td>
                <td>${app.ownerName}<br><small style="color: var(--text-tertiary);">${app.phone}</small></td>
                <td>${app.city}, ${app.state}</td>
                <td>${new Date(app.submittedAt).toLocaleDateString()}</td>
                <td><span class="badge badge-${app.status === 'pending' ? 'warning' : app.status === 'approved' ? 'active' : 'pending'}">${app.status}</span></td>
                <td>
                  <button class="btn btn-primary btn-sm" onclick="adminDashboard.viewApplication('${app.id}')">
                    Review
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
  
  async viewApplication(id) {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      if (!response.ok) throw new Error('Failed to load application');
      
      const app = await response.json();
      this.showApplicationModal(app);
    } catch (error) {
      alert('Error loading application: ' + error.message);
    }
  },
  
  showApplicationModal(app) {
    // Parse servicesOffered (it's an object, not array)
    const servicesOffered = typeof app.servicesOffered === 'string' 
      ? JSON.parse(app.servicesOffered) 
      : (app.servicesOffered || {});
    
    // Convert services object to array
    const servicesArray = Object.entries(servicesOffered)
      .filter(([_, service]) => service.enabled)
      .map(([name, service]) => ({
        name,
        price: service.price,
        duration: service.duration
      }));
    
    // Parse operating hours
    const hours = typeof app.operatingHours === 'string'
      ? JSON.parse(app.operatingHours)
      : (app.operatingHours || {});
    
    // Check which documents are available
    const documents = [
      { name: 'Aadhaar Card', url: app.aadhaarUrl, key: 'aadhaar' },
      { name: 'PAN Card', url: app.panUrl, key: 'pan' },
      { name: 'Shop License', url: app.shopLicenseUrl, key: 'license' },
      { name: 'GST Certificate', url: app.gstCertUrl, key: 'gst' },
      { name: 'Business Registration', url: app.businessRegUrl, key: 'business' }
    ].filter(doc => doc.url && doc.url.trim() !== '');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 900px;">
        <div class="modal-header">
          <h2>Application Review</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <!-- Shop Information -->
          <div class="review-section">
            <h3 style="margin-bottom: 16px; color: var(--accent-primary);">🏪 Shop Information</h3>
            <div class="review-grid">
              <div class="review-item">
                <label>Shop Name</label>
                <div class="review-value">${app.shopName}</div>
              </div>
              <div class="review-item">
                <label>Number of Barbers</label>
                <div class="review-value">${app.numberOfBarbers}</div>
              </div>
              <div class="review-item" style="grid-column: 1 / -1;">
                <label>Full Address</label>
                <div class="review-value">${app.address}${app.area ? ', ' + app.area : ''}, ${app.city}, ${app.state} ${app.pincode}</div>
              </div>
            </div>
          </div>
          
          <!-- Owner Information -->
          <div class="review-section">
            <h3 style="margin-bottom: 16px; color: var(--accent-primary);">👤 Owner Information</h3>
            <div class="review-grid">
              <div class="review-item">
                <label>Owner Name</label>
                <div class="review-value">${app.ownerName}</div>
              </div>
              <div class="review-item">
                <label>Phone Number</label>
                <div class="review-value">${app.phone}</div>
              </div>
              <div class="review-item">
                <label>Email</label>
                <div class="review-value">${app.email || 'Not provided'}</div>
              </div>
            </div>
          </div>
          
          <!-- Services -->
          <div class="review-section">
            <h3 style="margin-bottom: 16px; color: var(--accent-primary);">✂️ Services Offered</h3>
            ${servicesArray.length > 0 ? `
              <div class="services-list">
                ${servicesArray.map(service => `
                  <div class="service-item" style="display: flex; justify-content: space-between; padding: 12px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px;">
                    <div>
                      <strong>${service.name}</strong>
                      <div style="font-size: 12px; color: var(--text-tertiary);">${service.duration} minutes</div>
                    </div>
                    <div style="font-weight: 600; color: var(--accent-primary);">₹${service.price}</div>
                  </div>
                `).join('')}
              </div>
            ` : '<p style="color: var(--text-secondary);">No services selected</p>'}
          </div>
          
          <!-- Operating Hours -->
          <div class="review-section">
            <h3 style="margin-bottom: 16px; color: var(--accent-primary);">🕐 Operating Hours</h3>
            <div class="review-grid">
              <div class="review-item">
                <label>Opening Time</label>
                <div class="review-value">${hours.opening || 'Not specified'}</div>
              </div>
              <div class="review-item">
                <label>Closing Time</label>
                <div class="review-value">${hours.closing || 'Not specified'}</div>
              </div>
            </div>
          </div>
          
          <!-- Documents -->
          ${documents.length > 0 ? `
            <div class="review-section">
              <h3 style="margin-bottom: 16px; color: var(--accent-primary);">📄 Uploaded Documents</h3>
              <div class="documents-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                ${documents.map(doc => `
                  <a href="${doc.url}" target="_blank" download class="document-card" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; text-decoration: none; color: var(--text-primary); transition: all 0.2s;">
                    <div style="font-size: 24px;">📎</div>
                    <div style="flex: 1;">
                      <div style="font-weight: 600; font-size: 14px;">${doc.name}</div>
                      <div style="font-size: 12px; color: var(--accent-primary);">Download</div>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="review-section">
              <h3 style="margin-bottom: 16px; color: var(--accent-primary);">📄 Uploaded Documents</h3>
              <p style="color: var(--text-secondary);">No documents uploaded</p>
            </div>
          `}
          
          <!-- Status -->
          <div class="review-section">
            <h3 style="margin-bottom: 16px; color: var(--accent-primary);">📊 Application Status</h3>
            <div class="review-item">
              <label>Current Status</label>
              <div><span class="badge badge-${app.status === 'pending' ? 'warning' : app.status === 'approved' ? 'active' : 'error'}">${app.status}</span></div>
            </div>
            <div class="review-item" style="margin-top: 12px;">
              <label>Submitted On</label>
              <div class="review-value">${new Date(app.submittedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer" style="display: flex; gap: 12px; justify-content: flex-end;">
          ${app.status === 'pending' ? `
            <button class="btn btn-secondary" onclick="adminDashboard.rejectApplication('${app.id}')">
              ❌ Reject
            </button>
            <button class="btn btn-primary" onclick="adminDashboard.approveApplication('${app.id}')">
              ✅ Approve Application
            </button>
          ` : `
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              Close
            </button>
          `}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  },
  
  async approveApplication(id) {
    if (!confirm('Are you sure you want to approve this application? The shop will be activated immediately.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/applications/${id}/approve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to approve application');
      
      const data = await response.json();
      
      // Close the review modal
      document.querySelector('.modal-overlay')?.remove();
      
      // Show credentials modal
      this.showCredentialsModal(data);
      
      // Refresh applications list
      await this.loadView('applications');
    } catch (error) {
      alert('Error approving application: ' + error.message);
    }
  },
  
  showCredentialsModal(data) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2>✅ Application Approved!</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        
        <div class="modal-body">
          <div style="text-align: center; padding: 24px; background: var(--bg-secondary); border-radius: 12px; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
            <h3 style="margin-bottom: 8px;">Shop Activated Successfully!</h3>
            <p style="color: var(--text-secondary);">Login credentials have been generated and sent via SMS</p>
          </div>
          
          <div class="review-section">
            <h3 style="margin-bottom: 16px; color: var(--accent-primary);">🔐 Login Credentials</h3>
            
            <div class="credentials-box" style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin-bottom: 16px;">
              <div style="margin-bottom: 16px;">
                <label style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary); display: block; margin-bottom: 8px;">Barber Code</label>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <code style="flex: 1; background: var(--bg-primary); padding: 12px; border-radius: 8px; font-size: 18px; font-weight: 600; color: var(--accent-primary);">${data.barberCode}</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${data.barberCode}'); this.innerHTML='✓ Copied!'">
                    📋 Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary); display: block; margin-bottom: 8px;">Temporary Password</label>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <code style="flex: 1; background: var(--bg-primary); padding: 12px; border-radius: 8px; font-size: 18px; font-weight: 600; color: var(--accent-primary);">${data.tempPassword}</code>
                  <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${data.tempPassword}'); this.innerHTML='✓ Copied!'">
                    📋 Copy
                  </button>
                </div>
              </div>
            </div>
            
            <div style="padding: 16px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; border-left: 4px solid var(--accent-primary);">
              <div style="font-weight: 600; margin-bottom: 8px;">📱 SMS Notification Sent</div>
              <p style="font-size: 14px; color: var(--text-secondary); margin: 0;">
                The shop owner has been notified via SMS with their login credentials and can now access the barber dashboard.
              </p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
            Done
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  },
  
  async rejectApplication(id) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      const response = await fetch(`/api/admin/applications/${id}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) throw new Error('Failed to reject application');
      
      document.querySelector('.modal-overlay')?.remove();
      alert('Application rejected.');
      await this.loadView('applications');
    } catch (error) {
      alert('Error rejecting application: ' + error.message);
    }
  },
  
  async renderShopsView(content) {
    const response = await fetch('/api/admin/shops', {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    const shops = await response.json();
    
    content.innerHTML = `
      <div class="admin-header">
        <h1>All Shops</h1>
        <p style="color: var(--text-secondary);">Manage active and inactive shops</p>
      </div>
      
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Shop Name</th>
              <th>Barber Code</th>
              <th>Location</th>
              <th>Customers</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${shops.map(shop => `
              <tr>
                <td><strong>${shop.name}</strong></td>
                <td><code>${shop.barberCode}</code></td>
                <td>${shop.city}, ${shop.state}</td>
                <td>${shop._count.customers}</td>
                <td><span class="badge badge-${shop.status === 'approved' ? 'active' : 'pending'}">${shop.status}</span></td>
                <td>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" onclick="adminDashboard.viewShop('${shop.id}')">
                      👁️ View
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="adminDashboard.deleteShop('${shop.id}', '${shop.name}')">
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
  
  async viewShop(id) {
    try {
      const response = await fetch(`/api/admin/shops/${id}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      if (!response.ok) throw new Error('Failed to load shop');
      
      const shop = await response.json();
      this.showShopModal(shop);
    } catch (error) {
      alert('Error loading shop: ' + error.message);
    }
  },
  
  showShopModal(shop) {
    // Parse operating hours
    const hours = typeof shop.operatingHours === 'string'
      ? JSON.parse(shop.operatingHours)
      : (shop.operatingHours || {});
    
    // Check which documents are available
    const documents = [
      { name: 'Aadhaar Card', url: shop.aadhaarUrl },
      { name: 'PAN Card', url: shop.panUrl },
      { name: 'Shop License', url: shop.shopLicenseUrl },
      { name: 'GST Certificate', url: shop.gstCertUrl },
      { name: 'Business Registration', url: shop.businessRegUrl }
    ].filter(doc => doc.url && doc.url.trim() !== '');
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 900px;">
        <div class="modal-header">
          <h2>Shop Details</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <!-- Shop Information -->
          <div class="review-section">
            <h3 style="margin-bottom: 16px; color: var(--accent-primary);">🏪 Shop Information</h3>
            <div class="review-grid">
              <div class="review-item">
                <label>Shop Name</label>
                <div class="review-value">${shop.name}</div>
              </div>
              <div class="review-item">
                <label>Barber Code</label>
                <div class="review-value"><code>${shop.barberCode}</code></div>
              </div>
              <div class="review-item">
                <label>Number of Barbers</label>
                <div class="review-value">${shop.numberOfBarbers || 'N/A'}</div>
              </div>
              <div class="review-item" style="grid-column: 1 / -1;">
                <label>Full Address</label>
                <div class="review-value">${shop.address}${shop.area ? ', ' + shop.area : ''}, ${shop.city}, ${shop.state} ${shop.pincode}</div>
              </div>
            </div>
          </div>
          
          <!-- Owner Information -->
          <div class="review-section">
            <h3 style="margin-bottom: 16px; color: var(--accent-primary);">👤 Owner Information</h3>
            <div class="review-grid">
              <div class="review-item">
                <label>Owner Name</label>
                <div class="review-value">${shop.ownerName}</div>
              </div>
              <div class="review-item">
                <label>Phone Number</label>
                <div class="review-value">${shop.phone}</div>
              </div>
              <div class="review-item">
                <label>Email</label>
                <div class="review-value">${shop.email || 'Not provided'}</div>
              </div>
            </div>
          </div>
          
          <!-- Services -->
          <div class="review-section">
            <h3 style="margin-bottom: 16px; color: var(--accent-primary);">✂️ Services</h3>
            ${shop.services && shop.services.length > 0 ? `
              <div class="services-list">
                ${shop.services.map(service => `
                  <div class="service-item" style="display: flex; justify-content: space-between; padding: 12px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 8px;">
                    <div>
                      <strong>${service.name}</strong>
                      <div style="font-size: 12px; color: var(--text-tertiary);">${service.duration} minutes</div>
                    </div>
                    <div style="font-weight: 600; color: var(--accent-primary);">₹${service.price}</div>
                  </div>
                `).join('')}
              </div>
            ` : '<p style="color: var(--text-secondary);">No services configured</p>'}
          </div>
          
          <!-- Operating Hours -->
          <div class="review-section">
            <h3 style="margin-bottom: 16px; color: var(--accent-primary);">🕐 Operating Hours</h3>
            <div class="review-grid">
              <div class="review-item">
                <label>Opening Time</label>
                <div class="review-value">${hours.opening || 'Not specified'}</div>
              </div>
              <div class="review-item">
                <label>Closing Time</label>
                <div class="review-value">${hours.closing || 'Not specified'}</div>
              </div>
            </div>
          </div>
          
          <!-- Documents -->
          ${documents.length > 0 ? `
            <div class="review-section">
              <h3 style="margin-bottom: 16px; color: var(--accent-primary);">📄 Uploaded Documents</h3>
              <div class="documents-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
                ${documents.map(doc => `
                  <a href="${doc.url}" target="_blank" download class="document-card" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; text-decoration: none; color: var(--text-primary); transition: all 0.2s;">
                    <div style="font-size: 24px;">📎</div>
                    <div style="flex: 1;">
                      <div style="font-weight: 600; font-size: 14px;">${doc.name}</div>
                      <div style="font-size: 12px; color: var(--accent-primary);">Download</div>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <!-- Status -->
          <div class="review-section">
            <h3 style="margin-bottom: 16px; color: var(--accent-primary);">📊 Status</h3>
            <div class="review-item">
              <label>Current Status</label>
              <div><span class="badge badge-${shop.status === 'approved' ? 'active' : 'pending'}">${shop.status}</span></div>
            </div>
            <div class="review-item" style="margin-top: 12px;">
              <label>Created On</label>
              <div class="review-value">${new Date(shop.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  },
  
  async deleteShop(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone and will remove all associated data including customers and services.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/shops/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete shop');
      
      alert('✅ Shop deleted successfully');
      await this.loadView('shops');
    } catch (error) {
      alert('Error deleting shop: ' + error.message);
    }
  },
  
  async renderAnalyticsView(content) {
    content.innerHTML = '<div class="spinner" style="margin: 48px auto;"></div>';
    
    try {
      // Fetch all analytics data
      const [statsRes, analyticsRes, shopsRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers: { 'Authorization': `Bearer ${this.token}` } }),
        fetch('/api/admin/analytics?days=30', { headers: { 'Authorization': `Bearer ${this.token}` } }),
        fetch('/api/admin/shops', { headers: { 'Authorization': `Bearer ${this.token}` } })
      ]);
      
      const stats = await statsRes.json();
      const analytics = await analyticsRes.json();
      const shops = await shopsRes.json();
      
      // Calculate metrics
      const totalCustomers = analytics.reduce((sum, day) => sum + (day.totalCustomers || 0), 0);
      const totalRevenue = analytics.reduce((sum, day) => sum + (day.revenue || 0), 0);
      const avgWaitTime = analytics.reduce((sum, day) => sum + (day.avgWaitTime || 0), 0) / analytics.length || 0;
      
      // Get last 7 days for chart
      const last7Days = analytics.slice(0, 7).reverse();
      const maxCustomers = Math.max(...last7Days.map(d => d.totalCustomers || 0), 1);
      
      content.innerHTML = `
        <div class="admin-header">
          <h1>Platform Analytics</h1>
          <p style="color: var(--text-secondary);">Real-time performance metrics and insights</p>
        </div>
        
        <!-- Key Metrics Grid -->
        <div class="analytics-metrics-grid">
          <div class="analytics-metric-card">
            <div class="metric-icon" style="background: rgba(99, 102, 241, 0.1); color: var(--accent-primary);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M23 21V19C23 17.3431 21.6569 16 20 16" stroke="currentColor" stroke-width="2"/>
                <path d="M16 3.12988C17.1652 3.60544 18 4.7168 18 6C18 7.2832 17.1652 8.39456 16 8.87012" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div>
              <div class="metric-value">${totalCustomers}</div>
              <div class="metric-label">Total Customers (30d)</div>
            </div>
          </div>
          
          <div class="analytics-metric-card">
            <div class="metric-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <div class="metric-value">₹${totalRevenue.toLocaleString()}</div>
              <div class="metric-label">Total Revenue (30d)</div>
            </div>
          </div>
          
          <div class="analytics-metric-card">
            <div class="metric-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--warning);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <div class="metric-value">${Math.round(avgWaitTime)} min</div>
              <div class="metric-label">Avg Wait Time</div>
            </div>
          </div>
          
          <div class="analytics-metric-card">
            <div class="metric-icon" style="background: rgba(139, 92, 246, 0.1); color: var(--accent-secondary);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V9Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div>
              <div class="metric-value">${shops.length}</div>
              <div class="metric-label">Active Shops</div>
            </div>
          </div>
        </div>
        
        <!-- Charts Section -->
        <div class="admin-section">
          <h2 class="admin-section-title">📊 Customer Trends (Last 7 Days)</h2>
          <div class="chart-container">
            ${last7Days.length > 0 ? `
              <div class="bar-chart">
                ${last7Days.map(day => {
                  const customers = day.totalCustomers || 0;
                  const height = maxCustomers > 0 ? (customers / maxCustomers) * 100 : 0;
                  const displayHeight = height > 0 ? Math.max(height, 10) : 5; // Minimum 5% height for visibility
                  const date = new Date(day.date);
                  return `
                    <div class="bar-item">
                      <div class="bar-value">${customers}</div>
                      <div class="bar" style="height: ${displayHeight}%; ${customers === 0 ? 'opacity: 0.3;' : ''}">
                        <div class="bar-fill"></div>
                      </div>
                      <div class="bar-label">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <p>No data available yet. Data will appear as customers join queues.</p>
              </div>
            `}
          </div>
        </div>
        
        <!-- Top Performing Shops -->
        <div class="admin-section">
          <h2 class="admin-section-title">🏆 Top Performing Shops</h2>
          <div class="top-shops-grid">
            ${shops.slice(0, 6).map((shop, index) => `
              <div class="top-shop-card">
                <div class="shop-rank">#${index + 1}</div>
                <div class="shop-details">
                  <h4>${shop.name}</h4>
                  <p>${shop.city}, ${shop.state}</p>
                </div>
                <div class="shop-stats-mini">
                  <div class="stat-mini">
                    <span class="stat-mini-value">${shop._count?.customers || 0}</span>
                    <span class="stat-mini-label">Customers</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Real-time Stats -->
        <div class="admin-section">
          <h2 class="admin-section-title">⚡ Real-Time Statistics</h2>
          <div class="realtime-stats-grid">
            <div class="realtime-stat">
              <div class="realtime-stat-icon">👥</div>
              <div class="realtime-stat-value">${stats.stats.todayCustomers}</div>
              <div class="realtime-stat-label">Customers Today</div>
            </div>
            <div class="realtime-stat">
              <div class="realtime-stat-icon">💰</div>
              <div class="realtime-stat-value">₹${stats.stats.todayRevenue}</div>
              <div class="realtime-stat-label">Revenue Today</div>
            </div>
            <div class="realtime-stat">
              <div class="realtime-stat-icon">⏳</div>
              <div class="realtime-stat-value">${stats.stats.pendingApplications}</div>
              <div class="realtime-stat-label">Pending Reviews</div>
            </div>
            <div class="realtime-stat">
              <div class="realtime-stat-icon">✅</div>
              <div class="realtime-stat-value">${stats.stats.activeShops}</div>
              <div class="realtime-stat-label">Active Shops</div>
            </div>
          </div>
        </div>
      `;
      
      // Auto-refresh every 30 seconds
      setTimeout(() => {
        if (document.querySelector('.admin-nav-item.active')?.dataset.view === 'analytics') {
          this.renderAnalyticsView(content);
        }
      }, 30000);
      
    } catch (error) {
      console.error('Analytics error:', error);
      content.innerHTML = `
        <div style="text-align: center; padding: 48px;">
          <p style="color: var(--error);">Failed to load analytics</p>
          <button class="btn btn-primary" onclick="adminDashboard.loadView('analytics')">Retry</button>
        </div>
      `;
    }
  }
};

// Make it globally accessible
window.adminDashboard = adminDashboard;
