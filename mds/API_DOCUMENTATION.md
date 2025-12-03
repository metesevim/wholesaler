# Wholesaler API - OpenAPI Documentation

## Overview

The Wholesaler API is a comprehensive REST API for managing wholesale operations including authentication, customer management, and administrative functions. The API uses JWT (JSON Web Tokens) for authentication and implements role-based access control (RBAC) with permission-based authorization.

## Quick Start

### Accessing the API Documentation

The Swagger/OpenAPI documentation is available at:
```
http://localhost:3000/api-docs
```

### Base URL
```
http://localhost:3000
```

## Authentication

### JWT Token Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

**Token Details:**
- Obtained from `/auth/login` endpoint
- Valid for 1 day (24 hours)
- Contains user ID and role information
- Must be included in the `Authorization` header with "Bearer " prefix

### Example Authentication Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJFbXBsb3llZSIsImlhdCI6MTczNDMzNTExMywiZXhwIjoxNzM0NDIxNTEzfQ.abc123...
```

## API Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "gayet iyi",
  "message": "Wholesaler API is running."
}
```

### Authentication Routes

#### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123",
  "role": "Admin" // or "Employee"
}
```

**Response (201):**
```json
{
  "message": "User created.",
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "Admin",
    "permissions": ["VIEW_CUSTOMERS", "EDIT_CUSTOMERS", ...],
    "createdAt": "2024-12-03T10:30:00.000Z"
  }
}
```

**Note:** Admin users receive all permissions by default. Employee users start with no permissions.

#### POST /auth/login
Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Customer Routes

#### GET /customers
Retrieve all customers (requires JWT token and VIEW_CUSTOMERS permission).

**Security:** JWT Bearer Token
**Permission:** VIEW_CUSTOMERS (Admin users bypass this check)

**Response (200):**
```json
{
  "message": "Bütün müşterileri burada döndüreceğiz"
}
```

#### POST /customers
Add a new customer (requires JWT token and EDIT_CUSTOMERS permission).

**Security:** JWT Bearer Token
**Permission:** EDIT_CUSTOMERS (Admin users bypass this check)

**Request Body:**
```json
{
  // Customer data to be implemented
}
```

**Response (200):**
```json
{
  "message": "Yeni müşteri eklendi (dummy şimdilik)"
}
```

### Admin Routes

#### POST /admin/users
Create a new employee account (Admin only).

**Security:** JWT Bearer Token
**Role Required:** Admin

**Request Body:**
```json
{
  "username": "jane_smith",
  "password": "password123",
  "permissions": ["VIEW_CUSTOMERS", "CREATE_CUSTOMER"] // optional
}
```

**Response (201):**
```json
{
  "message": "Employee created.",
  "user": {
    "id": 2,
    "username": "jane_smith",
    "role": "Employee",
    "permissions": ["VIEW_CUSTOMERS", "CREATE_CUSTOMER"],
    "createdAt": "2024-12-03T10:35:00.000Z"
  }
}
```

#### PUT /admin/users/{id}/permissions
Update user permissions (Admin only).

**Security:** JWT Bearer Token
**Role Required:** Admin
**Parameters:**
- `id` (path): User ID to update

**Request Body:**
```json
{
  "permissions": ["VIEW_CUSTOMERS", "EDIT_CUSTOMERS", "VIEW_SUPPLIERS"]
}
```

**Response (200):**
```json
{
  "message": "Permissions updated.",
  "user": {
    "id": 2,
    "username": "jane_smith",
    "role": "Employee",
    "permissions": ["VIEW_CUSTOMERS", "EDIT_CUSTOMERS", "VIEW_SUPPLIERS"],
    "createdAt": "2024-12-03T10:35:00.000Z"
  }
}
```

## Roles and Permissions

### Roles
- **Admin**: Has access to all admin endpoints and all permissions by default
- **Employee**: Limited access based on assigned permissions

### Available Permissions

#### Customer Management
- `VIEW_CUSTOMERS` - View customer information
- `EDIT_CUSTOMERS` - Modify customer information
- `CREATE_CUSTOMER` - Create new customers

#### Supplier Management
- `VIEW_SUPPLIERS` - View supplier information
- `EDIT_SUPPLIERS` - Modify supplier information
- `CREATE_SUPPLIER` - Create new suppliers

#### Product Management
- `VIEW_PRODUCTS` - View product information
- `EDIT_PRODUCTS` - Modify product information
- `CREATE_PRODUCT` - Create new products

#### Order Management
- `VIEW_ORDERS` - View order information
- `EDIT_ORDERS` - Modify order information
- `CREATE_ORDER` - Create new orders

## Error Responses

### 400 Bad Request
```json
{
  "error": "Please enter all required fields."
}
```

### 401 Unauthorized
```json
{
  "error": "Geçersiz veya süresi dolmuş token"
}
```

### 403 Forbidden
```json
{
  "error": "You don't have the required permission."
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message details"
}
```

## Example Usage

### 1. Register a User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure_password",
    "role": "Admin"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure_password"
  }'
```

### 3. Access Protected Endpoint
```bash
curl -X GET http://localhost:3000/customers \
  -H "Authorization: Bearer <token_from_login>"
```

### 4. Create Employee (Admin Only)
```bash
curl -X POST http://localhost:3000/admin/users \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_smith",
    "password": "password123",
    "permissions": ["VIEW_CUSTOMERS", "CREATE_CUSTOMER"]
  }'
```

### 5. Set User Permissions (Admin Only)
```bash
curl -X PUT http://localhost:3000/admin/users/2/permissions \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["VIEW_CUSTOMERS", "EDIT_CUSTOMERS", "VIEW_SUPPLIERS"]
  }'
```

## Database Schema

### User Model
```
id: Integer (Primary Key, Auto-increment)
username: String (Unique)
password: String (Hashed with bcrypt)
role: Enum (Admin | Employee)
permissions: String[] (Array of permission strings)
createdAt: DateTime (Timestamp)
```

### Roles Enum
- Admin
- Employee

## Security Considerations

1. **Password Security**: All passwords are hashed using bcrypt with salt rounds of 10
2. **JWT Expiry**: Tokens expire after 24 hours
3. **Permission Check**: Endpoints validate user permissions before allowing access
4. **Admin Bypass**: Admin users bypass permission checks but still require authentication
5. **CORS**: API is configured with CORS to allow cross-origin requests

## Development

### Start Development Server
```bash
npm run dev
```

### Start Production Server
```bash
npm start
```

## Environment Variables

The API requires the following environment variables in `.env`:

```
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/wholesaler
```

## API Documentation Files

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: Available through Swagger UI
- **Documentation**: This file

## Support

For issues or questions about the API, please refer to the code comments or check the Swagger documentation at `/api-docs`.

