import dotenv from 'dotenv';
import axios from 'axios';
import prisma from './database.js';

dotenv.config();

class NotificationService {
  constructor() {
    this.twilioEnabled = false;
    this.whatsappEnabled = false;
    
    // Initialize Twilio if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        import('twilio').then(({ default: twilio }) => {
          this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );
          this.twilioEnabled = true;
          console.log('✅ Twilio SMS enabled');
        });
      } catch (error) {
        console.log('⚠️  Twilio not configured');
      }
    }

    // Initialize WhatsApp Business API
    if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
      this.whatsappEnabled = true;
      this.whatsappToken = process.env.WHATSAPP_TOKEN;
      this.whatsappPhoneId = process.env.WHATSAPP_PHONE_ID;
      console.log('✅ WhatsApp Business API enabled');
    } else {
      console.log('⚠️  WhatsApp not configured');
    }

    if (!this.twilioEnabled && !this.whatsappEnabled) {
      console.log('⚠️  No notification services configured - using mock mode');
    }
  }
  
  async sendSMS(phone, message, customerId = null) {
    try {
      if (!this.twilioEnabled) {
        console.log(`[SMS Mock] To: ${phone}, Message: ${message}`);
        await this.logNotification(phone, message, 'sms', 'sent', null, customerId);
        return { success: true, mock: true };
      }
      
      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      
      console.log(`✅ SMS sent to ${phone}`);
      await this.logNotification(phone, message, 'sms', 'sent', result.sid, customerId);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('SMS send failed:', error.message);
      await this.logNotification(phone, message, 'sms', 'failed', null, customerId, error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWhatsApp(phone, message, customerId = null) {
    try {
      if (!this.whatsappEnabled) {
        console.log(`[WhatsApp Mock] To: ${phone}, Message: ${message}`);
        await this.logNotification(phone, message, 'whatsapp', 'sent', null, customerId);
        return { success: true, mock: true };
      }

      const url = `https://graph.facebook.com/v18.0/${this.whatsappPhoneId}/messages`;
      
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.whatsappToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp sent to ${phone}`);
      await this.logNotification(phone, message, 'whatsapp', 'sent', response.data.messages[0].id, customerId);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp send failed:', error.response?.data || error.message);
      await this.logNotification(phone, message, 'whatsapp', 'failed', null, customerId, error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWhatsAppTemplate(phone, templateName, parameters, customerId = null) {
    try {
      if (!this.whatsappEnabled) {
        console.log(`[WhatsApp Template Mock] To: ${phone}, Template: ${templateName}`);
        return { success: true, mock: true };
      }

      const url = `https://graph.facebook.com/v18.0/${this.whatsappPhoneId}/messages`;
      
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: parameters.map(p => ({ type: 'text', text: p }))
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.whatsappToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp template sent to ${phone}`);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('WhatsApp template send failed:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  async logNotification(phone, message, type, status, providerId = null, customerId = null, error = null) {
    try {
      await prisma.notification.create({
        data: {
          phone,
          message,
          type,
          status,
          providerId,
          error,
          sentAt: status === 'sent' ? new Date() : null
        }
      });
    } catch (err) {
      console.error('Failed to log notification:', err);
    }
  }

  // Determine best channel (WhatsApp preferred, fallback to SMS)
  async send(phone, message, customerId = null) {
    if (this.whatsappEnabled) {
      const result = await this.sendWhatsApp(phone, message, customerId);
      if (result.success) return result;
    }
    
    // Fallback to SMS
    return await this.sendSMS(phone, message, customerId);
  }
  
  async sendConfirmation(customer) {
    const message = `Hi ${customer.name}! Your token is #${customer.token}. We'll notify you when it's almost your turn. Track your status: ${process.env.APP_URL || 'http://localhost:3000'}/queue?token=${customer.token}`;
    return await this.send(customer.phone, message, customer.id);
  }
  
  async sendApproval(customer) {
    const message = `Hi ${customer.name}! Your token #${customer.token} has been approved. You're in the queue now! Estimated wait: ${customer.estimatedWait || 0} minutes.`;
    return await this.send(customer.phone, message, customer.id);
  }
  
  async sendUpcomingNotification(customer, position = 1) {
    const message = `Hi ${customer.name}! Only ${position} ${position === 1 ? 'person' : 'people'} ahead of you (Token #${customer.token}). Please be ready!`;
    return await this.send(customer.phone, message, customer.id);
  }
  
  async sendTurnNotification(customer) {
    const message = `Hi ${customer.name}! It's your turn now (Token #${customer.token}). Please proceed to the counter. 🎉`;
    return await this.send(customer.phone, message, customer.id);
  }

  async sendNoShowMessage(customer) {
    const message = `Hi ${customer.name}, we noticed you missed your turn (Token #${customer.token}). No worries! Please rejoin the queue when you're ready.`;
    return await this.send(customer.phone, message, customer.id);
  }

  async sendFeedbackRequest(customer) {
    const feedbackUrl = `${process.env.APP_URL || 'http://localhost:3000'}/feedback/${customer.token}`;
    const message = `Hi ${customer.name}! Thank you for visiting ${customer.business.name}. How was your experience? Rate us: ${feedbackUrl}`;
    return await this.send(customer.phone, message, customer.id);
  }

  async sendLoyaltyReward(customer, visit) {
    const message = `🎉 Congratulations ${customer.name}! You've completed ${visit.visitCount} visits. Enjoy 20% off your next service! Show this message at checkout.`;
    return await this.send(customer.phone, message, customer.id);
  }

  async sendQueueUpdate(customer, position, estimatedWait) {
    const message = `Queue Update - Token #${customer.token}: ${position} ${position === 1 ? 'person' : 'people'} ahead. Estimated wait: ${estimatedWait} minutes.`;
    return await this.send(customer.phone, message, customer.id);
  }
}

export const notificationService = new NotificationService();
