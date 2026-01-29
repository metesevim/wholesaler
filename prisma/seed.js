/**
 * Seed Script
 *
 * Populates the database with dummy data for testing
 * Run with: node prisma/seed.js
 */

import prisma from './client.js';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.order.deleteMany();
  await prisma.customerInventoryItem.deleteMany();
  await prisma.customerInventory.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.adminInventoryItem.deleteMany();
  await prisma.adminInventory.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin1', 10);
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      role: 'Admin',
      permissions: ['MANAGE_INVENTORY', 'MANAGE_ORDERS', 'VIEW_CUSTOMERS'],
    },
  });

  // Create Admin Inventory
  const adminInventory = await prisma.adminInventory.create({
    data: {
      userId: adminUser.id,
    },
  });

  // Create Admin Inventory Items
  console.log('Creating inventory items...');
  const item1 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Tomato',
      description: 'Fresh red tomatoes',
      quantity: 100,
      unit: 'kg',
      pricePerUnit: 2.50,
    },
  });

  const item2 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Olive Oil',
      description: 'Premium extra virgin olive oil',
      quantity: 50,
      unit: 'liter',
      pricePerUnit: 15.00,
    },
  });

  const item3 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Pasta',
      description: 'Italian spaghetti pasta',
      quantity: 200,
      unit: 'box',
      pricePerUnit: 1.50,
    },
  });

  const item4 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Cheese',
      description: 'Mozzarella cheese',
      quantity: 75,
      unit: 'kg',
      pricePerUnit: 8.00,
    },
  });

  const item5 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Wine',
      description: 'Red wine from Italy',
      quantity: 30,
      unit: 'liter',
      pricePerUnit: 12.00,
    },
  });

  console.log('Created 5 inventory items');

  // Create Customers
  console.log('Creating customers...');
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Restaurant Milano',
      email: 'info@milano.com',
      phone: '+39 06 1234567',
      address: 'Via Roma 123',
      city: 'Rome',
      country: 'Italy',
      iban: 'IT60X0542811101000000123456',
      inventory: {
        create: {
          items: {
            createMany: {
              data: [
                { adminItemId: item1.id },
                { adminItemId: item2.id },
                { adminItemId: item3.id },
              ],
            },
          },
        },
      },
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Pizzeria Napoli',
      email: 'contact@napoli.com',
      phone: '+39 081 5555555',
      address: 'Via Toledo 456',
      city: 'Naples',
      country: 'Italy',
      iban: 'IT60X0542811101000000234567',
      inventory: {
        create: {
          items: {
            createMany: {
              data: [
                { adminItemId: item1.id },
                { adminItemId: item3.id },
                { adminItemId: item4.id },
              ],
            },
          },
        },
      },
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Trattoria Venezia',
      email: 'hello@venezia.com',
      phone: '+39 041 2222222',
      address: 'Via del Corso 789',
      city: 'Venice',
      country: 'Italy',
      iban: 'IT60X0542811101000000345678',
      inventory: {
        create: {
          items: {
            createMany: {
              data: [
                { adminItemId: item2.id },
                { adminItemId: item4.id },
                { adminItemId: item5.id },
              ],
            },
          },
        },
      },
    },
  });

  console.log('Created 3 customers');

  // Create Orders
  console.log('Creating orders...');
  const order1 = await prisma.order.create({
    data: {
      customerId: customer1.id,
      status: 'DELIVERED',
      items: {
        createMany: {
          data: [
            { adminItemId: item1.id, itemName: 'Tomato', quantity: 5, unit: 'kg', pricePerUnit: 2.50 },
            { adminItemId: item2.id, itemName: 'Olive Oil', quantity: 2, unit: 'liter', pricePerUnit: 15.00 },
          ],
        },
      },
      notes: 'Delivery to main kitchen',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: customer2.id,
      status: 'PROCESSING',
      items: {
        createMany: {
          data: [
            { adminItemId: item3.id, itemName: 'Pasta', quantity: 20, unit: 'box', pricePerUnit: 1.50 },
            { adminItemId: item1.id, itemName: 'Tomato', quantity: 10, unit: 'kg', pricePerUnit: 2.50 },
          ],
        },
      },
      notes: 'Urgent - needed by tomorrow',
    },
  });

  const order3 = await prisma.order.create({
    data: {
      customerId: customer3.id,
      status: 'PENDING',
      items: {
        createMany: {
          data: [
            { adminItemId: item4.id, itemName: 'Cheese', quantity: 8, unit: 'kg', pricePerUnit: 8.00 },
            { adminItemId: item5.id, itemName: 'Wine', quantity: 3, unit: 'liter', pricePerUnit: 12.00 },
          ],
        },
      },
      notes: 'Special event preparation',
    },
  });

  const order4 = await prisma.order.create({
    data: {
      customerId: customer1.id,
      status: 'CONFIRMED',
      items: {
        createMany: {
          data: [
            { adminItemId: item1.id, itemName: 'Tomato', quantity: 15, unit: 'kg', pricePerUnit: 2.50 },
            { adminItemId: item3.id, itemName: 'Pasta', quantity: 30, unit: 'box', pricePerUnit: 1.50 },
            { adminItemId: item4.id, itemName: 'Cheese', quantity: 5, unit: 'kg', pricePerUnit: 8.00 },
          ],
        },
      },
      notes: 'Regular weekly order',
    },
  });

  console.log('Created 4 orders');

  console.log('✅ Database seeded successfully!');
  console.log(`
    Dummy Data Created:
    - 5 Inventory Items
    - 3 Customers
    - 4 Orders
    
    Sample Customers:
    1. Restaurant Milano - info@milano.com
    2. Pizzeria Napoli - contact@napoli.com
    3. Trattoria Venezia - hello@venezia.com
  `);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
