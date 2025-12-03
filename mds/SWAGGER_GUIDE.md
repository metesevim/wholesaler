# Swagger/OpenAPI Documentation Setup Complete! 🚀

## Documentation Access

Your Wholesaler API now has complete Swagger/OpenAPI documentation available at:

### 📍 **http://localhost:3000/api-docs**

## What's Been Set Up

### 1. **Swagger UI** (`/api-docs`)
   - Interactive API documentation
   - Try-it-out feature to test endpoints directly from the browser
   - JWT token authorization support (persistent across requests)

### 2. **OpenAPI Specification**
   - **YAML Format**: `openapi.yaml` in the project root
   - **JSDoc Comments**: In all route files (`src/routes/*.js`)
   - **Configuration**: `src/swagger.js`

### 3. **Documentation Files**
   - `API_DOCUMENTATION.md` - Comprehensive markdown documentation
   - `openapi.yaml` - Full OpenAPI 3.0.0 specification

## Features

✅ **Complete API Documentation**
- All endpoints documented with descriptions
- Request/response examples
- Error code descriptions

✅ **JWT Authentication Support**
- Bearer token scheme configured
- Token persists across Swagger requests
- Easy authorization testing

✅ **Interactive Testing**
- Try-it-out feature on all endpoints
- Real-time request/response testing
- No external tools needed

✅ **Organized by Tags**
- Health checks
- Authentication
- Customers
- Admin operations

## Quick Start Guide

### 1. Start the Server
```bash
npm run dev  # For development with auto-reload
# or
npm start    # For production
```

### 2. Access Swagger UI
Open your browser and navigate to:
```
http://localhost:3000/api-docs
```

### 3. Test Authentication Flow

#### Step 1: Register/Login
1. Go to the **Authentication** section in Swagger
2. Click on `POST /auth/login`
3. Click "Try it out"
4. Enter credentials:
   ```json
   {
     "username": "test_user",
     "password": "password123"
   }
   ```
5. Click "Execute"
6. Copy the returned `token`

#### Step 2: Use the Token
1. Click the 🔒 **Authorize** button (top-right of Swagger UI)
2. Paste your token in the format: `Bearer <your_token_here>`
3. Click "Authorize"
4. All subsequent requests will automatically include the token

#### Step 3: Test Protected Endpoints
Now you can test protected endpoints like:
- `GET /customers` (requires VIEW_CUSTOMERS permission)
- `POST /admin/users` (requires Admin role)

## File Structure

```
wholesaler/
├── src/
│   ├── swagger.js                 # Swagger configuration
│   ├── app.js                     # Express app with Swagger UI mount
│   ├── routes/
│   │   ├── authRoutes.js         # Auth routes with JSDoc
│   │   ├── adminRoutes.js        # Admin routes with JSDoc
│   │   └── customerRoutes.js     # Customer routes with JSDoc
│   └── ...
├── openapi.yaml                   # OpenAPI 3.0.0 specification
├── API_DOCUMENTATION.md           # Detailed markdown documentation
└── package.json
```

## Swagger Configuration Details

### Security Schemes
- **Bearer Auth (JWT)**: Implemented for protected endpoints
- Tokens expire after 24 hours
- Required for most endpoints except `/auth/register` and `/auth/login`

### API Servers
- **Development**: `http://localhost:3000`
- **Production**: `https://api.wholesaler.com` (can be updated)

### Response Schemas
All response types are defined:
- `User` - User object with all fields
- `LoginResponse` - Login response with token
- `ErrorResponse` - Error messages
- `HealthResponse` - Health check response
- And many more...

## Example Workflow in Swagger

### 1. Health Check
```
GET /health
→ No authentication needed
→ Returns: { status: "gayet iyi", message: "Wholesaler API is running." }
```

### 2. Register a User
```
POST /auth/register
Body: {
  "username": "john_doe",
  "password": "secure_password",
  "role": "Admin"
}
→ Returns: User object with all permissions
```

### 3. Login
```
POST /auth/login
Body: {
  "username": "john_doe",
  "password": "secure_password"
}
→ Returns: { token: "..." }
```

### 4. Use Protected Endpoint
```
GET /customers
Header: Authorization: Bearer <token>
→ Returns: List of all customers (with appropriate permissions)
```

### 5. Admin Operations
```
POST /admin/users
Header: Authorization: Bearer <admin_token>
Body: {
  "username": "jane_smith",
  "password": "password123",
  "permissions": ["VIEW_CUSTOMERS", "CREATE_CUSTOMER"]
}
→ Returns: New employee user object
```

## Key Features Explained

### 1. **Auto-save Authorization**
- Check the "Persist authorization data between browser tabs" option
- Your token will be remembered across sessions

### 2. **Request/Response View**
- Click "Execute" to see both the request and response
- Full response headers are included
- Response time is displayed

### 3. **Example Values**
- All endpoints show example values
- Help you understand the expected format

### 4. **Schema Definitions**
- Click on any schema to see its structure
- Shows all available fields and types
- Includes field descriptions

## Permissions Reference

### Customer Management
- `VIEW_CUSTOMERS` - Read-only access
- `EDIT_CUSTOMERS` - Modify existing customers
- `CREATE_CUSTOMER` - Create new customers

### Supplier Management
- `VIEW_SUPPLIERS` - Read-only access
- `EDIT_SUPPLIERS` - Modify existing suppliers
- `CREATE_SUPPLIER` - Create new suppliers

### Product Management
- `VIEW_PRODUCTS` - Read-only access
- `EDIT_PRODUCTS` - Modify existing products
- `CREATE_PRODUCT` - Create new products

### Order Management
- `VIEW_ORDERS` - Read-only access
- `EDIT_ORDERS` - Modify existing orders
- `CREATE_ORDER` - Create new orders

## Testing Scenarios

### Scenario 1: Admin User Workflow
1. Register as Admin
2. Login and get token
3. Use token to access customer endpoints
4. Create new employee users
5. Set permissions for employees

### Scenario 2: Employee User Workflow
1. Admin creates employee account with permissions
2. Employee logs in
3. Can only access endpoints matching their permissions
4. Cannot access admin endpoints

### Scenario 3: Permission-Based Access
1. Employee has only `VIEW_CUSTOMERS` permission
2. Can GET /customers (success)
3. Cannot POST /customers (403 Forbidden)
4. Admin can add `EDIT_CUSTOMERS` permission
5. Employee can now POST /customers (success)

## Troubleshooting

### "Token doesn't exist or invalid"
- Ensure token is pasted with "Bearer " prefix
- Check that token hasn't expired (24 hours)
- Try logging in again to get a fresh token

### "You don't have the required permission"
- Check if your user has the required permission
- Ask admin to assign the needed permission
- Use admin account for testing

### "You don't have the permission" (403)
- This is a permission-based error
- Admin users bypass permission checks
- Employee users need specific permissions

### Swagger UI not loading
- Ensure server is running: `npm start`
- Check that port 3000 is not blocked
- Verify files in `src/routes/` have JSDoc comments

## Next Steps

1. ✅ **Swagger UI is ready** - Start testing!
2. 📚 **Read API_DOCUMENTATION.md** - For detailed information
3. 🔧 **Review openapi.yaml** - For the complete specification
4. 🚀 **Test all endpoints** - Use Swagger's try-it-out feature
5. 📝 **Add more endpoints** - Follow the JSDoc pattern in existing routes

## Support

For more information:
- Check the inline code comments in `src/swagger.js`
- Review JSDoc comments in route files
- Read `API_DOCUMENTATION.md` for detailed examples
- Refer to [Swagger documentation](https://swagger.io/docs/)

---

**Happy API Testing! 🎉**

Your OpenAPI documentation is now fully integrated and ready to use. Access it at:
### 🌐 http://localhost:3000/api-docs

