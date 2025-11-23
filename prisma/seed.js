import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default business
  const business = await prisma.business.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Salon',
      subdomain: 'demo',
      ownerName: 'Demo Owner',
      phone: '+1234567890',
      email: 'demo@eline.app',
      address: '123 Main Street, Demo City',
      city: 'Demo City',
      state: 'Demo State',
      pincode: '123456',
      primaryColor: '#6366f1',
      status: 'approved',
      barberCode: 'BARBER-DEMO01',
      operatingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { closed: true }
      }
    }
  });

  console.log('✅ Created business:', business.name);

  // Create default services
  const services = [
    { name: 'Haircut', duration: 25, icon: '✂️', price: 25 },
    { name: 'Hair Spa', duration: 45, icon: '💆', price: 45 },
    { name: 'Beard Trim', duration: 15, icon: '🪒', price: 15 },
    { name: 'Hair Color', duration: 60, icon: '🎨', price: 60 },
    { name: 'Consultation', duration: 15, icon: '👨‍⚕️', price: 0 },
    { name: 'Blood Test', duration: 10, icon: '💉', price: 30 }
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { 
        id: `${business.id}-${service.name.toLowerCase().replace(/\s+/g, '-')}` 
      },
      update: {},
      create: {
        id: `${business.id}-${service.name.toLowerCase().replace(/\s+/g, '-')}`,
        businessId: business.id,
        ...service
      }
    });
  }

  console.log('✅ Created services');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
