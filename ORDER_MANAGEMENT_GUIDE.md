# Order Management System - Implementation Guide

## Overview

A comprehensive order management system has been implemented with the following key features:

### Three-Tier Inventory Structure

1. **Admin Inventory** - The main warehouse inventory managed by Admin/Employee users
2. **Customer Inventory** - Items assigned to specific customers (sourced from Admin Inventory)
3. **Orders** - Customer orders that consume inventory items with specified quantities

---

## Database Schema

### Models Created

#### 1. **Customer**
Stores customer information and links to their inventory.

```prisma
model Customer {
  id        Int
  name      String
  email     String (unique)
  phone     String?
  address   String?
  city      String?
  country   String?
  inventory CustomerInventory?
  orders    Order[]
}
```

#### 2. **AdminInventory**
Central inventory managed by admin users. Links to a single admin user.

```prisma
model AdminInventory {
  id     Int
  userId Int (unique)  // Links to Admin user
  user   User
  items  AdminInventoryItem[]
}
```

#### 3. **AdminInventoryItem**
Individual items in the admin inventory with mass information.

```prisma
model AdminInventoryItem {
  id            Int
  name          String
  description   String?
  quantity      Int         // Current stock count
  unit          String      // "piece", "kg", "liter", etc.
  imageUrl      String?     // Image of the item
  pricePerUnit  Float?      // Price per unit
  // ... relationships to customer items and order items
}
```

#### 4. **CustomerInventory**
Inventory assigned to a specific customer.

```prisma
model CustomerInventory {
  id         Int
  customerId Int (unique)
  customer   Customer
  items      CustomerInventoryItem[]
}
```

#### 5. **CustomerInventoryItem**
Items in a customer's inventory. Links to admin inventory items without mass information.

```prisma
model CustomerInventoryItem {
  id                 Int
  customerInventoryId Int
  customerInventory   CustomerInventory
  adminItemId        Int
  adminItem          AdminInventoryItem
  // No mass info stored here - items are just marked as "available"
}
```

#### 6. **Order**
Customer orders with status tracking.

```prisma
model Order {
  id          Int
  customerId  Int
  customer    Customer
  status      OrderStatus    // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  items       OrderItem[]
  totalAmount Float
  notes       String?
}
```

#### 7. **OrderItem**
Individual items within an order with quantity and unit specifications.

```prisma
model OrderItem {
  id          Int
  orderId     Int
  order       Order
  adminItemId Int
  adminItem   AdminInventoryItem
  itemName    String
  unit        String         // Unit specified at order time
  quantity    Float          // Quantity ordered
  pricePerUnit Float?
  totalPrice  Float?
}
```

---

## API Endpoints

### Customer Management (`/customers`)

#### Create Customer
```
POST /customers
Permission: CREATE_CUSTOMER

Body: {
  "name": "Company Name",
  "email": "contact@company.com",
  "phone": "123-456-7890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "itemIds": [1, 2, 3]  // Optional: Admin inventory item IDs to assign
}

Response:
{
  "message": "Customer created successfully.",
  "customer": {
    "id": 1,
    "name": "Company Name",
    "email": "contact@company.com",
    "inventory": {
      "id": 1,
      "items": [...]
    }
  }
}
```

#### Get All Customers
```
GET /customers
Permission: VIEW_CUSTOMERS

Response: Array of customers with their inventories
```

#### Get Customer by ID
```
GET /customers/:id
Permission: VIEW_CUSTOMERS

Response: Single customer with full inventory details
```

#### Update Customer
```
PUT /customers/:id
Permission: EDIT_CUSTOMERS

Body: Updated customer fields (name, email, phone, etc.)

Response: Updated customer object
```

#### Get Customer Inventory
```
GET /customers/:id/inventory
Permission: VIEW_CUSTOMERS

Response: Customer's inventory with all assigned items
```

#### Add Items to Customer Inventory
```
POST /customers/:id/inventory/items
Permission: EDIT_CUSTOMERS

Body: {
  "itemIds": [1, 2, 3]  // Admin inventory item IDs to add
}

Response: { "message": "...", "count": 3 }
```

#### Remove Items from Customer Inventory
```
DELETE /customers/:id/inventory/items
Permission: EDIT_CUSTOMERS

Body: {
  "itemIds": [1, 2, 3]  // Item IDs to remove
}

Response: { "message": "...", "count": 3 }
```

---

### Inventory Management (`/inventory`)

#### Create Inventory Item
```
POST /inventory/items
Permission: CREATE_PRODUCT

Body: {
  "name": "Tomatoes",
  "description": "Fresh Roma tomatoes",
  "quantity": 500,
  "unit": "kg",
  "imageUrl": "https://...",
  "pricePerUnit": 2.50
}

Response: Created item with ID
```

#### Get All Admin Inventory Items
```
GET /inventory/items
Permission: VIEW_PRODUCTS

Response: Array of all inventory items with current stock
```

#### Get Item by ID
```
GET /inventory/items/:id
Permission: VIEW_PRODUCTS

Response: Single item with full details
```

#### Update Item
```
PUT /inventory/items/:id
Permission: EDIT_PRODUCT

Body: Updated item fields

Response: Updated item
```

#### Delete Item
```
DELETE /inventory/items/:id
Permission: EDIT_PRODUCT

Note: Cannot delete if item is in active orders

Response: Deleted item
```

#### Adjust Inventory Quantity
```
POST /inventory/items/:id/adjust
Permission: EDIT_PRODUCT

Body: {
  "adjustment": 50,      // Can be positive or negative
  "reason": "Stock received from supplier"
}

Response: {
  "previousQuantity": 500,
  "newQuantity": 550,
  "adjustment": 50
}
```

#### Get Inventory Summary
```
GET /inventory/summary
Permission: VIEW_PRODUCTS

Response: {
  "totalItems": 10,
  "totalValue": 5000,
  "items": [
    {
      "id": 1,
      "name": "Tomatoes",
      "quantity": 500,
      "lowStock": false,
      "estimatedValue": 1250
    }
  ]
}
```

---

### Order Management (`/orders`)

#### Create Order
```
POST /orders
Permission: CREATE_ORDER

Body: {
  "customerId": 1,
  "items": [
    {
      "adminItemId": 1,
      "quantity": 50,
      "unit": "kg"
    },
    {
      "adminItemId": 2,
      "quantity": 100,
      "unit": "piece"
    }
  ],
  "notes": "Urgent delivery needed"
}

Response: {
  "message": "Order created successfully. Inventory updated.",
  "order": {
    "id": 1,
    "customerId": 1,
    "status": "PENDING",
    "items": [...],
    "totalAmount": 275.50,
    "createdAt": "..."
  }
}

Note: Automatically reduces admin inventory quantities after order creation
```

#### Get All Orders
```
GET /orders?status=PENDING&customerId=1
Permission: VIEW_ORDERS

Query Parameters:
  - status: PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED
  - customerId: Filter by customer

Response: Array of orders with items and customer info
```

#### Get Order by ID
```
GET /orders/:id
Permission: VIEW_ORDERS

Response: Single order with all items and customer details
```

#### Get Customer Orders
```
GET /orders/customer/:customerId?status=SHIPPED
Permission: VIEW_ORDERS

Response: All orders for a specific customer
```

#### Update Order Status
```
PUT /orders/:id/status
Permission: EDIT_ORDERS

Body: {
  "status": "PROCESSING"
}

Valid statuses: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED

Response: Updated order
```

#### Add Item to Pending Order
```
POST /orders/:id/items
Permission: EDIT_ORDERS

Body: {
  "adminItemId": 3,
  "quantity": 25,
  "unit": "kg"
}

Note: Can only add items to PENDING orders

Response: Updated order with new item added
```

#### Cancel Order
```
POST /orders/:id/cancel
Permission: EDIT_ORDERS

Note: Automatically restores inventory quantities for cancelled orders
Cannot cancel orders already DELIVERED or CANCELLED

Response: {
  "message": "Order cancelled successfully. Inventory restored.",
  "order": {...}
}
```

#### Get Order Summary
```
GET /orders/summary
Permission: VIEW_ORDERS

Response: {
  "totalOrders": 25,
  "byStatus": {
    "PENDING": 5,
    "CONFIRMED": 3,
    "PROCESSING": 2,
    "SHIPPED": 10,
    "DELIVERED": 5,
    "CANCELLED": 0
  },
  "totalRevenue": 15000,
  "averageOrderValue": 600
}
```

---

## Workflow Examples

### Workflow 1: Create Customer and Assign Inventory

```javascript
// 1. Create customer and assign items from admin inventory
POST /customers
{
  "name": "Fresh Foods Inc",
  "email": "contact@freshfoods.com",
  "itemIds": [1, 2, 3, 5]  // Items from admin inventory
}

// Customer inventory now has access to items 1, 2, 3, 5
// But no quantities are stored yet (mass info will be on order)
```

### Workflow 2: Create Order

```javascript
// 1. Admin has inventory:
//    Item 1 (Tomatoes): 500 kg
//    Item 2 (Lettuce): 200 pieces

// 2. Create order for customer
POST /orders
{
  "customerId": 1,
  "items": [
    { "adminItemId": 1, "quantity": 50, "unit": "kg" },
    { "adminItemId": 2, "quantity": 30, "unit": "piece" }
  ]
}

// 3. Automatically after order creation:
//    Item 1 (Tomatoes): 500 - 50 = 450 kg
//    Item 2 (Lettuce): 200 - 30 = 170 pieces

// 4. Order created with:
//    - Status: PENDING
//    - Items with units and quantities
//    - Total amount calculated
```

### Workflow 3: Manage Inventory

```javascript
// 1. Add more stock
POST /inventory/items/1/adjust
{
  "adjustment": 200,
  "reason": "Delivery from supplier ABC"
}
// Tomatoes: 450 + 200 = 650 kg

// 2. View inventory status
GET /inventory/summary
// Shows: Tomatoes (650 kg), Lettuce (170 pieces), etc.

// 3. Add item to customer who didn't have it
POST /customers/1/inventory/items
{
  "itemIds": [4]  // Add new item to customer
}
```

### Workflow 4: Order Lifecycle

```javascript
// 1. Create order
POST /orders
{ "customerId": 1, "items": [...] }
// Status: PENDING

// 2. Confirm order
PUT /orders/1/status
{ "status": "CONFIRMED" }

// 3. Process order
PUT /orders/1/status
{ "status": "PROCESSING" }

// 4. Ship order
PUT /orders/1/status
{ "status": "SHIPPED" }

// 5. Deliver order
PUT /orders/1/status
{ "status": "DELIVERED" }
```

### Workflow 5: Cancel Order (Restore Inventory)

```javascript
// If order needs to be cancelled before delivery:
POST /orders/1/cancel

// Automatically:
// - Changes status to CANCELLED
// - Restores inventory quantities:
//   Tomatoes: 450 + 50 = 500 kg
//   Lettuce: 170 + 30 = 200 pieces
```

---

## Permission Requirements

New permissions are used in the system:

```javascript
// View permissions
VIEW_CUSTOMERS      // See customer information
VIEW_PRODUCTS       // See inventory items
VIEW_ORDERS         // See orders

// Create permissions
CREATE_CUSTOMER     // Create customers
CREATE_PRODUCT      // Add inventory items
CREATE_ORDER        // Create orders

// Edit permissions
EDIT_CUSTOMERS      // Modify customers and their inventories
EDIT_PRODUCT        // Edit inventory items, adjust quantities
EDIT_ORDERS         // Update order status, add items, cancel orders
```

---

## Key Features

### ✅ Dual Inventory System
- Admin maintains master inventory with quantities and prices
- Customers have assigned items (without quantities stored)
- Quantities specified only when creating orders

### ✅ Automatic Stock Management
- Creating an order automatically reduces admin inventory
- Cancelling an order restores inventory
- Manual adjustments available with reason tracking

### ✅ Order Status Tracking
- PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
- Or directly to CANCELLED if needed

### ✅ Financial Tracking
- Price per unit stored in admin inventory
- Automatic total calculation on orders
- Order summary with revenue metrics

### ✅ Permission-Based Access
- View, Create, and Edit operations protected by permissions
- Admin can manage all operations
- Employees with specific permissions can work with customers/orders

### ✅ Flexible Unit System
- Support for different units: piece, kg, liter, etc.
- Each order item can specify its unit
- Quantities stored as floats to support partial units

---

## Setup & Migration

The database migration adds all necessary tables with proper relationships:

```sql
-- Tables created:
- Customer
- AdminInventory
- AdminInventoryItem
- CustomerInventory
- CustomerInventoryItem
- Order
- OrderItem

-- Enums created:
- OrderStatus (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
```

Run migration:
```bash
cd /Users/metesevim/Desktop/wholesaler
npx prisma migrate deploy
```

---

## Notes

- Admin inventory is tied to the first Admin user in the system
- When an item is deleted, it cannot have active orders
- Orders can only have items added while in PENDING status
- Cancelling DELIVERED or already CANCELLED orders is not allowed
- Inventory summary shows items with less than 10 units as "low stock"

---

## Next Steps

1. **Run Database Migration**: Apply the schema changes
2. **Test Endpoints**: Use Swagger UI to test all endpoints
3. **Create Admin User**: Register an admin to create inventory
4. **Setup Inventory**: Add products to admin inventory
5. **Create Customers**: Add customers and assign items
6. **Create Orders**: Create test orders and verify inventory reduction
7. **Track Orders**: Update order statuses through the system

