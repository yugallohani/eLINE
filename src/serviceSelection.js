// Service Selection Module
export const serviceSelection = {
  shop: null,
  services: [],
  selectedService: null,
  
  // Map service names to emojis
  getServiceEmoji(serviceName) {
    const name = serviceName.toLowerCase();
    
    // Hair services
    if (name.includes('haircut') || name.includes('hair cut')) return '✂️';
    if (name.includes('hair color') || name.includes('coloring') || name.includes('dye')) return '🎨';
    if (name.includes('hair spa') || name.includes('hair treatment')) return '💆';
    if (name.includes('hair wash') || name.includes('shampoo')) return '🚿';
    if (name.includes('blow dry') || name.includes('styling')) return '💨';
    
    // Beard services
    if (name.includes('beard') || name.includes('shave')) return '🧔';
    
    // Facial services
    if (name.includes('facial') || name.includes('face')) return '😌';
    if (name.includes('cleanup')) return '✨';
    
    // Massage services
    if (name.includes('massage') || name.includes('head massage')) return '💆‍♂️';
    
    // Grooming services
    if (name.includes('manicure') || name.includes('nail')) return '💅';
    if (name.includes('pedicure') || name.includes('foot')) return '🦶';
    if (name.includes('wax') || name.includes('threading')) return '🪒';
    
    // Special services
    if (name.includes('bridal') || name.includes('wedding')) return '👰';
    if (name.includes('makeup')) return '💄';
    if (name.includes('mehendi') || name.includes('henna')) return '🖐️';
    
    // Default
    return '✂️';
  },
  
  async render(app, barberCode) {
    app.innerHTML = `
      <div class="bg-animated"></div>
      <div class="landing-page">
        <div class="landing-container">
          <div class="service-selection-page">
            <div id="service-content">
              <div class="spinner" style="margin: 48px auto;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    await this.loadShop(barberCode);
  },
  
  async loadShop(barberCode) {
    const container = document.getElementById('service-content');
    
    try {
      const API_URL = window.API_URL || window.location.origin;
      const response = await fetch(`${API_URL}/api/business/${barberCode}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Shop not found');
        }
        throw new Error('Failed to load shop');
      }
      
      const data = await response.json();
      this.shop = data.business;
      this.services = data.services;
      
      this.renderShopDetails(container);
      
    } catch (error) {
      console.error('Load shop error:', error);
      container.innerHTML = `
        <div class="error-state">
          <div style="font-size: 64px; margin-bottom: 16px;">⚠️</div>
          <h3>${error.message}</h3>
          <p style="color: var(--text-secondary); margin-top: 8px;">
            The shop you're looking for doesn't exist or is not available.
          </p>
          <button class="btn btn-primary" onclick="window.location.href='/shops'">
            Browse All Shops
          </button>
        </div>
      `;
    }
  },
  
  renderShopDetails(container) {
    const queueCount = this.shop._count?.customers || 0;
    
    container.innerHTML = `
      <div class="service-header">
        <button class="back-button" onclick="window.location.href='/shops'">
          ← Back to Shops
        </button>
        
        <div class="shop-info-card glass-card">
          <div class="shop-info-header">
            <div class="shop-icon-large">
              ${this.shop.logoUrl ? `<img src="${this.shop.logoUrl}" alt="${this.shop.name}">` : '✂️'}
            </div>
            <div class="shop-info-details">
              <h1 class="shop-info-name">${this.shop.name}</h1>
              <p class="shop-info-location">📍 ${this.shop.address}, ${this.shop.city}</p>
              <div class="shop-info-stats">
                <span class="info-badge ${queueCount > 5 ? 'busy' : queueCount > 0 ? 'active' : 'available'}">
                  ${queueCount > 5 ? '🔴 Busy' : queueCount > 0 ? '🟡 Active' : '🟢 Available'}
                </span>
                <span class="info-stat">👥 ${queueCount} in queue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="services-section">
        <h2 class="section-title">Select a Service</h2>
        <p class="section-subtitle">Choose the service you'd like to get</p>
        
        <div class="services-grid">
          ${this.services.length > 0 ? this.services.map(service => this.renderServiceCard(service)).join('') : `
            <div class="empty-state">
              <div style="font-size: 48px; margin-bottom: 16px;">✂️</div>
              <p style="color: var(--text-secondary);">No services available at this shop</p>
            </div>
          `}
        </div>
      </div>
      
      ${this.selectedService ? this.renderCustomerForm() : ''}
    `;
    
    // Attach service selection handlers
    this.services.forEach(service => {
      const card = document.getElementById(`service-${service.id}`);
      if (card) {
        card.onclick = () => this.selectService(service);
      }
    });
  },
  
  renderServiceCard(service) {
    const isSelected = this.selectedService?.id === service.id;
    const emoji = this.getServiceEmoji(service.name);
    
    return `
      <div class="service-card ${isSelected ? 'selected' : ''}" id="service-${service.id}">
        <div class="service-icon">${emoji}</div>
        <div class="service-details">
          <h3 class="service-name">${service.name}</h3>
          <div class="service-meta">
            <span class="service-duration">⏱️ ${service.duration} min</span>
            <span class="service-price">₹${service.price}</span>
          </div>
        </div>
        ${isSelected ? '<div class="service-check">✓</div>' : ''}
      </div>
    `;
  },
  
  selectService(service) {
    this.selectedService = service;
    const container = document.getElementById('service-content');
    this.renderShopDetails(container);
    
    // Scroll to form
    setTimeout(() => {
      document.getElementById('customer-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  },
  
  renderCustomerForm() {
    return `
      <div class="customer-form-section" id="customer-form">
        <div class="form-card glass-card">
          <h2 class="form-title">Your Details</h2>
          <p class="form-subtitle">We'll notify you when it's your turn</p>
          
          <form id="join-queue-form" class="queue-form">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" name="name" class="form-input" placeholder="Enter your name" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <input type="tel" name="phone" class="form-input" placeholder="10-digit mobile number" pattern="[0-9]{10}" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Email (Optional)</label>
              <input type="email" name="email" class="form-input" placeholder="your@email.com">
            </div>
            
            <div class="form-group">
              <label class="form-label">Any Special Requests?</label>
              <textarea name="notes" class="form-textarea" placeholder="Let us know if you have any specific requirements..." rows="3"></textarea>
            </div>
            
            <div class="selected-service-summary">
              <div class="summary-label">Selected Service:</div>
              <div class="summary-details">
                <span class="summary-name">${this.selectedService.name}</span>
                <span class="summary-meta">⏱️ ${this.selectedService.duration} min • ₹${this.selectedService.price}</span>
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary btn-large btn-block" id="join-btn">
              Join Queue 🚀
            </button>
          </form>
        </div>
      </div>
    `;
  },
  
  async handleJoinQueue(formData) {
    const btn = document.getElementById('join-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; margin: 0 auto;"></div>';
    
    try {
      const API_URL = window.API_URL || window.location.origin;
      const response = await fetch(`${API_URL}/api/queue/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: this.shop.id,
          serviceId: this.selectedService.id,
          name: formData.get('name'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          notes: formData.get('notes')
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join queue');
      }
      
      const data = await response.json();
      
      // Redirect to queue status page
      window.location.href = `/queue?token=${data.customer.token}`;
      
    } catch (error) {
      console.error('Join queue error:', error);
      alert('Failed to join queue: ' + error.message);
      btn.disabled = false;
      btn.innerHTML = 'Join Queue 🚀';
    }
  }
};
