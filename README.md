# Wholesaler Assistant Application

## 🏗️ Architecture

```
Frontend (React)           Backend (Node.js/Express)         Database
└── wholesaler-login/      └── src/                          └── PostgreSQL
    ├── features/              ├── controllers/                  (via Prisma)
    ├── components/            ├── routes/
    ├── contexts/              ├── middleware/
    └── data/                  └── prisma/
        └── repositories/      
            (API Layer)        

        REST API (30 Endpoints)
        ↕ HTTP/JSON + JWT
```

## 🔑 Key Features

- ✅ **30 REST API Endpoints** - Complete CRUD operations
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-Based Access** - Admin & Employee roles
- ✅ **Permission System** - 12 granular permissions
- ✅ **Customer Management** - Full customer lifecycle
- ✅ **Inventory Management** - Track stock and pricing
- ✅ **Order Management** - Create, track, and fulfill orders
- ✅ **Swagger Documentation** - Interactive API docs
- ✅ **Clean Architecture** - Layered, maintainable code
- ✅ **TypeScript-Free** - Pure JavaScript only

## 📊 API Endpoints

### Authentication (2)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Admin (3)
- `POST /admin/users` - Create employee
- `PUT /admin/users/:id/permissions` - Update permissions
- `PUT /admin/users/:userId` - Update user info

### Customers (7)
- `GET /customers` - Get all customers
- `POST /customers` - Create customer
- `GET /customers/:id` - Get customer by ID
- `PUT /customers/:id` - Update customer
- `GET /customers/:id/inventory` - Get customer inventory
- `POST /customers/:id/inventory/items` - Add items to inventory
- `DELETE /customers/:id/inventory/items` - Remove items

### Inventory (7)
- `GET /inventory/items` - Get all items
- `POST /inventory/items` - Create item
- `GET /inventory/items/:id` - Get item by ID
- `PUT /inventory/items/:id` - Update item
- `DELETE /inventory/items/:id` - Delete item
- `POST /inventory/items/:id/adjust` - Adjust quantity
- `GET /inventory/summary` - Get summary stats

### Orders (10)
- `GET /orders` - Get all orders
- `POST /orders` - Create order
- `GET /orders/summary` - Get order statistics
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id/status` - Update order status
- `POST /orders/:id/cancel` - Cancel order
- `POST /orders/:id/items` - Add item to order
- `GET /orders/customer/:customerId` - Get customer orders
- `GET /orders/customer/:customerId/available-items` - Get available items

### Health (1)
- `GET /health` - API health check

## Permissions

- `VIEW_CUSTOMERS` - View customer list
- `EDIT_CUSTOMERS` - Modify customer data
- `CREATE_CUSTOMER` - Create new customers
- `VIEW_SUPPLIERS` - View suppliers
- `EDIT_SUPPLIERS` - Modify suppliers
- `CREATE_SUPPLIER` - Create suppliers
- `VIEW_PRODUCTS` - View inventory items
- `EDIT_PRODUCTS` - Modify inventory items
- `CREATE_PRODUCT` - Create new items
- `VIEW_ORDERS` - View orders
- `EDIT_ORDERS` - Modify orders
- `CREATE_ORDER` - Create new orders

**Built with ❤️ using React, Node.js, Express, and Prisma**

