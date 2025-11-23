// Global state management
export const state = {
  ws: null,
  currentToken: null,
  services: [],
  queue: [],
  businessId: 'demo',
  
  connectWebSocket() {
    const API_URL = window.API_URL || 'http://localhost:3000';
    const wsUrl = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'queue_update') {
        this.queue = data.queue;
        this.notifyListeners();
      }
    };
    
    this.ws.onerror = () => {
      console.log('WebSocket connection failed, using polling fallback');
      this.startPolling();
    };
  },
  
  startPolling() {
    setInterval(async () => {
      try {
        const response = await fetch('/api/queue');
        const data = await response.json();
        this.queue = data;
        this.notifyListeners();
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, 5000);
  },
  
  listeners: [],
  
  subscribe(callback) {
    this.listeners.push(callback);
  },
  
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.queue));
  }
};

// API calls
export const api = {
  async getServices() {
    const response = await fetch(`/api/services?businessId=${state.businessId}`);
    const services = await response.json();
    state.services = services;
    return services;
  },

  async joinQueue(name, phone, serviceId) {
    const response = await fetch('/api/queue/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, serviceId, businessId: state.businessId })
    });
    return response.json();
  },
  
  async getQueueStatus(token) {
    const response = await fetch(`/api/queue/status/${token}`);
    return response.json();
  },
  
  async getQueue() {
    const response = await fetch(`/api/queue?businessId=${state.businessId}`);
    return response.json();
  },

  async getAnalytics(days = 7) {
    const response = await fetch(`/api/analytics?businessId=${state.businessId}&days=${days}`);
    return response.json();
  },
  
  async approveCustomer(id) {
    const response = await fetch(`/api/queue/${id}/approve`, { method: 'POST' });
    return response.json();
  },
  
  async startService(id) {
    const response = await fetch(`/api/queue/${id}/start`, { method: 'POST' });
    return response.json();
  },
  
  async completeService(id) {
    const response = await fetch(`/api/queue/${id}/complete`, { method: 'POST' });
    return response.json();
  },
  
  async removeCustomer(id) {
    const response = await fetch(`/api/queue/${id}`, { method: 'DELETE' });
    return response.json();
  }
};
