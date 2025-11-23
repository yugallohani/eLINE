import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateAnalytics() {
  try {
    console.log('🔄 Generating analytics from existing customer data...');

    // Get all businesses
    const businesses = await prisma.business.findMany({
      where: { status: 'approved' }
    });

    if (businesses.length === 0) {
      console.log('⚠️  No approved businesses found');
      return;
    }

    // Generate analytics for last 30 days
    const today = new Date();
    const daysToGenerate = 30;

    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      for (const business of businesses) {
        // Get customers for this day
        const customers = await prisma.customer.findMany({
          where: {
            businessId: business.id,
            createdAt: {
              gte: date,
              lt: nextDay
            }
          },
          include: { service: true }
        });

        if (customers.length === 0) continue;

        // Calculate metrics
        const completed = customers.filter(c => c.status === 'completed');
        const cancelled = customers.filter(c => c.status === 'cancelled');
        const noShows = customers.filter(c => c.status === 'no_show');

        const waitTimes = customers
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
        const revenue = completed.reduce((sum, c) => sum + (c.service?.price || 0), 0);

        // Check if analytics already exists
        const existing = await prisma.analytics.findFirst({
          where: {
            businessId: business.id,
            date: date
          }
        });

        if (existing) {
          // Update existing
          await prisma.analytics.update({
            where: { id: existing.id },
            data: {
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
        } else {
          // Create new
          await prisma.analytics.create({
            data: {
              businessId: business.id,
              date: date,
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
        }

        console.log(`✅ Generated analytics for ${business.name} on ${date.toDateString()}`);
      }
    }

    console.log('✅ Analytics generation complete!');
  } catch (error) {
    console.error('❌ Error generating analytics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateAnalytics();
