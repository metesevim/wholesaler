# Order Management - Quick Reference

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN INVENTORY                       │
│  (Managed by Admin/Employee)                             │
│  - Tomatoes: 500 kg, $2.50/kg, image.jpg                │
│  - Lettuce: 200 pieces, $1.00/piece, image.jpg          │
│  - Milk: 100 liters, $3.00/liter, image.jpg            │
└─────────────────────────────────────────────────────────┘
           ↓ (Assign items without quantities)
┌─────────────────────────────────────────────────────────┐
│              CUSTOMER A INVENTORY                        │
│  - Tomatoes (available)                                  │
│  - Lettuce (available)                                   │
│  - Milk (available)                                      │
└─────────────────────────────────────────────────────────┘
           ↓ (Create order with quantities)
┌─────────────────────────────────────────────────────────┐
│                    ORDER #1                              │
│  Items:                                                  │
│  - Tomatoes: 50 kg @ $2.50 = $125                       │
│  - Lettuce: 30 pieces @ $1.00 = $30                     │
│  Status: PENDING → PROCESSING → SHIPPED → DELIVERED     │
└─────────────────────────────────────────────────────────┘
           ↓ (Inventory reduced)
┌─────────────────────────────────────────────────────────┐
│              UPDATED ADMIN INVENTORY                     │
│  - Tomatoes: 450 kg (was 500)                           │
│  - Lettuce: 170 pieces (was 200)                        │
│  - Milk: 100 liters (unchanged)                         │
└─────────────────────────────────────────────────────────┘
```

## 🔑 Key Concepts

| Term | Description |
|------|-------------|
| **Admin Inventory** | Master warehouse inventory with quantities, prices, images |
| **Customer Inventory** | Items assigned to a customer (from admin inventory, no quantities) |
| **Order** | Customer request for specific quantities of items |
| **Order Item** | Individual product in an order with quantity and unit |
| **Stock Reduction** | Automatic inventory decrease when order is created |

## 📍 API Quick Links

### Customers
```
POST   /customers                          Create customer with inventory
GET    /customers                          Get all customers
GET    /customers/:id                      Get specific customer
PUT    /customers/:id                      Update customer
GET    /customers/:id/inventory            Get customer's inventory
POST   /customers/:id/inventory/items      Add items to customer inventory
DELETE /customers/:id/inventory/items      Remove items from customer inventory
```

### Inventory
```
POST   /inventory/items                    Create inventory item
GET    /inventory/items                    Get all items
GET    /inventory/items/:id                Get specific item
PUT    /inventory/items/:id                Update item
DELETE /inventory/items/:id                Delete item
POST   /inventory/items/:id/adjust         Adjust stock (add/remove)
GET    /inventory/summary                  Get inventory overview
```

### Orders
```
POST   /orders                             Create order (reduces inventory)
GET    /orders                             Get all orders
GET    /orders/:id                         Get specific order
GET    /orders/customer/:customerId        Get customer's orders
PUT    /orders/:id/status                  Update order status
POST   /orders/:id/items                   Add item to pending order
POST   /orders/:id/cancel                  Cancel order (restore inventory)
GET    /orders/summary                     Get order statistics
```

## 🔄 Common Workflows

### 1. Setup: Create Admin Inventory Item
```bash
curl -X POST http://localhost:3000/inventory/items \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tomatoes",
    "description": "Fresh Roma tomatoes",
    "quantity": 500,
    "unit": "kg",
    "imageUrl": "https://...",
    "pricePerUnit": 2.50
  }'
```

### 2. Setup: Create Customer
```bash
curl -X POST http://localhost:3000/customers \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fresh Foods Inc",
    "email": "contact@freshfoods.com",
    "phone": "123-456-7890",
    "itemIds": [1, 2, 3]  # Assign items
  }'
```

### 3. Order: Create Order
```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      { "adminItemId": 1, "quantity": 50, "unit": "kg" },
      { "adminItemId": 2, "quantity": 30, "unit": "piece" }
    ],
    "notes": "Urgent delivery"
  }'
```

### 4. Manage: Update Order Status
```bash
curl -X PUT http://localhost:3000/orders/1/status \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "PROCESSING" }'

# Statuses: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
```

### 5. Manage: Adjust Inventory
```bash
curl -X POST http://localhost:3000/inventory/items/1/adjust \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "adjustment": 100,
    "reason": "Delivery from supplier XYZ"
  }'
```

### 6. Manage: Cancel Order (Restore Inventory)
```bash
curl -X POST http://localhost:3000/orders/1/cancel \
  -H "Authorization: Bearer TOKEN"

# Automatically restores inventory quantities
```

## 📋 Data Flow Example

**Step 1: Admin creates inventory**
```
Item: Tomatoes
Quantity: 500 kg
Price: $2.50/kg
```

**Step 2: Customer assigned items**
```
Customer: Fresh Foods Inc
Assigned Items: [Tomatoes, Lettuce, Milk]
```

**Step 3: Order created**
```
Order ID: 1
Items: Tomatoes (50 kg), Lettuce (30 pieces)
Total: $155
Status: PENDING
```

**Step 4: Inventory updated immediately**
```
Tomatoes: 500 → 450 kg
Lettuce: 200 → 170 pieces
```

**Step 5: Order lifecycle**
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
```

**Step 6: If cancelled**
```
Tomatoes: 450 → 500 kg (restored)
Lettuce: 170 → 200 pieces (restored)
```

## 📊 Status Codes

| HTTP | Meaning | When |
|------|---------|------|
| 200 | Success | Normal successful operations |
| 201 | Created | Resource created (customer, order, item) |
| 400 | Bad Request | Invalid data, insufficient stock, etc. |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Customer, order, or item doesn't exist |
| 500 | Server Error | Database or server error |

## ⚠️ Important Notes

- ✅ Creating an order **automatically reduces** admin inventory
- ✅ Cancelling an order **automatically restores** inventory
- ✅ Can only add items to **PENDING** orders
- ✅ Cannot delete items that have **active orders**
- ✅ Cannot cancel **DELIVERED** or **CANCELLED** orders
- ✅ Customer inventory stores **no quantities** (only item references)
- ✅ **Units can vary** (kg, piece, liter, etc.) per order item
- ✅ **Prices are optional** but needed for total calculation

## 🔐 Required Permissions

| Operation | Permission |
|-----------|------------|
| View customers | VIEW_CUSTOMERS |
| Create customer | CREATE_CUSTOMER |
| Edit customer | EDIT_CUSTOMERS |
| View inventory | VIEW_PRODUCTS |
| Create inventory item | CREATE_PRODUCT |
| Edit inventory item | EDIT_PRODUCT |
| View orders | VIEW_ORDERS |
| Create order | CREATE_ORDER |
| Edit order | EDIT_ORDERS |

**Admin Bypass**: Admin users bypass all permission checks

## 📱 Example Response

### Create Order Response
```json
{
  "message": "Order created successfully. Inventory updated.",
  "order": {
    "id": 1,
    "customerId": 1,
    "status": "PENDING",
    "totalAmount": 155,
    "notes": "Urgent delivery",
    "items": [
      {
        "id": 1,
        "itemName": "Tomatoes",
        "unit": "kg",
        "quantity": 50,
        "pricePerUnit": 2.50,
        "totalPrice": 125
      },
      {
        "id": 2,
        "itemName": "Lettuce",
        "unit": "piece",
        "quantity": 30,
        "pricePerUnit": 1.00,
        "totalPrice": 30
      }
    ],
    "createdAt": "2025-12-03T20:00:00Z",
    "customer": {
      "id": 1,
      "name": "Fresh Foods Inc"
    }
  }
}
```

## 🛠️ Testing Checklist

- [ ] Create admin user with inventory permissions
- [ ] Create inventory items with different units (kg, pieces, liters)
- [ ] Create customer and assign inventory items
- [ ] Create order and verify inventory reduced
- [ ] Update order status through workflow
- [ ] Add item to pending order
- [ ] Cancel order and verify inventory restored
- [ ] Check inventory summary for low stock alerts
- [ ] Test error cases (insufficient stock, invalid items, etc.)

## 📚 More Information

For detailed documentation, see:
- **ORDER_MANAGEMENT_GUIDE.md** - Complete system guide
- **API_DOCUMENTATION.md** - Full API reference
- **QUICK_REFERENCE.md** - General API quick reference

Access Swagger UI at:
```
http://localhost:3000/api-docs
```

