# Wholesale Hub - Horecaline

A comprehensive wholesale management system for restaurants and hospitality businesses to manage orders, inventory, customers, providers, and employees.

## 🚀 Features

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

## 📁 Project Structure

```
wholesaler/
├── backend/                 # Node.js + Express backend
│   ├── controllers/        # Business logic
│   ├── routes/            # API endpoints
│   ├── services/          # Service layer
│   ├── middleware/        # Authentication & validation
│   ├── prisma/            # Database schema & migrations
│   └── server.js          # Entry point
│
├── frontend/              # React frontend
│   ├── src/
│   │   ├── features/      # Feature modules
│   │   │   ├── auth/      # Login/Signup
│   │   │   ├── orders/    # Order management
│   │   │   ├── inventory/ # Inventory management
│   │   │   ├── customers/ # Customer management
│   │   │   ├── providers/ # Provider management
│   │   │   ├── employees/ # Employee management
│   │   │   └── dashboard/ # Homepage/Dashboard
│   │   ├── components/    # Reusable components
│   │   ├── data/          # API repositories
│   │   └── shared/        # Utilities and constants
│   └── package.json
│
└── mds/                   # Documentation files
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma

### Frontend
- **Framework**: React (JavaScript only - No TypeScript)
- **Styling**: Tailwind CSS
- **Build Tool**: Webpack
- **HTTP Client**: Fetch API

## 🚦 Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd /Users/metesevim/Desktop/wholesaler
```

2. **Backend Setup**
```bash
cd backend
npm install
# Set up .env with DATABASE_URL
npx prisma migrate dev
npm run dev
# Backend runs on http://localhost:3000
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3001
```

## 📊 API Endpoints

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

## 🔐 Authentication & Authorization

- Users log in with username and password
- JWT tokens used for session management
- Role-based access control (Admin/Employee)
- Permission-based feature access
- IBAN support for payment tracking

## 💾 Database Schema

Key models:
- **User** - Authentication and user management
- **Order** - Order information and tracking
- **AdminInventoryItem** - Inventory items with low stock alerts
- **Customer** - Customer information and history
- **Provider** - Provider details
- **Employee** - Employee information and permissions

## 📱 User Interface

### Dashboard Features
- Sales performance metrics (Total Sales, Total Orders, Average Order)
- Order status summary (Pending, Shipped, Delivered, Cancelled)
- Low stock alerts with restock functionality
- Welcome message with user information

### Navigation
- Sidebar navigation with icons
- Logo (Wholesale Hub - Horecaline) centered in sidebar
- Quick access to all main features
- User profile section with settings and logout

### Order Management
- Organized by status (Pending, Shipped, Delivered, Cancelled)
- Click to edit orders
- Customer name and date display
- Total amount and item details
- Status badges with color coding

### Inventory Management
- Search functionality
- Restock popup modal
- Low stock threshold configuration
- Item quantity tracking with units

## 🎨 Design System

### Color Scheme
- **Primary**: Blue (#137fec)
- **Background**: Dark gray (#101922, #192633)
- **Text**: Light gray (#92adc9, white)
- **Status Colors**:
  - Pending: Yellow (#yellow-500)
  - Shipped: Blue (#blue-500)
  - Delivered: Green (#green-500)
  - Cancelled: Red (#red-500)

### Typography
- Font: SF Pro (primary)
- Responsive design for mobile and desktop

## 🔄 Workflow Examples

### Creating an Order
1. Navigate to Orders page
2. Click "Create Order" or use sidebar
3. Select customer
4. Add items from inventory
5. Review total amount
6. Create order
7. Edit order to change status as needed

### Managing Inventory
1. Navigate to Inventory page
2. Search for items or browse all
3. Click item to edit
4. Update quantity, price, or low stock threshold
5. Use "Restock" button to quickly add stock

### Managing Employees
1. Navigate to Employees page
2. Add new employee with details
3. Configure permissions (Create, Edit, View features)
4. Edit employee information as needed
5. Delete employee if necessary

## 📝 Order Statuses

- **PENDING** - Order created, awaiting shipment
- **SHIPPED** - Order in transit
- **DELIVERED** - Order delivered to customer
- **CANCELLED** - Order cancelled, inventory restored (for pending orders)

## ⚙️ Configuration

### Environment Variables (Backend)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3000)

### Environment Variables (Frontend)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3000)

## 🧪 Testing

API testing can be done using:
- Postman
- cURL commands
- Browser developer tools
- Frontend application itself

## 📚 Documentation

Additional documentation files are located in the `mds/` directory for specific features and implementation details.

## 🤝 Support

For issues or questions, refer to the documentation files in the `mds/` directory or check the feature-specific documentation.

## 📄 License

Proprietary - Wholesale Hub

---

**Last Updated**: February 3, 2026
