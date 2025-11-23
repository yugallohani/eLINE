// Shop Registration Module
export const shopRegistration = {
  currentStep: 1,
  formData: {},
  
  render(app) {
    app.innerHTML = `
      <div class="bg-animated"></div>
      <div class="registration-container">
        <div class="registration-header">
          <h1 class="logo">eLINE</h1>
          <div class="registration-progress">
            <div class="progress-step ${this.currentStep >= 1 ? 'active' : ''}" data-step="1">
              <div class="progress-circle">1</div>
              <span>Shop Details</span>
            </div>
            <div class="progress-line ${this.currentStep >= 2 ? 'active' : ''}"></div>
            <div class="progress-step ${this.currentStep >= 2 ? 'active' : ''}" data-step="2">
              <div class="progress-circle">2</div>
              <span>Location</span>
            </div>
            <div class="progress-line ${this.currentStep >= 3 ? 'active' : ''}"></div>
            <div class="progress-step ${this.currentStep >= 3 ? 'active' : ''}" data-step="3">
              <div class="progress-circle">3</div>
              <span>Documents</span>
            </div>
            <div class="progress-line ${this.currentStep >= 4 ? 'active' : ''}"></div>
            <div class="progress-step ${this.currentStep >= 4 ? 'active' : ''}" data-step="4">
              <div class="progress-circle">4</div>
              <span>Review</span>
            </div>
          </div>
        </div>
        
        <div class="registration-content" id="registration-content">
          ${this.renderStep()}
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  },
  
  renderStep() {
    switch(this.currentStep) {
      case 1: return this.renderShopDetails();
      case 2: return this.renderLocation();
      case 3: return this.renderDocuments();
      case 4: return this.renderReview();
      default: return '';
    }
  },

  renderServiceRow(serviceName, defaultPrice, defaultDuration) {
    const serviceData = this.formData.servicesPricing?.[serviceName];
    const isChecked = serviceData?.enabled !== undefined ? serviceData.enabled : true; // Default to checked
    const price = serviceData?.price || defaultPrice;
    const duration = serviceData?.duration || defaultDuration;
    
    return `
      <div class="service-row" style="display: grid; grid-template-columns: auto 1fr auto auto; gap: 12px; align-items: center; padding: 12px; background: var(--bg-tertiary); border-radius: 8px;">
        <label class="checkbox-label" style="margin: 0;">
          <input type="checkbox" 
                 class="service-checkbox" 
                 data-service="${serviceName}" 
                 ${isChecked ? 'checked' : ''}
                 onchange="window.shopRegistration.toggleService(this)">
          <span style="font-weight: 500;">${serviceName}</span>
        </label>
        <div></div>
        <div class="input-group" style="margin: 0; min-width: 120px;">
          <label class="input-label" style="font-size: 12px; margin-bottom: 4px;">Price (₹)</label>
          <input type="number" 
                 class="input" 
                 data-service-price="${serviceName}"
                 value="${price}" 
                 min="0" 
                 step="10"
                 style="padding: 8px;">
        </div>
        <div class="input-group" style="margin: 0; min-width: 100px;">
          <label class="input-label" style="font-size: 12px; margin-bottom: 4px;">Duration (min)</label>
          <input type="number" 
                 class="input" 
                 data-service-duration="${serviceName}"
                 value="${duration}" 
                 min="5" 
                 step="5"
                 style="padding: 8px;">
        </div>
      </div>
    `;
  },
  
  toggleService(checkbox) {
    const serviceName = checkbox.dataset.service;
    const priceInput = document.querySelector(`[data-service-price="${serviceName}"]`);
    const durationInput = document.querySelector(`[data-service-duration="${serviceName}"]`);
    
    if (checkbox.checked) {
      priceInput.disabled = false;
      durationInput.disabled = false;
    } else {
      priceInput.disabled = true;
      durationInput.disabled = true;
    }
  },
  
  renderShopDetails() {
    return `
      <div class="registration-card fade-in">
        <h2 class="registration-title">Shop Details</h2>
        <p class="registration-subtitle">Tell us about your barber shop</p>
        
        <form id="shop-details-form" class="registration-form">
          <div class="form-row">
            <div class="input-group">
              <label class="input-label">Shop Name *</label>
              <input type="text" class="input" name="shopName" value="${this.formData.shopName || ''}" required>
            </div>
            
            <div class="input-group">
              <label class="input-label">Owner Name *</label>
              <input type="text" class="input" name="ownerName" value="${this.formData.ownerName || ''}" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="input-group">
              <label class="input-label">Phone Number *</label>
              <input type="tel" class="input" name="phone" value="${this.formData.phone || ''}" placeholder="+91 98765 43210" required>
            </div>
            
            <div class="input-group">
              <label class="input-label">Email Address *</label>
              <input type="email" class="input" name="email" value="${this.formData.email || ''}" required>
            </div>
          </div>
          
          <div class="input-group">
            <label class="input-label">Number of Barbers *</label>
            <input type="number" class="input" name="numberOfBarbers" value="${this.formData.numberOfBarbers || 1}" min="1" required>
          </div>
          
          <div class="input-group">
            <label class="input-label">Services Offered * <span style="font-size: 12px; color: var(--text-secondary); font-weight: normal;">(Select services and set your prices)</span></label>
            <div style="display: grid; gap: 16px;">
              ${this.renderServiceRow('Haircut (Men)', 150, 25)}
              ${this.renderServiceRow('Haircut (Women)', 300, 40)}
              ${this.renderServiceRow('Beard Trim', 80, 15)}
              ${this.renderServiceRow('Hair Spa', 300, 45)}
              ${this.renderServiceRow('Facial (Basic)', 600, 30)}
              ${this.renderServiceRow('Waxing (Arms/Legs)', 300, 30)}
            </div>
          </div>          
          <div class="form-row">
            <div class="input-group">
              <label class="input-label">Opening Time *</label>
              <input type="time" class="input" name="openingTime" value="${this.formData.openingTime || '09:00'}" required>
            </div>
            
            <div class="input-group">
              <label class="input-label">Closing Time *</label>
              <input type="time" class="input" name="closingTime" value="${this.formData.closingTime || '20:00'}" required>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="window.location.href='/'">Cancel</button>
            <button type="submit" class="btn btn-primary">Next Step →</button>
          </div>
        </form>
      </div>
    `;
  },

  renderLocation() {
    return `
      <div class="registration-card fade-in">
        <h2 class="registration-title">Shop Location</h2>
        <p class="registration-subtitle">Help customers find you easily</p>
        
        <div class="location-detect-box">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="var(--accent-primary)"/>
          </svg>
          <h3>Detect Location Automatically</h3>
          <p>Allow location access for accurate positioning</p>
          <button type="button" class="btn btn-primary" id="detect-location-btn">
            📍 Detect My Location
          </button>
          <p style="margin-top: 16px; font-size: 14px; color: var(--text-tertiary);">
            Or enter manually below
          </p>
        </div>
        
        <form id="location-form" class="registration-form">
          <div class="input-group">
            <label class="input-label">Full Address *</label>
            <textarea class="input" name="address" rows="2" required>${this.formData.address || ''}</textarea>
          </div>
          
          <div class="form-row">
            <div class="input-group">
              <label class="input-label">Street/Building</label>
              <input type="text" class="input" name="street" value="${this.formData.street || ''}">
            </div>
            
            <div class="input-group">
              <label class="input-label">Area/Locality *</label>
              <input type="text" class="input" name="area" value="${this.formData.area || ''}" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="input-group">
              <label class="input-label">City *</label>
              <input type="text" class="input" name="city" value="${this.formData.city || ''}" required>
            </div>
            
            <div class="input-group">
              <label class="input-label">State *</label>
              <input type="text" class="input" name="state" value="${this.formData.state || ''}" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="input-group">
              <label class="input-label">Pincode *</label>
              <input type="text" class="input" name="pincode" value="${this.formData.pincode || ''}" pattern="[0-9]{6}" required>
            </div>
            
            <div class="input-group">
              <label class="input-label">Coordinates</label>
              <input type="text" class="input" name="coordinates" value="${this.formData.latitude && this.formData.longitude ? `${this.formData.latitude}, ${this.formData.longitude}` : ''}" readonly placeholder="Auto-detected">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="back-btn">← Back</button>
            <button type="submit" class="btn btn-primary">Next Step →</button>
          </div>
        </form>
      </div>
    `;
  },

  renderDocuments() {
    return `
      <div class="registration-card fade-in">
        <h2 class="registration-title">Upload Documents</h2>
        <p class="registration-subtitle">Required for verification</p>
        
        <form id="documents-form" class="registration-form">
          <div class="document-upload-section">
            <div class="document-upload-card required">
              <div class="document-icon">📄</div>
              <h4>Aadhaar Card *</h4>
              <p>Owner's Aadhaar card (front & back)</p>
              <input type="file" id="aadhaar-upload" accept="image/*,.pdf" required hidden>
              <label for="aadhaar-upload" class="btn btn-secondary btn-sm">Choose File</label>
              <div class="file-name" id="aadhaar-name"></div>
            </div>
            
            <div class="document-upload-card required">
              <div class="document-icon">💳</div>
              <h4>PAN Card *</h4>
              <p>Owner's PAN card</p>
              <input type="file" id="pan-upload" accept="image/*,.pdf" required hidden>
              <label for="pan-upload" class="btn btn-secondary btn-sm">Choose File</label>
              <div class="file-name" id="pan-name"></div>
            </div>
            
            <div class="document-upload-card">
              <div class="document-icon">🏪</div>
              <h4>Shop License</h4>
              <p>Municipal registration (optional)</p>
              <input type="file" id="license-upload" accept="image/*,.pdf" hidden>
              <label for="license-upload" class="btn btn-secondary btn-sm">Choose File</label>
              <div class="file-name" id="license-name"></div>
            </div>
            
            <div class="document-upload-card">
              <div class="document-icon">📋</div>
              <h4>Business Registration</h4>
              <p>If applicable (optional)</p>
              <input type="file" id="business-upload" accept="image/*,.pdf" hidden>
              <label for="business-upload" class="btn btn-secondary btn-sm">Choose File</label>
              <div class="file-name" id="business-name"></div>
            </div>
            
            <div class="document-upload-card">
              <div class="document-icon">🧾</div>
              <h4>GST Certificate</h4>
              <p>If registered (optional)</p>
              <input type="file" id="gst-upload" accept="image/*,.pdf" hidden>
              <label for="gst-upload" class="btn btn-secondary btn-sm">Choose File</label>
              <div class="file-name" id="gst-name"></div>
            </div>
            
            <div class="document-upload-card">
              <div class="document-icon">📸</div>
              <h4>Shop Photos</h4>
              <p>Front view of shop (optional)</p>
              <input type="file" id="photos-upload" accept="image/*" multiple hidden>
              <label for="photos-upload" class="btn btn-secondary btn-sm">Choose Files</label>
              <div class="file-name" id="photos-name"></div>
            </div>
          </div>
          
          <div class="info-box">
            <strong>📌 Important:</strong> All documents will be securely stored and used only for verification purposes.
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="back-btn">← Back</button>
            <button type="submit" class="btn btn-primary">Next Step →</button>
          </div>
        </form>
      </div>
    `;
  },

  renderReview() {
    const services = this.formData.services || [];
    return `
      <div class="registration-card fade-in">
        <h2 class="registration-title">Review & Submit</h2>
        <p class="registration-subtitle">Please review your information before submitting</p>
        
        <div class="review-section">
          <h3 class="review-heading">Shop Details</h3>
          <div class="review-grid">
            <div class="review-item">
              <span class="review-label">Shop Name:</span>
              <span class="review-value">${this.formData.shopName}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Owner Name:</span>
              <span class="review-value">${this.formData.ownerName}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Phone:</span>
              <span class="review-value">${this.formData.phone}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Email:</span>
              <span class="review-value">${this.formData.email}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Number of Barbers:</span>
              <span class="review-value">${this.formData.numberOfBarbers}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Operating Hours:</span>
              <span class="review-value">${this.formData.openingTime} - ${this.formData.closingTime}</span>
            </div>
          </div>
          
          <div class="review-item full-width">
            <span class="review-label">Services:</span>
            <div class="services-tags">
              ${services.map(s => `<span class="service-tag">${s}</span>`).join('')}
            </div>
          </div>
        </div>
        
        <div class="review-section">
          <h3 class="review-heading">Location</h3>
          <div class="review-grid">
            <div class="review-item full-width">
              <span class="review-label">Address:</span>
              <span class="review-value">${this.formData.address}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Area:</span>
              <span class="review-value">${this.formData.area}</span>
            </div>
            <div class="review-item">
              <span class="review-label">City:</span>
              <span class="review-value">${this.formData.city}, ${this.formData.state}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Pincode:</span>
              <span class="review-value">${this.formData.pincode}</span>
            </div>
            ${this.formData.latitude ? `
              <div class="review-item">
                <span class="review-label">Coordinates:</span>
                <span class="review-value">${this.formData.latitude}, ${this.formData.longitude}</span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <div class="review-section">
          <h3 class="review-heading">Documents</h3>
          <div class="documents-list">
            <div class="document-item">✅ Aadhaar Card</div>
            <div class="document-item">✅ PAN Card</div>
            ${this.formData.shopLicense ? '<div class="document-item">✅ Shop License</div>' : ''}
            ${this.formData.businessReg ? '<div class="document-item">✅ Business Registration</div>' : ''}
            ${this.formData.gstCert ? '<div class="document-item">✅ GST Certificate</div>' : ''}
            ${this.formData.shopPhotos ? '<div class="document-item">✅ Shop Photos</div>' : ''}
          </div>
        </div>
        
        <div class="info-box success">
          <strong>🎉 What happens next?</strong><br>
          1. Your application will be reviewed by our team<br>
          2. We'll verify all documents (usually within 24-48 hours)<br>
          3. Once approved, you'll receive your unique Barber Code via SMS<br>
          4. You can then log in and start managing your queue!
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="back-btn">← Back</button>
          <button type="button" class="btn btn-primary" id="submit-btn">Submit Application 🚀</button>
        </div>
      </div>
    `;
  },
  
  attachEventListeners() {
    // Form submissions
    const shopForm = document.getElementById('shop-details-form');
    if (shopForm) {
      shopForm.onsubmit = (e) => {
        e.preventDefault();
        this.saveShopDetails(new FormData(shopForm));
      };
    }
    
    const locationForm = document.getElementById('location-form');
    if (locationForm) {
      locationForm.onsubmit = (e) => {
        e.preventDefault();
        this.saveLocation(new FormData(locationForm));
      };
    }
    
    const documentsForm = document.getElementById('documents-form');
    if (documentsForm) {
      documentsForm.onsubmit = (e) => {
        e.preventDefault();
        this.saveDocuments();
      };
    }
    
    // Back buttons
    const backBtns = document.querySelectorAll('#back-btn');
    backBtns.forEach(btn => {
      btn.onclick = () => {
        this.currentStep--;
        this.render(document.getElementById('app'));
      };
    });
    
    // Location detection
    const detectBtn = document.getElementById('detect-location-btn');
    if (detectBtn) {
      detectBtn.onclick = () => this.detectLocation();
    }
    
    // File uploads
    this.attachFileListeners();
    
    // Submit button
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.onclick = () => this.submitApplication();
    }
  },
  
  saveShopDetails(formData) {
    this.formData.shopName = formData.get('shopName');
    this.formData.ownerName = formData.get('ownerName');
    this.formData.phone = formData.get('phone');
    this.formData.email = formData.get('email');
    this.formData.numberOfBarbers = formData.get('numberOfBarbers');
    this.formData.openingTime = formData.get('openingTime');
    this.formData.closingTime = formData.get('closingTime');
    
    // Collect service pricing data
    const serviceNames = ['Haircut (Men)', 'Haircut (Women)', 'Beard Trim', 'Hair Spa', 'Facial (Basic)', 'Waxing (Arms/Legs)'];
    const servicesPricing = {};
    const selectedServices = [];
    
    serviceNames.forEach(serviceName => {
      const checkbox = document.querySelector(`[data-service="${serviceName}"]`);
      const priceInput = document.querySelector(`[data-service-price="${serviceName}"]`);
      const durationInput = document.querySelector(`[data-service-duration="${serviceName}"]`);
      
      if (checkbox && checkbox.checked) {
        servicesPricing[serviceName] = {
          enabled: true,
          price: parseFloat(priceInput.value) || 0,
          duration: parseInt(durationInput.value) || 0
        };
        selectedServices.push(serviceName);
      }
    });
    
    if (selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }
    
    this.formData.services = selectedServices;
    this.formData.servicesPricing = servicesPricing;
    
    this.currentStep = 2;
    this.render(document.getElementById('app'));
  },
  
  saveLocation(formData) {
    this.formData.address = formData.get('address');
    this.formData.street = formData.get('street');
    this.formData.area = formData.get('area');
    this.formData.city = formData.get('city');
    this.formData.state = formData.get('state');
    this.formData.pincode = formData.get('pincode');
    
    this.currentStep = 3;
    this.render(document.getElementById('app'));
  },
  
  saveDocuments() {
    // Files are already stored in formData
    this.currentStep = 4;
    this.render(document.getElementById('app'));
  },
  
  detectLocation() {
    const btn = document.getElementById('detect-location-btn');
    btn.innerHTML = '📍 Detecting...';
    btn.disabled = true;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.formData.latitude = position.coords.latitude;
          this.formData.longitude = position.coords.longitude;
          
          // Update coordinates field
          const coordsInput = document.querySelector('input[name="coordinates"]');
          if (coordsInput) {
            coordsInput.value = `${this.formData.latitude}, ${this.formData.longitude}`;
          }
          
          btn.innerHTML = '✅ Location Detected!';
          setTimeout(() => {
            btn.innerHTML = '📍 Detect My Location';
            btn.disabled = false;
          }, 2000);
        },
        (error) => {
          alert('Unable to detect location. Please enter manually.');
          btn.innerHTML = '📍 Detect My Location';
          btn.disabled = false;
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      btn.innerHTML = '📍 Detect My Location';
      btn.disabled = false;
    }
  },
  
  attachFileListeners() {
    const fileInputs = [
      { id: 'aadhaar-upload', nameId: 'aadhaar-name', key: 'aadhaar' },
      { id: 'pan-upload', nameId: 'pan-name', key: 'pan' },
      { id: 'license-upload', nameId: 'license-name', key: 'shopLicense' },
      { id: 'business-upload', nameId: 'business-name', key: 'businessReg' },
      { id: 'gst-upload', nameId: 'gst-name', key: 'gstCert' },
      { id: 'photos-upload', nameId: 'photos-name', key: 'shopPhotos' }
    ];
    
    fileInputs.forEach(({ id, nameId, key }) => {
      const input = document.getElementById(id);
      const nameDiv = document.getElementById(nameId);
      
      if (input && nameDiv) {
        input.onchange = async (e) => {
          const files = e.target.files;
          if (files.length > 0) {
            // Show uploading status
            nameDiv.textContent = '⏳ Uploading...';
            nameDiv.style.color = 'var(--text-secondary)';
            
            try {
              // Upload files
              const uploadedUrls = await this.uploadFiles(files, key);
              
              // Store URLs in formData
              this.formData[key] = uploadedUrls;
              
              // Show success
              nameDiv.textContent = files.length > 1 
                ? `✅ ${files.length} files uploaded` 
                : `✅ ${files[0].name}`;
              nameDiv.style.color = 'var(--success)';
            } catch (error) {
              nameDiv.textContent = '❌ Upload failed';
              nameDiv.style.color = 'var(--error)';
              alert('File upload failed: ' + error.message);
            }
          }
        };
      }
    });
  },
  
  async uploadFiles(files, category) {
    const formData = new FormData();
    
    // Add all files to FormData
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('category', category);
    
    const response = await fetch('/api/upload/documents', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return data.urls; // Array of uploaded file URLs
  },
  
  async submitApplication() {
    const btn = document.getElementById('submit-btn');
    btn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; margin: 0 auto;"></div>';
    btn.disabled = true;
    
    try {
      // Prepare submission data with proper field names
      const submissionData = {
        ...this.formData,
        // Map document URLs to expected field names
        aadhaarUrl: Array.isArray(this.formData.aadhaar) ? this.formData.aadhaar[0] : (this.formData.aadhaar || ''),
        panUrl: Array.isArray(this.formData.pan) ? this.formData.pan[0] : (this.formData.pan || ''),
        shopLicenseUrl: Array.isArray(this.formData.shopLicense) ? this.formData.shopLicense[0] : (this.formData.shopLicense || ''),
        businessRegUrl: Array.isArray(this.formData.businessReg) ? this.formData.businessReg[0] : (this.formData.businessReg || ''),
        gstCertUrl: Array.isArray(this.formData.gstCert) ? this.formData.gstCert[0] : (this.formData.gstCert || ''),
        shopPhotos: this.formData.shopPhotos || []
      };
      
      // Remove the original keys
      delete submissionData.aadhaar;
      delete submissionData.pan;
      delete submissionData.shopLicense;
      delete submissionData.businessReg;
      delete submissionData.gstCert;
      
      const response = await fetch('/api/shop/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      if (response.ok) {
        window.location.href = '/application-submitted';
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Submission error:', errorData);
        throw new Error(errorData.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submit application error:', error);
      alert(`Failed to submit application: ${error.message}`);
      btn.innerHTML = 'Submit Application 🚀';
      btn.disabled = false;
    }
  }
};

// Make globally accessible for onclick handlers
window.shopRegistration = shopRegistration;
