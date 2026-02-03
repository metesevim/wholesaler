# Wholesale Hub

A comprehensive wholesale management system for restaurants and hospitality businesses to manage orders, inventory, customers, providers, and employees.

### Core Functionality
- **Order Management** - Create, edit, and track orders with status management (Pending, Shipped, Delivered, Cancelled)
- **Inventory Management** - Track stock levels with low stock alerts, search functionality, and restock capability
- **Customer Management** - Manage customer information, IBAN details, and order history
- **Provider Management** - Track providers and their information
- **Employee Management** - Manage team members with role-based permissions
- **Dashboard** - Real-time sales metrics, order status summary, and low stock alerts

### User Management
- Role-based access control (Admin, Employee)
- Permission-based features
- User authentication and session management
- Admin settings and IBAN management

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma

### Frontend
- **Framework**: React
- **Styling**: Tailwind CSS
- **Build Tool**: Webpack
- **HTTP Client**: Fetch API

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Orders
- `GET /orders` - Get all orders
- `POST /orders` - Create new order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order
- `PUT /orders/:id/status` - Update order status
- `POST /orders/:id/cancel` - Cancel order
- `DELETE /orders/:id` - Delete order

### Inventory
- `GET /inventory/items` - Get all inventory items
- `POST /inventory/items` - Create new item
- `GET /inventory/items/:id` - Get item details
- `PUT /inventory/items/:id` - Update item
- `DELETE /inventory/items/:id` - Delete item
- `POST /inventory/items/:id/adjust` - Adjust quantity

### Customers
- `GET /customers` - Get all customers
- `POST /customers` - Create new customer
- `GET /customers/:id` - Get customer details
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Providers
- `GET /providers` - Get all providers
- `POST /providers` - Create new provider
- `GET /providers/:id` - Get provider details
- `PUT /providers/:id` - Update provider
- `DELETE /providers/:id` - Delete provider

### Employees
- `GET /employees` - Get all employees
- `POST /employees` - Create new employee
- `GET /employees/:id` - Get employee details
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

## Authentication & Authorization

- Users log in with username and password
- JWT tokens used for session management
- Role-based access control (Admin/Employee)
- Permission-based feature access
- IBAN support for payment tracking

## Database Schema

Key models:
- **User** - Authentication and user management
- **Order** - Order information and tracking
- **AdminInventoryItem** - Inventory items with low stock alerts
- **Customer** - Customer information and history
- **Provider** - Provider details
- **Employee** - Employee information and permissions

---

**Last Updated**: February 3, 2026
