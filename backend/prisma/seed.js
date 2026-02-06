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

  // Create Units
  console.log('Creating units...');
  const unitsData = [
    { name: 'piece', description: 'Individual pieces' },
    { name: 'kg', description: 'Kilograms' },
    { name: 'liter', description: 'Liters' },
    { name: 'box', description: 'Boxes' },
    { name: 'pack', description: 'Packs' },
    { name: 'bottle', description: 'Bottles' },
  ];

  for (const unitData of unitsData) {
    await prisma.unit.upsert({
      where: { name: unitData.name },
      update: {},
      create: unitData,
    });
  }

  // Create Admin User
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin1', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@wholesaler.com',
      name: 'Mete Sevim',
      role: 'Admin',
      permissions: ['MANAGE_INVENTORY', 'MANAGE_ORDERS', 'VIEW_CUSTOMERS'],
    },
  });

  // Create Admin Inventory
  const adminInventory = await prisma.adminInventory.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
    },
  });

  // Create Categories
  console.log('Creating categories...');
  const category1 = await prisma.category.upsert({
    where: { name: 'Vegetables' },
    update: {},
    create: { name: 'Vegetables', description: 'Fresh vegetables' },
  });

  const category2 = await prisma.category.upsert({
    where: { name: 'Fruits' },
    update: {},
    create: { name: 'Fruits', description: 'Fresh fruits' },
  });

  const category3 = await prisma.category.upsert({
    where: { name: 'Dairy' },
    update: {},
    create: { name: 'Dairy', description: 'Dairy products' },
  });

  const category4 = await prisma.category.upsert({
    where: { name: 'Bakery' },
    update: {},
    create: { name: 'Bakery', description: 'Bakery products' },
  });

  const category5 = await prisma.category.upsert({
    where: { name: 'Spices' },
    update: {},
    create: { name: 'Spices', description: 'Spices and seasonings' },
  });

  const category6 = await prisma.category.upsert({
    where: { name: 'Pantry' },
    update: {},
    create: { name: 'Pantry', description: 'Pantry staples' },
  });

  const category7 = await prisma.category.upsert({
    where: { name: 'Meat' },
    update: {},
    create: { name: 'Meat', description: 'Meat products' },
  });

  // Create Providers
  console.log('Creating providers...');
  const provider1 = await prisma.provider.upsert({
    where: { email: 'localfarm@supplier.com' },
    update: {},
    create: {
      name: 'Local Farm',
      email: 'localfarm@supplier.com',
      phone: '+39 06 1111111',
      address: 'Farm Road 1',
      city: 'Rome',
      country: 'Italy',
      iban: 'IT60X0542811101000000111111',
    },
  });

  const provider2 = await prisma.provider.upsert({
    where: { email: 'italiansupplier@supplier.com' },
    update: {},
    create: {
      name: 'Italian Supplier',
      email: 'italiansupplier@supplier.com',
      phone: '+39 081 2222222',
      address: 'Supplier Street 2',
      city: 'Naples',
      country: 'Italy',
      iban: 'IT60X0542811101000000222222',
    },
  });

  const provider3 = await prisma.provider.upsert({
    where: { email: 'bakeryco@supplier.com' },
    update: {},
    create: {
      name: 'Bakery Co',
      email: 'bakeryco@supplier.com',
      phone: '+39 041 3333333',
      address: 'Bakery Lane 3',
      city: 'Venice',
      country: 'Italy',
      iban: 'IT60X0542811101000000333333',
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
      categoryId: category1.id,
      providerId: provider1.id,
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
      categoryId: category6.id,
      providerId: provider2.id,
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
      categoryId: category6.id,
      providerId: provider2.id,
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
      categoryId: category3.id,
      providerId: provider2.id,
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
      categoryId: category6.id,
      providerId: provider2.id,
    },
  });

  // Additional 25 items
  const item6 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Bread',
      description: 'Fresh bakery bread',
      productCode: 'BRD001',
      quantity: 150,
      unit: 'piece',
      pricePerUnit: 1.20,
      minimumCapacity: 20,
      maximumCapacity: 200,
      productionDate: new Date('2026-02-01'),
      expiryDate: new Date('2026-02-08'),
      categoryId: category4.id,
      providerId: provider3.id,
    },
  });

  const item7 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Milk',
      description: 'Fresh cow milk',
      productCode: 'MLK001',
      quantity: 80,
      unit: 'liter',
      pricePerUnit: 1.50,
      minimumCapacity: 10,
      maximumCapacity: 100,
      productionDate: new Date('2026-02-02'),
      expiryDate: new Date('2026-02-15'),
      categoryId: category3.id,
      providerId: provider2.id,
    },
  });

  const item8 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Eggs',
      description: 'Organic free-range eggs',
      productCode: 'EGG001',
      quantity: 200,
      unit: 'piece',
      pricePerUnit: 0.30,
      minimumCapacity: 50,
      maximumCapacity: 300,
      productionDate: new Date('2026-02-03'),
      expiryDate: new Date('2026-02-20'),
      categoryId: category3.id,
      providerId: provider2.id,
    },
  });

  const item9 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Chicken',
      description: 'Fresh chicken breast',
      productCode: 'CHK001',
      quantity: 60,
      unit: 'kg',
      pricePerUnit: 8.00,
      minimumCapacity: 15,
      maximumCapacity: 80,
      productionDate: new Date('2026-02-04'),
      expiryDate: new Date('2026-02-11'),
      categoryId: category7.id,
      providerId: provider2.id,
    },
  });

  const item10 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Rice',
      description: 'Long grain white rice',
      productCode: 'RIC001',
      quantity: 120,
      unit: 'kg',
      pricePerUnit: 2.00,
      minimumCapacity: 30,
      maximumCapacity: 150,
      productionDate: new Date('2026-01-30'),
      expiryDate: new Date('2027-01-30'),
      categoryId: category6.id,
      providerId: provider2.id,
    },
  });

  const item11 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Potatoes',
      description: 'Fresh potatoes',
      productCode: 'POT001',
      quantity: 300,
      unit: 'kg',
      pricePerUnit: 0.80,
      minimumCapacity: 50,
      maximumCapacity: 400,
      productionDate: new Date('2026-02-05'),
      expiryDate: new Date('2026-03-05'),
      categoryId: category1.id,
      providerId: provider1.id,
    },
  });

  const item12 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Onions',
      description: 'Yellow onions',
      productCode: 'ONI001',
      quantity: 250,
      unit: 'kg',
      pricePerUnit: 1.00,
      minimumCapacity: 40,
      maximumCapacity: 300,
      productionDate: new Date('2026-02-06'),
      expiryDate: new Date('2026-03-06'),
      categoryId: category1.id,
      providerId: provider1.id,
    },
  });

  const item13 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Garlic',
      description: 'Fresh garlic bulbs',
      productCode: 'GAR001',
      quantity: 50,
      unit: 'kg',
      pricePerUnit: 3.00,
      minimumCapacity: 10,
      maximumCapacity: 70,
      productionDate: new Date('2026-02-07'),
      expiryDate: new Date('2026-04-07'),
      categoryId: category1.id,
      providerId: provider1.id,
    },
  });

  const item14 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Carrots',
      description: 'Organic carrots',
      productCode: 'CAR001',
      quantity: 180,
      unit: 'kg',
      pricePerUnit: 1.50,
      minimumCapacity: 30,
      maximumCapacity: 250,
      productionDate: new Date('2026-02-08'),
      expiryDate: new Date('2026-03-08'),
      categoryId: category1.id,
      providerId: provider1.id,
    },
  });

  const item15 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Lettuce',
      description: 'Fresh romaine lettuce',
      productCode: 'LET001',
      quantity: 100,
      unit: 'piece',
      pricePerUnit: 1.20,
      minimumCapacity: 20,
      maximumCapacity: 150,
      productionDate: new Date('2026-02-09'),
      expiryDate: new Date('2026-02-16'),
      categoryId: category1.id,
      providerId: provider1.id,
    },
  });

  const item16 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Apples',
      description: 'Red delicious apples',
      productCode: 'APP001',
      quantity: 200,
      unit: 'kg',
      pricePerUnit: 2.50,
      minimumCapacity: 40,
      maximumCapacity: 300,
      productionDate: new Date('2026-02-10'),
      expiryDate: new Date('2026-03-10'),
      categoryId: category2.id,
      providerId: provider1.id,
    },
  });

  const item17 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Bananas',
      description: 'Ripe bananas',
      productCode: 'BAN001',
      quantity: 150,
      unit: 'kg',
      pricePerUnit: 1.80,
      minimumCapacity: 30,
      maximumCapacity: 200,
      productionDate: new Date('2026-02-11'),
      expiryDate: new Date('2026-02-25'),
      categoryId: category2.id,
      providerId: provider1.id,
    },
  });

  const item18 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Oranges',
      description: 'Juicy oranges',
      productCode: 'ORA001',
      quantity: 120,
      unit: 'kg',
      pricePerUnit: 2.20,
      minimumCapacity: 25,
      maximumCapacity: 180,
      productionDate: new Date('2026-02-12'),
      expiryDate: new Date('2026-03-12'),
      categoryId: category2.id,
      providerId: provider1.id,
    },
  });

  const item19 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Strawberries',
      description: 'Fresh strawberries',
      productCode: 'STR001',
      quantity: 80,
      unit: 'kg',
      pricePerUnit: 4.00,
      minimumCapacity: 15,
      maximumCapacity: 120,
      productionDate: new Date('2026-02-13'),
      expiryDate: new Date('2026-02-20'),
      categoryId: category2.id,
      providerId: provider1.id,
    },
  });

  const item20 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Blueberries',
      description: 'Wild blueberries',
      productCode: 'BLU001',
      quantity: 60,
      unit: 'kg',
      pricePerUnit: 5.00,
      minimumCapacity: 10,
      maximumCapacity: 90,
      productionDate: new Date('2026-02-14'),
      expiryDate: new Date('2026-02-28'),
      categoryId: category2.id,
      providerId: provider1.id,
    },
  });

  const item21 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Flour',
      description: 'All-purpose wheat flour',
      productCode: 'FLO001',
      quantity: 100,
      unit: 'kg',
      pricePerUnit: 1.00,
      minimumCapacity: 20,
      maximumCapacity: 150,
      productionDate: new Date('2026-01-25'),
      expiryDate: new Date('2027-01-25'),
      categoryId: category6.id,
      providerId: provider2.id,
    },
  });

  const item22 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Sugar',
      description: 'White granulated sugar',
      productCode: 'SUG001',
      quantity: 90,
      unit: 'kg',
      pricePerUnit: 1.20,
      minimumCapacity: 15,
      maximumCapacity: 120,
      productionDate: new Date('2026-01-20'),
      expiryDate: new Date('2028-01-20'),
      categoryId: category6.id,
      providerId: provider2.id,
    },
  });

  const item23 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Salt',
      description: 'Sea salt',
      productCode: 'SAL001',
      quantity: 70,
      unit: 'kg',
      pricePerUnit: 0.80,
      minimumCapacity: 10,
      maximumCapacity: 100,
      productionDate: new Date('2026-01-15'),
      expiryDate: new Date('2029-01-15'),
      categoryId: category5.id,
      providerId: provider2.id,
    },
  });

  const item24 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Pepper',
      description: 'Black peppercorns',
      productCode: 'PEP001',
      quantity: 40,
      unit: 'kg',
      pricePerUnit: 6.00,
      minimumCapacity: 5,
      maximumCapacity: 60,
      productionDate: new Date('2026-01-10'),
      expiryDate: new Date('2028-01-10'),
      categoryId: category5.id,
      providerId: provider2.id,
    },
  });

  const item25 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Olive Oil Extra Virgin',
      description: 'Premium extra virgin olive oil',
      productCode: 'OIL002',
      quantity: 45,
      unit: 'liter',
      pricePerUnit: 18.00,
      minimumCapacity: 10,
      maximumCapacity: 70,
      productionDate: new Date('2026-02-01'),
      expiryDate: new Date('2028-02-01'),
      categoryId: category6.id,
      providerId: provider2.id,
    },
  });

  const item26 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Vinegar',
      description: 'Balsamic vinegar',
      productCode: 'VIN001',
      quantity: 35,
      unit: 'liter',
      pricePerUnit: 5.00,
      minimumCapacity: 5,
      maximumCapacity: 50,
      productionDate: new Date('2026-01-28'),
      expiryDate: new Date('2028-01-28'),
      categoryId: category6.id,
      providerId: provider2.id,
    },
  });

  const item27 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Honey',
      description: 'Pure honey',
      productCode: 'HON001',
      quantity: 55,
      unit: 'kg',
      pricePerUnit: 7.00,
      minimumCapacity: 10,
      maximumCapacity: 80,
      productionDate: new Date('2026-02-02'),
      expiryDate: new Date('2027-02-02'),
      categoryId: category6.id,
      providerId: provider2.id,
    },
  });

  const item28 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Butter',
      description: 'Unsalted butter',
      productCode: 'BUT001',
      quantity: 65,
      unit: 'kg',
      pricePerUnit: 4.50,
      minimumCapacity: 15,
      maximumCapacity: 100,
      productionDate: new Date('2026-02-03'),
      expiryDate: new Date('2026-03-03'),
      categoryId: category3.id,
      providerId: provider2.id,
    },
  });

  const item29 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Yogurt',
      description: 'Greek yogurt',
      productCode: 'YOG001',
      quantity: 85,
      unit: 'kg',
      pricePerUnit: 3.00,
      minimumCapacity: 20,
      maximumCapacity: 120,
      productionDate: new Date('2026-02-04'),
      expiryDate: new Date('2026-02-18'),
      categoryId: category3.id,
      providerId: provider2.id,
    },
  });

  const item30 = await prisma.adminInventoryItem.create({
    data: {
      adminInventoryId: adminInventory.id,
      name: 'Cream',
      description: 'Heavy cream',
      productCode: 'CRE001',
      quantity: 40,
      unit: 'liter',
      pricePerUnit: 3.50,
      minimumCapacity: 8,
      maximumCapacity: 60,
      productionDate: new Date('2026-02-05'),
      expiryDate: new Date('2026-02-19'),
      categoryId: category3.id,
      providerId: provider2.id,
    },
  });

  console.log('Created 30 inventory items');

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
