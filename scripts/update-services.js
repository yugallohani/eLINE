import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateServices() {
  try {
    console.log('🔄 Updating services...');
    
    // Get the demo business
    const business = await prisma.business.findUnique({
      where: { barberCode: 'BARBER-DEMO01' }
    });
    
    if (!business) {
      console.error('❌ Demo business not found');
      return;
    }
    
    // Delete all existing services for this business
    await prisma.service.deleteMany({
      where: { businessId: business.id }
    });
    
    console.log('✅ Cleared existing services');
    
    // Create new services
    const services = await prisma.service.createMany({
      data: [
        {
          businessId: business.id,
          name: 'Haircut (Men)',
          duration: 25,
          icon: '✂️',
          price: 150.00,
          description: 'Professional men\'s haircut with styling',
          active: true
        },
        {
          businessId: business.id,
          name: 'Haircut (Women)',
          duration: 40,
          icon: '✂️',
          price: 300.00,
          description: 'Basic women\'s haircut with styling',
          active: true
        },
        {
          businessId: business.id,
          name: 'Beard Trim',
          duration: 15,
          icon: '🧔',
          price: 80.00,
          description: 'Beard shaping and trimming',
          active: true
        },
        {
          businessId: business.id,
          name: 'Hair Spa',
          duration: 45,
          icon: '💆',
          price: 300.00,
          description: 'Relaxing hair spa treatment',
          active: true
        },
        {
          businessId: business.id,
          name: 'Facial (Basic)',
          duration: 30,
          icon: '😊',
          price: 600.00,
          description: 'Basic facial treatment',
          active: true
        },
        {
          businessId: business.id,
          name: 'Waxing (Arms/Legs)',
          duration: 30,
          icon: '✨',
          price: 300.00,
          description: 'Arms and legs waxing service',
          active: true
        }
      ]
    });
    
    console.log(`✅ Created ${services.count} new services`);
    console.log('\n📋 Services List:');
    console.log('1. Haircut (Men) - ₹150 - 25 min');
    console.log('2. Haircut (Women) - ₹300 - 40 min');
    console.log('3. Beard Trim - ₹80 - 15 min');
    console.log('4. Hair Spa - ₹300 - 45 min');
    console.log('5. Facial (Basic) - ₹600 - 30 min');
    console.log('6. Waxing (Arms/Legs) - ₹300 - 30 min');
    
  } catch (error) {
    console.error('❌ Error updating services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateServices();
