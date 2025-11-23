import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedDemoBarber() {
  try {
    console.log('🌱 Seeding demo barber...');
    
    // Check if demo barber already exists
    const existing = await prisma.business.findUnique({
      where: { barberCode: 'BARBER-DEMO01' }
    });
    
    if (existing) {
      console.log('✅ Demo barber already exists');
      console.log(`   Shop: ${existing.name}`);
      console.log(`   Barber Code: ${existing.barberCode}`);
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash('demo123', 10);
    
    // Create demo business
    const business = await prisma.business.create({
      data: {
        name: 'Demo Salon',
        subdomain: 'demo',
        ownerName: 'Demo Owner',
        phone: '+1234567890',
        email: 'demo@eline.app',
        address: '123 Main Street, Demo City',
        street: '123 Main Street',
        area: 'Downtown',
        city: 'Demo City',
        state: 'Demo State',
        pincode: '12345',
        latitude: 40.7128,
        longitude: -74.0060,
        numberOfBarbers: 3,
        description: 'Premium barber shop with experienced professionals',
        status: 'approved',
        barberCode: 'BARBER-DEMO01',
        passwordHash,
        verifiedAt: new Date(),
        operatingHours: {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '20:00' },
          saturday: { open: '10:00', close: '20:00' },
          sunday: { open: '10:00', close: '16:00' }
        }
      }
    });
    
    console.log('✅ Demo business created');
    console.log(`   ID: ${business.id}`);
    console.log(`   Name: ${business.name}`);
    console.log(`   Barber Code: ${business.barberCode}`);
    console.log(`   Password: demo123`);
    
    // Create demo services
    const services = await prisma.service.createMany({
      data: [
        {
          businessId: business.id,
          name: 'Haircut (Men)',
          duration: 25,
          icon: '✂️',
          price: 150.00,
          description: 'Professional men\'s haircut with styling'
        },
        {
          businessId: business.id,
          name: 'Haircut (Women)',
          duration: 40,
          icon: '✂️',
          price: 300.00,
          description: 'Basic women\'s haircut with styling'
        },
        {
          businessId: business.id,
          name: 'Beard Trim',
          duration: 15,
          icon: '🧔',
          price: 80.00,
          description: 'Beard shaping and trimming'
        },
        {
          businessId: business.id,
          name: 'Hair Spa',
          duration: 45,
          icon: '💆',
          price: 300.00,
          description: 'Relaxing hair spa treatment'
        },
        {
          businessId: business.id,
          name: 'Facial (Basic)',
          duration: 30,
          icon: '😊',
          price: 600.00,
          description: 'Basic facial treatment'
        },
        {
          businessId: business.id,
          name: 'Waxing (Arms/Legs)',
          duration: 30,
          icon: '✨',
          price: 300.00,
          description: 'Arms and legs waxing service'
        }
      ]
    });
    
    console.log(`✅ Created ${services.count} demo services`);
    
    console.log('\n🎉 Demo barber setup complete!');
    console.log('\n📋 Login Credentials:');
    console.log('   URL: http://localhost:5173/barber-login');
    console.log('   Barber Code: BARBER-DEMO01');
    console.log('   Password: demo123');
    
  } catch (error) {
    console.error('❌ Error seeding demo barber:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoBarber();
