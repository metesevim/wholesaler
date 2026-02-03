const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking inventory items...');

    // Get all items
    const items = await prisma.adminInventoryItem.findMany();

    console.log(`Found ${items.length} items:`);
    items.forEach(item => {
      console.log(`  - ${item.name}: quantity=${item.quantity}, lowStockAlert=${item.lowStockAlert}`);
    });

    // Update any NULL or undefined lowStockAlert values
    console.log('\nUpdating items with NULL/undefined lowStockAlert...');
    const updated = await prisma.adminInventoryItem.updateMany({
      where: {
        lowStockAlert: null
      },
      data: {
        lowStockAlert: 20
      }
    });

    console.log(`Updated ${updated.count} items`);

    // Get all items again to verify
    const itemsAfter = await prisma.adminInventoryItem.findMany();

    console.log(`\nItems after update:`);
    itemsAfter.forEach(item => {
      console.log(`  - ${item.name}: quantity=${item.quantity}, lowStockAlert=${item.lowStockAlert}`);
      const isLow = item.quantity < (item.lowStockAlert || 20);
      console.log(`    -> Low stock alert: ${isLow ? 'YES' : 'NO'}`);
    });

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
