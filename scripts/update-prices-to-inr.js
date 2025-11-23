import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePricesToINR() {
  try {
    console.log('💰 Updating service prices to Indian Rupees...');
    
    // Get all services
    const services = await prisma.service.findMany();
    
    console.log(`Found ${services.length} services to update`);
    
    // Price conversion mapping (approximate USD to INR)
    const priceMap = {
      15: 149,   // $15 → ₹149
      18: 199,   // $18 → ₹199
      25: 299,   // $25 → ₹299
      35: 399,   // $35 → ₹399
      50: 799    // $50 → ₹799
    };
    
    for (const service of services) {
      const oldPrice = service.price;
      const newPrice = priceMap[oldPrice] || oldPrice * 80; // Default conversion rate
      
      await prisma.service.update({
        where: { id: service.id },
        data: { price: newPrice }
      });
      
      console.log(`✅ Updated ${service.name}: $${oldPrice} → ₹${newPrice}`);
    }
    
    console.log('\n🎉 All prices updated to Indian Rupees!');
    
  } catch (error) {
    console.error('❌ Error updating prices:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePricesToINR();
