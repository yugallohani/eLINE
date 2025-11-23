// Shop List Module
export const shopList = {
  shops: [],
  
  async render(app) {
    app.innerHTML = `
      <div class="bg-animated"></div>
      <div class="landing-page">
        <div class="landing-container">
          <div class="shop-list-page">
            <div class="shop-list-header">
              <button class="back-button" onclick="window.location.href='/'">
                ← Back
              </button>
              <h1 class="shop-list-title">Choose Your Shop</h1>
              <p class="shop-list-subtitle">Select a shop to view services and join the queue</p>
            </div>
            
            <div id="shops-container" class="shops-grid">
              <div class="spinner" style="margin: 48px auto;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    await this.loadShops();
  },
  
  async loadShops() {
    const container = document.getElementById('shops-container');
    
    try {
      const API_URL = window.API_URL || window.location.origin;
      const response = await fetch(`${API_URL}/api/shops/list`);
      
      if (!response.ok) throw new Error('Failed to load shops');
      
      this.shops = await response.json();
      
      if (this.shops.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div style="font-size: 64px; margin-bottom: 16px;">🏪</div>
            <h3>No Shops Available</h3>
            <p style="color: var(--text-secondary); margin-top: 8px;">
              No shops are currently registered. Check back soon!
            </p>
          </div>
        `;
        return;
      }
      
      container.innerHTML = this.shops.map(shop => this.renderShopCard(shop)).join('');
      
      // Attach click handlers
      this.shops.forEach(shop => {
        const card = document.getElementById(`shop-${shop.id}`);
        if (card) {
          card.onclick = () => {
            window.location.href = `/shop/${shop.barberCode}`;
          };
        }
      });
      
    } catch (error) {
      console.error('Load shops error:', error);
      container.innerHTML = `
        <div class="error-state">
          <div style="font-size: 64px; margin-bottom: 16px;">⚠️</div>
          <h3>Failed to Load Shops</h3>
          <p style="color: var(--text-secondary); margin-top: 8px;">
            ${error.message}
          </p>
          <button class="btn btn-primary" onclick="location.reload()">
            Try Again
          </button>
        </div>
      `;
    }
  },
  
  renderShopCard(shop) {
    const serviceCount = shop._count?.services || 0;
    const queueCount = shop._count?.customers || 0;
    
    return `
      <div class="shop-card" id="shop-${shop.id}">
        <div class="shop-card-header">
          <div class="shop-icon">
            ${shop.logoUrl ? `<img src="${shop.logoUrl}" alt="${shop.name}">` : '✂️'}
          </div>
          <div class="shop-badge ${queueCount > 5 ? 'busy' : queueCount > 0 ? 'active' : 'available'}">
            ${queueCount > 5 ? '🔴 Busy' : queueCount > 0 ? '🟡 Active' : '🟢 Available'}
          </div>
        </div>
        
        <div class="shop-card-body">
          <h3 class="shop-name">${shop.name}</h3>
          <p class="shop-location">
            📍 ${shop.city}${shop.state ? ', ' + shop.state : ''}
          </p>
          
          <div class="shop-stats">
            <div class="shop-stat">
              <span class="stat-icon">✂️</span>
              <span class="stat-text">${serviceCount} Services</span>
            </div>
            <div class="shop-stat">
              <span class="stat-icon">👥</span>
              <span class="stat-text">${queueCount} in Queue</span>
            </div>
          </div>
          
          ${shop.operatingHours ? `
            <div class="shop-hours">
              <span class="hours-icon">🕐</span>
              <span class="hours-text">
                ${typeof shop.operatingHours === 'string' ? JSON.parse(shop.operatingHours).opening : shop.operatingHours.opening} - 
                ${typeof shop.operatingHours === 'string' ? JSON.parse(shop.operatingHours).closing : shop.operatingHours.closing}
              </span>
            </div>
          ` : ''}
        </div>
        
        <div class="shop-card-footer">
          <button class="btn btn-primary btn-block">
            View Services →
          </button>
        </div>
      </div>
    `;
  }
};
