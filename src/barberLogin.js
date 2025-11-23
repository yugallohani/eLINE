import { state, api } from './state.js';

export const barberLogin = {
  render(app) {
    app.innerHTML = `
      <div class="bg-animated"></div>
      <div class="landing-page">
        <div class="landing-container">
          <div class="login-page">
            <div class="login-card glass-card">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 class="logo" style="font-size: 48px; margin-bottom: 8px;">eLINE</h1>
                <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Barber Dashboard Login</h2>
                <p style="color: var(--text-secondary);">Enter your barber code to access your dashboard</p>
              </div>
              
              <div id="login-error" style="display: none; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px; color: var(--error);"></div>
              
              <form id="barber-login-form" class="login-form">
                <div class="input-group">
                  <label class="input-label">Barber Code</label>
                  <input type="text" class="input" id="barber-code" name="barberCode" placeholder="BARBER-XXXXXX" required autofocus style="text-transform: uppercase;">
                  <p style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">
                    You received this code via SMS after approval
                  </p>
                </div>
                
                <div class="input-group">
                  <label class="input-label">Password</label>
                  <input type="password" class="input" id="barber-password" name="password" placeholder="Enter your password" required>
                </div>
                
                <button type="submit" class="btn btn-primary" id="login-btn" style="width: 100%; margin-top: 24px;">
                  💈 Login to Dashboard
                </button>
              </form>
              
              <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--glass-border);">
                <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px;">
                  Don't have a barber code yet?
                </p>
                <a href="/register-shop" class="btn btn-secondary btn-sm">
                  Register Your Shop
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 16px;">
                <a href="/" style="color: var(--text-secondary); text-decoration: none; font-size: 14px;">
                  ← Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  },
  
  attachEventListeners() {
    const form = document.getElementById('barber-login-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      await this.handleLogin();
    };
  },
  
  async handleLogin() {
    const barberCode = document.getElementById('barber-code').value.trim().toUpperCase();
    const password = document.getElementById('barber-password').value;
    const errorDiv = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');
    
    // Hide previous errors
    errorDiv.style.display = 'none';
    
    // Show loading state
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; margin: 0 auto;"></div>';
    loginBtn.disabled = true;
    
    try {
      const response = await fetch('/api/barber/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ barberCode, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store token and business info
      localStorage.setItem('barber_token', data.token);
      localStorage.setItem('barber_business', JSON.stringify(data.business));
      
      // Redirect to dashboard
      window.location.href = '/barber-dashboard';
      
    } catch (error) {
      console.error('Login error:', error);
      errorDiv.textContent = `❌ ${error.message}`;
      errorDiv.style.display = 'block';
      loginBtn.innerHTML = originalText;
      loginBtn.disabled = false;
    }
  }
};
