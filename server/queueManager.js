// In-memory queue management (use database in production)
class QueueManager {
  constructor() {
    this.queue = [];
    this.tokenCounter = 1;
    this.services = [
      { id: 1, name: 'Haircut', duration: 25, icon: '✂️' },
      { id: 2, name: 'Hair Spa', duration: 45, icon: '💆' },
      { id: 3, name: 'Beard Trim', duration: 15, icon: '🪒' },
      { id: 4, name: 'Hair Color', duration: 60, icon: '🎨' },
      { id: 5, name: 'Consultation', duration: 15, icon: '👨‍⚕️' },
      { id: 6, name: 'Blood Test', duration: 10, icon: '💉' }
    ];
  }
  
  addCustomer(name, phone, serviceId) {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) throw new Error('Invalid service');
    
    const customer = {
      id: Date.now(),
      token: this.tokenCounter++,
      name,
      phone,
      serviceId,
      serviceDuration: service.duration,
      status: 'pending', // pending -> active -> serving -> completed
      joinedAt: new Date(),
      startedAt: null,
      completedAt: null
    };
    
    this.queue.push(customer);
    return customer;
  }
  
  getQueue() {
    return this.queue;
  }
  
  getCustomerById(id) {
    return this.queue.find(c => c.id === id);
  }
  
  getCustomerByToken(token) {
    return this.queue.find(c => c.token === parseInt(token));
  }
  
  getCustomerStatus(token) {
    const customer = this.getCustomerByToken(token);
    if (!customer) return { customer: null };
    
    const activeQueue = this.queue.filter(
      c => (c.status === 'active' || c.status === 'serving') && c.id !== customer.id
    );
    
    const position = activeQueue.filter(c => c.joinedAt < customer.joinedAt).length;
    
    const estimatedWait = activeQueue
      .filter(c => c.joinedAt < customer.joinedAt)
      .reduce((sum, c) => sum + c.serviceDuration, 0);
    
    return {
      customer,
      position,
      estimatedWait
    };
  }
  
  approveCustomer(id) {
    const customer = this.getCustomerById(id);
    if (customer) {
      customer.status = 'active';
    }
  }
  
  startService(id) {
    const customer = this.getCustomerById(id);
    if (customer) {
      customer.status = 'serving';
      customer.startedAt = new Date();
    }
  }
  
  completeService(id) {
    const customer = this.getCustomerById(id);
    if (customer) {
      customer.status = 'completed';
      customer.completedAt = new Date();
    }
  }
  
  removeCustomer(id) {
    const index = this.queue.findIndex(c => c.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }
  
  getNextCustomer() {
    const activeCustomers = this.queue.filter(c => c.status === 'active');
    return activeCustomers.sort((a, b) => a.joinedAt - b.joinedAt)[1]; // Second in line
  }
}

export const queueManager = new QueueManager();
