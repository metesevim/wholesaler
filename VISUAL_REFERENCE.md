# 🎯 Order Management System - Visual Reference & Architecture

---

## 📐 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     WHOLESALER API                              │
│                    (Express.js Server)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼────────┐ ┌─▼──────────────┐
        │  Auth System │ │  Customers │ │  Inventory &   │
        │  (Existing)  │ │  Management│ │    Orders      │
        │              │ │            │ │   (NEW)        │
        └──────────────┘ └────────────┘ └────────────────┘
                │              │               │
                └──────────────┼───────────────┘
                               │
        ┌──────────────────────▼──────────────────────┐
        │         Permission Middleware               │
        │  (VIEW/CREATE/EDIT Controls)               │
        └──────────────────────┬──────────────────────┘
                               │
        ┌──────────────────────▼──────────────────────┐
        │         PostgreSQL Database                 │
        │    (7 New Models)                          │
        └──────────────────────────────────────────────┘
```

---

## 🗂️ Database Model Relationships

```
┌────────────────┐
│      User      │  (Existing)
│  (Admin/Emp)   │
└────────┬───────┘
         │
         │ (1:1)
         ▼
┌────────────────────────┐
│  AdminInventory        │
│  - userId              │
│  - items[]             │
└────────┬───────────────┘
         │
         │ (1:many)
         ▼
┌────────────────────────┐
│ AdminInventoryItem     │
│ - name, quantity       │
│ - unit, price, image   │
└────────┬───────────────┘
         │
    ┌────┴────┬─────────────┐
    │          │             │
    │ (ref)    │ (ref)       │ (ref)
    ▼          ▼             ▼
┌──────────────────┐    ┌──────────────┐
│CustomerInventory│    │ OrderItem    │
│    Items        │    │(consumed)    │
└──────────────────┘    └──────────────┘
         ▲                    ▲
         │ (1:many)           │ (1:many)
         │                    │
┌────────────────────┐  ┌────────────┐
│  Customer          │  │ Order      │
│ - name, email      │  │- status    │
│ - inventory[]      │  │- items[]   │
│ - orders[]         │  │- total$    │
└────────────────────┘  └────────────┘
         ▲                    │
         │                    │
         └────────(1:many)────┘
```

---

## 🔄 Order Processing Flow

```
Step 1: Setup Phase
┌──────────────────────────────────────────────────┐
│ ADMIN CREATES INVENTORY ITEM                     │
│ POST /inventory/items                            │
│ → Tomatoes: 500kg @ $2.50/kg [image]            │
│ → Lettuce: 200 pieces @ $1.00/piece [image]     │
│ → Milk: 100 liters @ $3.00/liter [image]        │
└──────────────────────┬───────────────────────────┘
                       │
Step 2: Assignment Phase
┌──────────────────────▼───────────────────────────┐
│ ADMIN CREATES CUSTOMER                           │
│ POST /customers                                  │
│ → Fresh Foods Inc                                │
│ → Assign items: Tomatoes, Lettuce, Milk         │
│ → CustomerInventory created with items          │
└──────────────────────┬───────────────────────────┘
                       │
Step 3: Order Creation Phase
┌──────────────────────▼───────────────────────────┐
│ CUSTOMER CREATES ORDER                           │
│ POST /orders                                     │
│ → Tomatoes: 50kg                                 │
│ → Lettuce: 30 pieces                             │
└──────────────────────┬───────────────────────────┘
                       │
Step 4: Inventory Impact (AUTOMATIC)
┌──────────────────────▼───────────────────────────┐
│ INVENTORY REDUCED AUTOMATICALLY                  │
│                                                   │
│ Tomatoes: 500kg → 450kg                          │
│ Lettuce: 200 pieces → 170 pieces                 │
│ (Milk: 100 liters - unchanged)                   │
└──────────────────────┬───────────────────────────┘
                       │
Step 5: Order Tracking Phase
┌──────────────────────▼───────────────────────────┐
│ UPDATE ORDER STATUS                              │
│ PENDING → CONFIRMED → PROCESSING →               │
│ SHIPPED → DELIVERED                              │
└──────────────────────┬───────────────────────────┘
                       │
Step 6: Optional Cancellation Phase
┌──────────────────────▼───────────────────────────┐
│ CANCEL ORDER (if needed)                         │
│ POST /orders/:id/cancel                          │
│                                                   │
│ Tomatoes: 450kg → 500kg (restored)               │
│ Lettuce: 170 pieces → 200 pieces (restored)     │
└──────────────────────────────────────────────────┘
```

---

## 📊 Permission Matrix

```
┌─────────────────────┬──────────┬────────┬──────────┐
│ Operation           │ Admin    │ Employee│ Required │
├─────────────────────┼──────────┼────────┼──────────┤
│ View Customers      │ ✅ Yes   │ ❌ No  │VIEW_CUST │
│ Create Customer     │ ✅ Yes   │ ❌ No  │CREATE_CUST
│ Edit Customer       │ ✅ Yes   │ ❌ No  │EDIT_CUST │
│ Manage Inventory    │ ✅ Yes   │ ❌ No  │EDIT_PROD │
│ Create Orders       │ ✅ Yes   │ ❌ No  │CREATE_ORD│
│ View Orders         │ ✅ Yes   │ ❌ No  │VIEW_ORD  │
│ Update Order Status │ ✅ Yes   │ ❌ No  │EDIT_ORD  │
└─────────────────────┴──────────┴────────┴──────────┘

Note: Admin bypasses all permission checks
Employees need specific permissions per operation
```

---

## 🗃️ File Organization

```
wholesaler/
├── src/
│   ├── controllers/
│   │   ├── authController.js          ✅ Existing
│   │   ├── customerController.js      🆕 New
│   │   ├── inventoryController.js     🆕 New
│   │   └── orderController.js         🆕 New
│   │
│   ├── routes/
│   │   ├── authRoutes.js              ✅ Existing
│   │   ├── adminRoutes.js             ✅ Existing
│   │   ├── customerRoutes.js          📝 Modified
│   │   ├── inventoryRoutes.js         🆕 New
│   │   └── orderRoutes.js             🆕 New
│   │
│   ├── middleware/
│   │   └── authMiddleware.js          ✅ Existing
│   │
│   ├── constants/
│   │   └── permissions.js             ✅ Existing
│   │
│   └── app.js                         📝 Modified
│
├── prisma/
│   ├── schema.prisma                  📝 Modified
│   └── migrations/
│       ├── ... (existing)
│       └── 20251203195800_add_order_management/
│           └── migration.sql          🆕 New
│
└── docs/
    ├── ORDER_MANAGEMENT_GUIDE.md                    🆕 New
    ├── ORDER_MANAGEMENT_QUICK_REFERENCE.md          🆕 New
    ├── ORDER_MANAGEMENT_IMPLEMENTATION.md           🆕 New
    ├── ORDER_MANAGEMENT_COMPLETE_SUMMARY.md         🆕 New
    └── DEPLOYMENT_CHECKLIST.md                      🆕 New
```

---

## 📈 API Endpoint Organization

```
Customers (7)
├── POST   /customers
├── GET    /customers
├── GET    /customers/:id
├── PUT    /customers/:id
├── GET    /customers/:id/inventory
├── POST   /customers/:id/inventory/items
└── DELETE /customers/:id/inventory/items

Inventory (7)
├── POST   /inventory/items
├── GET    /inventory/items
├── GET    /inventory/items/:id
├── PUT    /inventory/items/:id
├── DELETE /inventory/items/:id
├── POST   /inventory/items/:id/adjust
└── GET    /inventory/summary

Orders (8)
├── POST   /orders
├── GET    /orders
├── GET    /orders/:id
├── GET    /orders/customer/:customerId
├── PUT    /orders/:id/status
├── POST   /orders/:id/items
├── POST   /orders/:id/cancel
└── GET    /orders/summary

Total: 22 NEW Endpoints
```

---

## 🔐 Security Layers

```
┌────────────────────────────────────────┐
│      HTTP Request                      │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│   1. JWT Verification                  │
│   (authJWT middleware)                 │
│   ✅ Token valid? → Continue           │
│   ❌ Token invalid? → 401 Unauthorized │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│   2. Role Check (if needed)            │
│   (requireRole middleware)             │
│   ✅ Admin? → Continue                 │
│   ❌ Not Admin? → 403 Forbidden        │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│   3. Permission Check                  │
│   (requirePermission middleware)       │
│   ✅ Has permission? → Continue        │
│   ❌ No permission? → 403 Forbidden    │
│   (Admin bypasses this)                │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│   4. Business Logic Validation         │
│   - Check required fields              │
│   - Validate relationships             │
│   - Check inventory availability       │
│   ✅ Valid? → Process request          │
│   ❌ Invalid? → 400 Bad Request        │
└───────────────┬────────────────────────┘
                │
┌───────────────▼────────────────────────┐
│   5. Database Operation                │
│   - Create/Update/Delete               │
│   - Return 200/201 response            │
└────────────────────────────────────────┘
```

---

## 📊 Data Models Overview

```
Customer
├─ id: Int (PK)
├─ name: String
├─ email: String (UNIQUE)
├─ phone: String?
├─ address: String?
├─ city: String?
├─ country: String?
├─ inventory: CustomerInventory?
├─ orders: Order[] (1:many)
├─ createdAt: DateTime
└─ updatedAt: DateTime

AdminInventoryItem
├─ id: Int (PK)
├─ name: String
├─ description: String?
├─ quantity: Int (stock count)
├─ unit: String (kg, piece, liter)
├─ imageUrl: String?
├─ pricePerUnit: Float?
├─ adminInventory: AdminInventory (FK)
├─ customerItems: CustomerInventoryItem[] (1:many)
├─ orderItems: OrderItem[] (1:many)
├─ createdAt: DateTime
└─ updatedAt: DateTime

Order
├─ id: Int (PK)
├─ customerId: Int (FK)
├─ customer: Customer
├─ status: OrderStatus (enum)
├─ items: OrderItem[] (1:many)
├─ totalAmount: Float
├─ notes: String?
├─ createdAt: DateTime
└─ updatedAt: DateTime

OrderItem
├─ id: Int (PK)
├─ orderId: Int (FK)
├─ order: Order
├─ adminItemId: Int (FK)
├─ adminItem: AdminInventoryItem
├─ itemName: String
├─ unit: String
├─ quantity: Float
├─ pricePerUnit: Float?
├─ totalPrice: Float?
├─ createdAt: DateTime
└─ updatedAt: DateTime
```

---

## 🔄 Request/Response Cycle Example

```
REQUEST: Create Order
┌─────────────────────────────────────────────────────┐
│ POST /orders                                        │
│ Authorization: Bearer eyJhbGciOiJIUzI1NiIs...      │
│ Content-Type: application/json                      │
│                                                     │
│ {                                                   │
│   "customerId": 1,                                  │
│   "items": [                                        │
│     {                                               │
│       "adminItemId": 1,                             │
│       "quantity": 50,                               │
│       "unit": "kg"                                  │
│     }                                               │
│   ],                                                │
│   "notes": "Urgent delivery"                        │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                    ↓
                PROCESSING
┌─────────────────────────────────────────────────────┐
│ 1. Verify JWT token                                 │
│ 2. Check CREATE_ORDER permission                    │
│ 3. Validate customer exists                         │
│ 4. Verify items in customer inventory               │
│ 5. Check admin inventory stock                      │
│ 6. Create order record                              │
│ 7. Create order items                               │
│ 8. Update admin inventory (reduce quantities)       │
│ 9. Calculate total amount                           │
└─────────────────────────────────────────────────────┘
                    ↓
RESPONSE: Success (201 Created)
┌─────────────────────────────────────────────────────┐
│ {                                                   │
│   "message": "Order created successfully...",       │
│   "order": {                                        │
│     "id": 1,                                        │
│     "customerId": 1,                                │
│     "status": "PENDING",                            │
│     "items": [                                      │
│       {                                             │
│         "id": 1,                                    │
│         "itemName": "Tomatoes",                     │
│         "unit": "kg",                               │
│         "quantity": 50,                             │
│         "pricePerUnit": 2.50,                       │
│         "totalPrice": 125                           │
│       }                                             │
│     ],                                              │
│     "totalAmount": 125,                             │
│     "createdAt": "2025-12-03T20:30:00Z"             │
│   }                                                 │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

---

## 📱 Status Codes Reference

```
200 OK
├─ GET succeeded
├─ PUT/DELETE succeeded
└─ Order status update succeeded

201 Created
├─ Customer created
├─ Order created
└─ Inventory item created

400 Bad Request
├─ Missing required fields
├─ Invalid email/data format
├─ Insufficient stock
└─ Invalid order status

401 Unauthorized
├─ Missing token
├─ Invalid token
└─ Token expired

403 Forbidden
├─ Missing permission
├─ Insufficient role
└─ Access denied

404 Not Found
├─ Customer not found
├─ Order not found
└─ Item not found

500 Server Error
├─ Database error
├─ Unexpected exception
└─ Server crash
```

---

## ✨ Quick Feature Map

```
Feature                          Location                Status
───────────────────────────────────────────────────────────────
Create Customers                customerController      ✅
List Customers                  customerController      ✅
Update Customer Info            customerController      ✅
Manage Customer Inventory       customerController      ✅
                                                        
Create Inventory Items          inventoryController     ✅
List Inventory Items            inventoryController     ✅
Update Item Details             inventoryController     ✅
Delete Inventory Items          inventoryController     ✅
Adjust Stock Quantities         inventoryController     ✅
View Inventory Summary          inventoryController     ✅
                                                        
Create Orders                   orderController        ✅
Auto Reduce Inventory           orderController        ✅
Track Order Status              orderController        ✅
Cancel Orders                   orderController        ✅
Auto Restore Inventory          orderController        ✅
Add Items to Orders             orderController        ✅
Get Order Statistics            orderController        ✅
Filter Orders by Status/Cust    orderController        ✅
```

---

## 🎯 System Capabilities

```
✅ Can manage multiple customers
✅ Can manage multiple inventory items
✅ Can create multiple orders
✅ Can track order lifecycle
✅ Can filter orders by status
✅ Can filter orders by customer
✅ Can manually adjust inventory
✅ Can cancel orders with restoration
✅ Can add items to pending orders
✅ Can view inventory summary
✅ Can identify low stock items
✅ Can support different units (kg, pieces, liters)
✅ Can track item prices and order totals
✅ Can maintain inventory history
✅ Can enforce permissions per operation
```

---

**Complete Visual Reference Created**  
Ready for implementation and deployment! 🚀

