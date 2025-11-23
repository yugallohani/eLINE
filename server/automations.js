import cron from 'node-cron';
import prisma from './database.js';
import { notificationService } from './notifications.js';

class AutomationService {
  constructor() {
    this.jobs = [];
  }

  // Start all automation jobs
  start() {
    console.log('🤖 Starting automation services...');

    // Check for no-shows every 5 minutes
    this.jobs.push(
      cron.schedule('*/5 * * * *', () => this.handleNoShows())
    );

    // Send feedback requests every 10 minutes
    this.jobs.push(
      cron.schedule('*/10 * * * *', () => this.sendFeedbackRequests())
    );

    // Update loyalty points every hour
    this.jobs.push(
      cron.schedule('0 * * * *', () => this.updateLoyaltyPoints())
    );

    // Generate daily analytics at midnight
    this.jobs.push(
      cron.schedule('0 0 * * *', () => this.generateDailyAnalytics())
    );

    // Check for upcoming turns every 2 minutes
    this.jobs.push(
      cron.schedule('*/2 * * * *', () => this.notifyUpcomingTurns())
    );

    console.log('✅ Automation services started');
  }

  // Stop all jobs
  stop() {
    this.jobs.forEach(job => job.stop());
    console.log('🛑 Automation services stopped');
  }

  // Handle no-show customers
  async handleNoShows() {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Find customers who were notified but didn't show up
      const noShows = await prisma.customer.findMany({
        where: {
          status: 'serving',
          notifiedAt: {
            lt: fifteenMinutesAgo
          }
        },
        include: {
          service: true,
          business: true
        }
      });

      for (const customer of noShows) {
        // Mark as no-show
        await prisma.customer.update({
          where: { id: customer.id },
          data: { 
            status: 'no_show',
            completedAt: new Date()
          }
        });

        // Send courtesy message
        await notificationService.sendNoShowMessage(customer);

        // Log automation
        await prisma.automationLog.create({
          data: {
            type: 'no_show_removal',
            customerId: customer.id,
            status: 'completed',
            result: { action: 'marked_as_no_show' }
          }
        });

        console.log(`🚫 Marked customer ${customer.name} as no-show`);
      }
    } catch (error) {
      console.error('❌ No-show handling failed:', error);
      await prisma.automationLog.create({
        data: {
          type: 'no_show_removal',
          status: 'failed',
          error: error.message
        }
      });
    }
  }

  // Send feedback requests to completed customers
  async sendFeedbackRequests() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Find recently completed customers who haven't received feedback request
      const customers = await prisma.customer.findMany({
        where: {
          status: 'completed',
          completedAt: {
            gte: oneHourAgo,
            lte: fiveMinutesAgo
          },
          notificationsSent: {
            path: ['feedback'],
            equals: null
          }
        },
        include: {
          service: true,
          business: true
        }
      });

      for (const customer of customers) {
        await notificationService.sendFeedbackRequest(customer);

        // Update notifications sent
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            notificationsSent: {
              ...customer.notificationsSent,
              feedback: new Date().toISOString()
            }
          }
        });

        await prisma.automationLog.create({
          data: {
            type: 'feedback_request',
            customerId: customer.id,
            status: 'completed'
          }
        });

        console.log(`💬 Sent feedback request to ${customer.name}`);
      }
    } catch (error) {
      console.error('❌ Feedback request failed:', error);
    }
  }

  // Update loyalty points for repeat customers
  async updateLoyaltyPoints() {
    try {
      const completedToday = await prisma.customer.findMany({
        where: {
          status: 'completed',
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        include: {
          service: true
        }
      });

      for (const customer of completedToday) {
        // Find or create customer visit record
        const visit = await prisma.customerVisit.upsert({
          where: {
            customerId_phone: {
              customerId: customer.id,
              phone: customer.phone
            }
          },
          update: {
            visitCount: { increment: 1 },
            lastVisit: new Date(),
            loyaltyPoints: { increment: 10 },
            totalSpent: { increment: customer.service.price || 0 }
          },
          create: {
            customerId: customer.id,
            phone: customer.phone,
            visitCount: 1,
            loyaltyPoints: 10,
            totalSpent: customer.service.price || 0
          }
        });

        // Check if customer earned a reward (every 5 visits)
        if (visit.visitCount % 5 === 0) {
          await notificationService.sendLoyaltyReward(customer, visit);

          await prisma.automationLog.create({
            data: {
              type: 'loyalty_reward',
              customerId: customer.id,
              status: 'completed',
              result: { visitCount: visit.visitCount }
            }
          });

          console.log(`🎁 Sent loyalty reward to ${customer.name}`);
        }
      }
    } catch (error) {
      console.error('❌ Loyalty update failed:', error);
    }
  }

  // Generate daily analytics
  async generateDailyAnalytics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const businesses = await prisma.business.findMany();

      for (const business of businesses) {
        const customers = await prisma.customer.findMany({
          where: {
            businessId: business.id,
            createdAt: { gte: today }
          }
        });

        const completed = customers.filter(c => c.status === 'completed');
        const cancelled = customers.filter(c => c.status === 'cancelled');
        const noShows = customers.filter(c => c.status === 'no_show');

        // Calculate average wait time
        const waitTimes = completed
          .filter(c => c.actualWait)
          .map(c => c.actualWait);
        const avgWaitTime = waitTimes.length > 0
          ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length
          : null;

        // Find peak hour
        const hourCounts = {};
        customers.forEach(c => {
          const hour = new Date(c.joinedAt).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        const peakHour = Object.entries(hourCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0];

        // Calculate revenue
        const revenue = await prisma.customer.findMany({
          where: {
            businessId: business.id,
            status: 'completed',
            createdAt: { gte: today }
          },
          include: { service: true }
        }).then(customers => 
          customers.reduce((sum, c) => sum + (c.service.price || 0), 0)
        );

        await prisma.analytics.create({
          data: {
            businessId: business.id,
            date: today,
            totalCustomers: customers.length,
            completedServices: completed.length,
            cancelledServices: cancelled.length,
            noShows: noShows.length,
            avgWaitTime,
            peakHour: peakHour ? parseInt(peakHour) : null,
            revenue,
            metadata: {
              hourlyDistribution: hourCounts
            }
          }
        });

        console.log(`📊 Generated analytics for ${business.name}`);
      }
    } catch (error) {
      console.error('❌ Analytics generation failed:', error);
    }
  }

  // Notify customers when their turn is approaching
  async notifyUpcomingTurns() {
    try {
      // Find active customers who are 1-2 positions away
      const activeCustomers = await prisma.customer.findMany({
        where: {
          status: 'active',
          notificationsSent: {
            path: ['upcoming'],
            equals: null
          }
        },
        include: {
          service: true,
          business: true
        },
        orderBy: {
          joinedAt: 'asc'
        }
      });

      for (const customer of activeCustomers) {
        // Get position in queue
        const position = await this.getQueuePosition(customer);

        // Notify if 1-2 people ahead
        if (position <= 2 && position > 0) {
          await notificationService.sendUpcomingNotification(customer, position);

          await prisma.customer.update({
            where: { id: customer.id },
            data: {
              notificationsSent: {
                ...customer.notificationsSent,
                upcoming: new Date().toISOString()
              }
            }
          });

          console.log(`🔔 Notified ${customer.name} - ${position} ahead`);
        }
      }
    } catch (error) {
      console.error('❌ Upcoming notification failed:', error);
    }
  }

  // Get customer position in queue
  async getQueuePosition(customer) {
    const ahead = await prisma.customer.count({
      where: {
        businessId: customer.businessId,
        status: { in: ['active', 'serving'] },
        joinedAt: { lt: customer.joinedAt }
      }
    });
    return ahead;
  }
}

export const automationService = new AutomationService();
