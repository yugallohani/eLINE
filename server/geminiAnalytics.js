import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from './database.js';

class GeminiAnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.errorLogged = false; // Track if we've already logged an error
    
    if (process.env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro-latest' });
        this.enabled = true;
        console.log('✅ Gemini AI analytics enabled');
      } catch (error) {
        console.error('⚠️  Gemini AI initialization error:', error.message);
        this.enabled = false;
        this.errorLogged = true;
      }
    } else {
      this.enabled = false;
      console.log('⚠️  Gemini AI not configured');
    }
  }

  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async generateInsights(businessId) {
    if (!this.enabled) {
      return { insights: [], predictions: [], recommendations: [] };
    }

    try {
      // Fetch analytics data
      const analytics = await this.getAnalyticsData(businessId);
      
      // Generate insights using Gemini
      const prompt = this.buildAnalyticsPrompt(analytics);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseInsights(text);
    } catch (error) {
      // Silently fail - insights are optional
      if (!this.errorLogged) {
        console.error('⚠️  Gemini AI insights unavailable');
        this.errorLogged = true;
      }
      return { insights: [], predictions: [], recommendations: [] };
    }
  }

  async getAnalyticsData(businessId) {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get recent customers
    const recentCustomers = await prisma.customer.findMany({
      where: {
        businessId,
        createdAt: { gte: sevenDaysAgo }
      },
      include: { service: true }
    });

    // Get analytics records
    const analyticsRecords = await prisma.analytics.findMany({
      where: {
        businessId,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: 'desc' }
    });

    // Calculate metrics
    const totalCustomers = recentCustomers.length;
    const completedServices = recentCustomers.filter(c => c.status === 'completed').length;
    const noShows = recentCustomers.filter(c => c.status === 'no_show').length;
    const avgWaitTime = recentCustomers
      .filter(c => c.actualWait)
      .reduce((sum, c) => sum + c.actualWait, 0) / (completedServices || 1);

    // Peak hours analysis
    const hourlyData = {};
    recentCustomers.forEach(c => {
      const hour = new Date(c.joinedAt).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourlyData)
      .sort((a, b) => b[1] - a[1])[0];

    // Service popularity
    const serviceData = {};
    recentCustomers.forEach(c => {
      const serviceName = c.service?.name || 'Unknown';
      serviceData[serviceName] = (serviceData[serviceName] || 0) + 1;
    });

    return {
      totalCustomers,
      completedServices,
      noShows,
      avgWaitTime: Math.round(avgWaitTime),
      peakHour: peakHour ? { hour: peakHour[0], count: peakHour[1] } : null,
      servicePopularity: serviceData,
      dailyTrends: analyticsRecords.map(a => ({
        date: a.date,
        customers: a.totalCustomers,
        avgWait: a.avgWaitTime
      })),
      noShowRate: totalCustomers > 0 ? ((noShows / totalCustomers) * 100).toFixed(1) : 0
    };
  }

  buildAnalyticsPrompt(data) {
    return `You are an AI analytics assistant for a barber shop queue management system. Analyze the following data and provide actionable insights, predictions, and recommendations.

Data Summary:
- Total Customers (Last 7 days): ${data.totalCustomers}
- Completed Services: ${data.completedServices}
- No-shows: ${data.noShows} (${data.noShowRate}%)
- Average Wait Time: ${data.avgWaitTime} minutes
- Peak Hour: ${data.peakHour ? `${data.peakHour.hour}:00 with ${data.peakHour.count} customers` : 'Not enough data'}
- Most Popular Services: ${JSON.stringify(data.servicePopularity)}

Please provide:
1. 3-5 key insights about the business performance
2. 2-3 predictions for upcoming trends
3. 3-5 actionable recommendations to improve operations

Format your response as JSON:
{
  "insights": ["insight 1", "insight 2", ...],
  "predictions": ["prediction 1", "prediction 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`;
  }

  parseInsights(text) {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing
      return {
        insights: this.extractSection(text, 'insights'),
        predictions: this.extractSection(text, 'predictions'),
        recommendations: this.extractSection(text, 'recommendations')
      };
    } catch (error) {
      console.error('Failed to parse insights:', error);
      return { insights: [], predictions: [], recommendations: [] };
    }
  }

  extractSection(text, section) {
    const lines = text.split('\n');
    const items = [];
    let inSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes(section)) {
        inSection = true;
        continue;
      }
      if (inSection && line.trim().match(/^[-*•]\s/)) {
        items.push(line.trim().replace(/^[-*•]\s/, ''));
      }
      if (inSection && items.length > 0 && line.trim() === '') {
        break;
      }
    }

    return items;
  }

  async generateDailySummary(businessId) {
    if (!this.enabled) return null;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCustomers = await prisma.customer.findMany({
        where: {
          businessId,
          createdAt: { gte: today }
        },
        include: { service: true }
      });

      const prompt = `Summarize today's barber shop performance in 2-3 sentences:
- Total customers: ${todayCustomers.length}
- Completed: ${todayCustomers.filter(c => c.status === 'completed').length}
- Peak time: ${this.findPeakTime(todayCustomers)}
- Most requested service: ${this.findTopService(todayCustomers)}

Provide a brief, encouraging summary for the shop owner.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      // Silently fail - summary is optional
      return null;
    }
  }

  findPeakTime(customers) {
    const hours = {};
    customers.forEach(c => {
      const hour = new Date(c.joinedAt).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });
    const peak = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
    return peak ? `${peak[0]}:00` : 'N/A';
  }

  findTopService(customers) {
    const services = {};
    customers.forEach(c => {
      const name = c.service?.name || 'Unknown';
      services[name] = (services[name] || 0) + 1;
    });
    const top = Object.entries(services).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : 'N/A';
  }

  async generatePlatformInsights() {
    if (!this.enabled) {
      return null;
    }

    // Check cache first
    const cached = this.getCached('platform-insights');
    if (cached) {
      return cached;
    }

    try {
      // Get all businesses
      const businesses = await prisma.business.findMany({
        where: { status: 'approved' }
      });

      // Get platform-wide stats
      const totalCustomers = await prisma.customer.count();
      const activeShops = businesses.length;
      
      const prompt = `Provide 3 key insights about this queue management platform:
- Total Active Shops: ${activeShops}
- Total Customers Served: ${totalCustomers}
- Average shops per city: ${(activeShops / 10).toFixed(1)}

Give brief, data-driven insights for the platform owner.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Cache the result
      this.setCache('platform-insights', text);
      return text;
    } catch (error) {
      // Only log the error once to avoid spam
      if (!this.errorLogged) {
        console.error('⚠️  Gemini AI insights unavailable:', error.message);
        this.errorLogged = true;
      }
      return null;
    }
  }
}

export const geminiAnalytics = new GeminiAnalyticsService();
