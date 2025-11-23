import { state, api } from './state.js';

export const barberDashboard = {
  business: null,
  token: null,
  
  async init(app) {
    // Check authentication
    this.token = localStorage.getItem('barber_token');
    const businessData = localStorage.getItem('barber_business');
    
    if (!this.token || !businessData) {
      window.location.href = '/barber-login';
      return;
    }
    
    this.business = JSON.parse(businessData);
    
    // Render dashboard
    this.render(app);
    
    // Load initial data
    await this.loadDashboardData();
    
    // Subscribe to updates
    state.subscribe(() => this.updateQueueDisplay());
    
    // Auto-refresh every 10 seconds
    setInterval(() => this.loadDashboardData(), 10000);
  },
  
  render(app) {
    app.innerHTML = `
      <div class="bg-animated"></div>
      <div class="container">
        <header class="header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 class="logo">💈 ${this.business.name}</h1>
            <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
              Barber Code: <strong>${this.business.barberCode}</strong>
            </p>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <button class="btn btn-secondary btn-sm" onclick="window.location.href='/?business=${this.business.id}'">
              👁️ Customer View
            </button>
            <button class="btn btn-secondary btn-sm" onclick="barberDashboard.logout()">
              🚪 Logout
            </button>
          </div>
        </header>
        
        <!-- Stats Dashboard -->
        <div class="dashboard-grid fade-in" id="stats-grid">
          <div class="stat-card">
            <div class="stat-value" id="stat-pending">-</div>
            <div class="stat-label">Pending Approval</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="stat-active">-</div>
            <div class="stat-label">In Queue</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="stat-serving">-</div>
            <div class="stat-label">Being Served</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="stat-wait">-</div>
            <div class="stat-label">Total Wait (min)</div>
          </div>
        </div>
        
        <!-- Tabs -->
        <div class="glass-card" style="margin-top: 24px;">
          <div class="tabs">
            <button class="tab-btn active" onclick="barberDashboard.switchTab('queue')" id="tab-queue">
              📋 Active Queue
            </button>
            <button class="tab-btn" onclick="barberDashboard.switchTab('services')" id="tab-services">
              ⚙️ Services
            </button>
            <button class="tab-btn" onclick="barberDashboard.switchTab('history')" id="tab-history">
              📜 History
            </button>
          </div>
          
          <!-- Queue Tab -->
          <div id="queue-tab" class="tab-content active">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
              <h2 style="font-size: 24px; margin: 0;">Queue Management</h2>
              <div style="display: flex; gap: 12px;">
                <button class="btn btn-secondary btn-sm" onclick="barberDashboard.refreshQueue()">
                  🔄 Refresh
                </button>
                <button class="btn btn-primary btn-sm" onclick="barberDashboard.showQRCode()">
                  📱 Show QR Code
                </button>
              </div>
            </div>
            
            <div id="queue-container">
              <div style="text-align: center; padding: 40px;">
                <div class="spinner"></div>
                <p style="color: var(--text-secondary); margin-top: 16px;">Loading queue...</p>
              </div>
            </div>
          </div>
          
          <!-- Services Tab -->
          <div id="services-tab" class="tab-content" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
              <h2 style="font-size: 24px; margin: 0;">Manage Services</h2>
              <button class="btn btn-primary btn-sm" onclick="barberDashboard.saveServices()">
                💾 Save Changes
              </button>
            </div>
            
            <div style="background: var(--bg-tertiary); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                💡 <strong>Select the services you want to offer.</strong> Only selected services will be visible to customers when they join the queue.
              </p>
            </div>
            
            <div id="services-container">
              <div style="text-align: center; padding: 40px;">
                <div class="spinner"></div>
                <p style="color: var(--text-secondary); margin-top: 16px;">Loading services...</p>
              </div>
            </div>
          </div>
          
          <!-- History Tab -->
          <div id="history-tab" class="tab-content" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
              <h2 style="font-size: 24px; margin: 0;">Customer History</h2>
              <div style="display: flex; gap: 12px;">
                <select id="history-filter" class="input" style="width: auto; padding: 8px 12px;" onchange="barberDashboard.loadHistory()">
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
                <button class="btn btn-secondary btn-sm" onclick="barberDashboard.loadHistory()">
                  🔄 Refresh
                </button>
                <button class="btn btn-danger btn-sm" onclick="barberDashboard.clearHistory()">
                  🗑️ Clear History
                </button>
              </div>
            </div>
            
            <div id="history-container">
              <div style="text-align: center; padding: 40px;">
                <div class="spinner"></div>
                <p style="color: var(--text-secondary); margin-top: 16px;">Loading history...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- QR Code Modal -->
      <div id="qr-modal" class="modal" style="display: none;">
        <div class="modal-content glass-card" style="max-width: 500px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h3 style="font-size: 24px; margin: 0;">Customer QR Code</h3>
            <button class="btn btn-secondary btn-sm" onclick="barberDashboard.closeQRModal()">✕</button>
          </div>
          <div id="qr-code-container" style="text-align: center;">
            <div class="spinner"></div>
          </div>
          <p style="text-align: center; color: var(--text-secondary); margin-top: 16px; font-size: 14px;">
            Customers can scan this QR code to join your queue
          </p>
        </div>
      </div>
    `;
  },
  
  async loadDashboardData() {
    try {
      const queue = await this.fetchQueue();
      this.updateStats(queue);
      this.updateQueueDisplay(queue);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      if (error.message.includes('401') || error.message.includes('Invalid token')) {
        this.logout();
      }
    }
  },
  
  async fetchQueue() {
    const response = await fetch(`/api/queue?businessId=${this.business.id}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  },
  
  updateStats(queue) {
    const pending = queue.filter(q => q.status === 'pending').length;
    const active = queue.filter(q => q.status === 'active').length;
    const serving = queue.filter(q => q.status === 'serving').length;
    const totalWait = queue
      .filter(q => q.status !== 'completed')
      .reduce((sum, q) => sum + (q.service?.duration || 0), 0);
    
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-active').textContent = active;
    document.getElementById('stat-serving').textContent = serving;
    document.getElementById('stat-wait').textContent = totalWait;
  },
  
  updateQueueDisplay(queue = null) {
    const container = document.getElementById('queue-container');
    if (!container) return;
    
    if (!queue) {
      // Use cached queue if available
      queue = state.queue || [];
    }
    
    // Filter out completed and cancelled customers
    const activeQueue = queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled');
    
    if (activeQueue.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
          <h3 style="font-size: 24px; margin-bottom: 8px;">No customers in queue</h3>
          <p style="color: var(--text-secondary);">
            Share your QR code with customers to get started
          </p>
          <button class="btn btn-primary" onclick="barberDashboard.showQRCode()" style="margin-top: 24px;">
            📱 Show QR Code
          </button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div style="overflow-x: auto;">
        <table class="queue-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Service</th>
              <th>Wait Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="queue-tbody"></tbody>
        </table>
      </div>
    `;
    
    const tbody = document.getElementById('queue-tbody');
    
    activeQueue.forEach((customer, index) => {
      const service = customer.service || {};
      const row = document.createElement('tr');
      
      // Calculate estimated wait time based on queue position
      let estimatedWait = 0;
      if (customer.status === 'pending') {
        // Pending customers: wait for all active + serving customers
        estimatedWait = activeQueue
          .filter(c => c.status === 'active' || c.status === 'serving')
          .reduce((sum, c) => sum + (c.service?.duration || 0), 0);
      } else if (customer.status === 'active') {
        // Active customers: wait for serving + customers ahead in queue
        const servingTime = activeQueue
          .filter(c => c.status === 'serving')
          .reduce((sum, c) => sum + (c.service?.duration || 0), 0);
        const aheadTime = activeQueue
          .filter(c => c.status === 'active' && new Date(c.joinedAt) < new Date(customer.joinedAt))
          .reduce((sum, c) => sum + (c.service?.duration || 0), 0);
        estimatedWait = servingTime + aheadTime;
      } else if (customer.status === 'serving') {
        // Currently being served
        estimatedWait = 0;
      }
      
      const waitMinutes = Math.round(estimatedWait);
      
      let statusBadge = '';
      let actions = '';
      
      if (customer.status === 'pending') {
        statusBadge = '<span class="badge badge-pending">⏳ Pending</span>';
        actions = `
          <button class="btn btn-success btn-sm" onclick="barberDashboard.approveCustomer('${customer.id}')">
            ✓ Approve
          </button>
          <button class="btn btn-danger btn-sm" onclick="barberDashboard.rejectCustomer('${customer.id}')">
            ✕ Reject
          </button>
        `;
      } else if (customer.status === 'active') {
        statusBadge = '<span class="badge badge-active">✓ Active</span>';
        actions = `
          <button class="btn btn-primary btn-sm" onclick="barberDashboard.startService('${customer.id}')">
            ▶ Start Service
          </button>
          <button class="btn btn-danger btn-sm" onclick="barberDashboard.removeCustomer('${customer.id}')">
            🗑️ Remove
          </button>
        `;
      } else if (customer.status === 'serving') {
        statusBadge = '<span class="badge badge-serving pulse">💈 Serving</span>';
        actions = `
          <button class="btn btn-success btn-sm" onclick="barberDashboard.completeService('${customer.id}')">
            ✓ Complete
          </button>
        `;
      }
      
      row.innerHTML = `
        <td><strong style="font-size: 18px; color: var(--accent-primary);">#${customer.token}</strong></td>
        <td><strong>${customer.name}</strong></td>
        <td style="color: var(--text-secondary); font-size: 14px;">${customer.phone}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">${service.icon || '✂️'}</span>
            <div>
              <div style="font-weight: 500;">${service.name || 'Unknown'}</div>
              <div style="font-size: 12px; color: var(--text-secondary);">${service.duration || 0} min</div>
            </div>
          </div>
        </td>
        <td>
          <div style="color: ${customer.status === 'serving' ? 'var(--success)' : waitMinutes > 30 ? 'var(--error)' : 'var(--text-secondary)'}; font-weight: ${customer.status === 'serving' ? '600' : 'normal'};">
            ${customer.status === 'serving' ? '▶ Now' : waitMinutes === 0 ? 'Next' : `~${waitMinutes} min`}
          </div>
        </td>
        <td>${statusBadge}</td>
        <td><div class="action-buttons">${actions}</div></td>
      `;
      
      tbody.appendChild(row);
    });
  },
  
  async approveCustomer(id) {
    try {
      const response = await fetch(`/api/queue/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve customer');
      }
      
      await this.loadDashboardData();
      this.showNotification('✓ Customer approved', 'success');
    } catch (error) {
      console.error('Approve error:', error);
      this.showNotification('❌ Failed to approve customer', 'error');
    }
  },
  
  async startService(id) {
    try {
      const response = await fetch(`/api/queue/${id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to start service');
      }
      
      await this.loadDashboardData();
      this.showNotification('✓ Service started', 'success');
    } catch (error) {
      console.error('Start service error:', error);
      this.showNotification('❌ Failed to start service', 'error');
    }
  },
  
  async completeService(id) {
    try {
      const response = await fetch(`/api/queue/${id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete service');
      }
      
      await this.loadDashboardData();
      this.showNotification('✓ Service completed', 'success');
    } catch (error) {
      console.error('Complete service error:', error);
      this.showNotification('❌ Failed to complete service', 'error');
    }
  },
  
  async removeCustomer(id) {
    if (!confirm('Are you sure you want to remove this customer from the queue?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/queue/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove customer');
      }
      
      await this.loadDashboardData();
      this.showNotification('✓ Customer removed', 'success');
    } catch (error) {
      console.error('Remove error:', error);
      this.showNotification('❌ Failed to remove customer', 'error');
    }
  },
  
  async rejectCustomer(id) {
    if (!confirm('Reject this customer request?')) {
      return;
    }
    
    await this.removeCustomer(id);
  },
  
  async refreshQueue() {
    await this.loadDashboardData();
    this.showNotification('✓ Queue refreshed', 'success');
  },
  
  async showQRCode() {
    const modal = document.getElementById('qr-modal');
    const container = document.getElementById('qr-code-container');
    
    modal.style.display = 'flex';
    container.innerHTML = '<div class="spinner"></div>';
    
    try {
      const response = await fetch(`/api/qr/${this.business.id}`);
      const data = await response.json();
      
      container.innerHTML = `
        <img src="${data.qrCode}" alt="QR Code" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <p style="margin-top: 16px; font-size: 14px; color: var(--text-secondary); word-break: break-all;">
          ${data.url}
        </p>
        <button class="btn btn-primary" onclick="barberDashboard.downloadQR('${data.qrCode}')" style="margin-top: 16px;">
          📥 Download QR Code
        </button>
      `;
    } catch (error) {
      console.error('QR code error:', error);
      container.innerHTML = '<p style="color: var(--error);">Failed to generate QR code</p>';
    }
  },
  
  closeQRModal() {
    document.getElementById('qr-modal').style.display = 'none';
  },
  
  downloadQR(dataUrl) {
    const link = document.createElement('a');
    link.download = `${this.business.name}-qr-code.png`;
    link.href = dataUrl;
    link.click();
  },
  
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--accent-primary)'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },
  
  logout() {
    localStorage.removeItem('barber_token');
    localStorage.removeItem('barber_business');
    window.location.href = '/barber-login';
  },
  
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    document.getElementById(`${tabName}-tab`).style.display = 'block';
    
    // Load data for the tab
    if (tabName === 'history') {
      this.loadHistory();
    } else if (tabName === 'services') {
      this.loadServices();
    }
  },
  
  async loadServices() {
    const container = document.getElementById('services-container');
    
    try {
      const response = await fetch(`/api/barber/services?businessId=${this.business.id}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load services');
      }
      
      const services = await response.json();
      this.displayServices(services);
    } catch (error) {
      console.error('Load services error:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <p style="color: var(--error);">Failed to load services</p>
          <button class="btn btn-primary" onclick="barberDashboard.loadServices()">Try Again</button>
        </div>
      `;
    }
  },
  
  displayServices(services) {
    const container = document.getElementById('services-container');
    
    const serviceTemplates = [
      { name: 'Haircut (Men)', icon: '✂️', price: 150, duration: 25, description: 'Professional men\'s haircut with styling' },
      { name: 'Haircut (Women)', icon: '✂️', price: 300, duration: 40, description: 'Basic women\'s haircut with styling' },
      { name: 'Beard Trim', icon: '🧔', price: 80, duration: 15, description: 'Beard shaping and trimming' },
      { name: 'Hair Spa', icon: '💆', price: 300, duration: 45, description: 'Relaxing hair spa treatment' },
      { name: 'Facial (Basic)', icon: '😊', price: 600, duration: 30, description: 'Basic facial treatment' },
      { name: 'Waxing (Arms/Legs)', icon: '✨', price: 300, duration: 30, description: 'Arms and legs waxing service' }
    ];
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">';
    
    serviceTemplates.forEach(template => {
      const existingService = services.find(s => s.name === template.name);
      const isActive = existingService?.active !== false;
      const currentPrice = existingService?.price || template.price;
      const currentDuration = existingService?.duration || template.duration;
      
      html += `
        <div class="service-card" style="border: 2px solid ${isActive ? 'var(--accent-primary)' : 'var(--glass-border)'}; opacity: ${isActive ? '1' : '0.6'};">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <h3 style="font-size: 18px; margin: 0;">${template.name}</h3>
            <label class="switch">
              <input type="checkbox" 
                     data-service-name="${template.name}" 
                     ${isActive ? 'checked' : ''}
                     onchange="barberDashboard.toggleServicePreview(this)">
              <span class="slider"></span>
            </label>
          </div>
          <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">${template.description}</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="input-group" style="margin: 0;">
              <label class="input-label" style="font-size: 12px; margin-bottom: 4px;">Price (₹)</label>
              <input type="number" 
                     class="input" 
                     data-service-price="${template.name}"
                     value="${currentPrice}" 
                     min="0" 
                     step="10"
                     ${!isActive ? 'disabled' : ''}
                     style="padding: 8px;">
            </div>
            <div class="input-group" style="margin: 0;">
              <label class="input-label" style="font-size: 12px; margin-bottom: 4px;">Duration (min)</label>
              <input type="number" 
                     class="input" 
                     data-service-duration="${template.name}"
                     value="${currentDuration}" 
                     min="5" 
                     step="5"
                     ${!isActive ? 'disabled' : ''}
                     style="padding: 8px;">
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  },
  
  toggleServicePreview(checkbox) {
    const card = checkbox.closest('.service-card');
    const serviceName = checkbox.dataset.serviceName;
    const priceInput = document.querySelector(`[data-service-price="${serviceName}"]`);
    const durationInput = document.querySelector(`[data-service-duration="${serviceName}"]`);
    
    if (checkbox.checked) {
      card.style.border = '2px solid var(--accent-primary)';
      card.style.opacity = '1';
      priceInput.disabled = false;
      durationInput.disabled = false;
    } else {
      card.style.border = '2px solid var(--glass-border)';
      card.style.opacity = '0.6';
      priceInput.disabled = true;
      durationInput.disabled = true;
    }
  },
  
  async saveServices() {
    const checkboxes = document.querySelectorAll('[data-service-name]');
    const servicesData = [];
    
    checkboxes.forEach(cb => {
      if (cb.checked) {
        const serviceName = cb.dataset.serviceName;
        const priceInput = document.querySelector(`[data-service-price="${serviceName}"]`);
        const durationInput = document.querySelector(`[data-service-duration="${serviceName}"]`);
        
        servicesData.push({
          name: serviceName,
          price: parseFloat(priceInput.value) || 0,
          duration: parseInt(durationInput.value) || 0,
          active: true
        });
      }
    });
    
    if (servicesData.length === 0) {
      this.showNotification('⚠️ Please select at least one service', 'error');
      return;
    }
    
    try {
      const response = await fetch(`/api/barber/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessId: this.business.id,
          servicesData: servicesData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save services');
      }
      
      this.showNotification('✓ Services updated successfully', 'success');
      this.loadServices();
    } catch (error) {
      console.error('Save services error:', error);
      this.showNotification('❌ Failed to save services', 'error');
    }
  },
  
  async loadHistory() {
    const container = document.getElementById('history-container');
    const filter = document.getElementById('history-filter').value;
    
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div class="spinner"></div>
        <p style="color: var(--text-secondary); margin-top: 16px;">Loading history...</p>
      </div>
    `;
    
    try {
      const response = await fetch(`/api/barber/history?businessId=${this.business.id}&filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load history');
      }
      
      const history = await response.json();
      this.displayHistory(history);
    } catch (error) {
      console.error('Load history error:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <p style="color: var(--error);">Failed to load history</p>
          <button class="btn btn-primary" onclick="barberDashboard.loadHistory()">Try Again</button>
        </div>
      `;
    }
  },
  
  displayHistory(history) {
    const container = document.getElementById('history-container');
    
    if (history.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 64px; margin-bottom: 16px;">📭</div>
          <h3 style="font-size: 24px; margin-bottom: 8px;">No History Yet</h3>
          <p style="color: var(--text-secondary);">
            Completed and cancelled customers will appear here
          </p>
        </div>
      `;
      return;
    }
    
    // Group by date
    const grouped = {};
    history.forEach(customer => {
      const date = new Date(customer.completedAt || customer.updatedAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(customer);
    });
    
    let html = '';
    Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
      const customers = grouped[date];
      const completed = customers.filter(c => c.status === 'completed').length;
      const cancelled = customers.filter(c => c.status === 'cancelled').length;
      
      html += `
        <div class="history-date-group">
          <div class="history-date-header">
            <h3>${date}</h3>
            <div class="history-stats">
              <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">
                ✓ ${completed} Completed
              </span>
              <span class="badge" style="background: rgba(239, 68, 68, 0.1); color: var(--error);">
                ✕ ${cancelled} Cancelled
              </span>
            </div>
          </div>
          
          <div style="overflow-x: auto;">
            <table class="queue-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Service</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
      `;
      
      customers.forEach(customer => {
        const service = customer.service || {};
        const time = new Date(customer.completedAt || customer.updatedAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        });
        
        const statusBadge = customer.status === 'completed'
          ? '<span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--success);">✓ Completed</span>'
          : '<span class="badge" style="background: rgba(239, 68, 68, 0.1); color: var(--error);">✕ Cancelled</span>';
        
        html += `
          <tr>
            <td><strong>#${customer.token}</strong></td>
            <td>${customer.name}</td>
            <td style="color: var(--text-secondary); font-size: 14px;">${customer.phone}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">${service.icon || '✂️'}</span>
                <span>${service.name || 'Unknown'}</span>
              </div>
            </td>
            <td>${time}</td>
            <td>${statusBadge}</td>
          </tr>
        `;
      });
      
      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  },
  
  async clearHistory() {
    if (!confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/barber/history?businessId=${this.business.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear history');
      }
      
      this.showNotification('✓ History cleared successfully', 'success');
      this.loadHistory();
    } catch (error) {
      console.error('Clear history error:', error);
      this.showNotification('❌ Failed to clear history', 'error');
    }
  }
};

// Make it globally accessible for onclick handlers
window.barberDashboard = barberDashboard;
