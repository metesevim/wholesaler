# 🎯 Quick Reference Card

## 📍 Access Swagger Documentation
```
👉 http://localhost:3000/api-docs
```

## 🔑 Key Files Created

| File | Purpose |
|------|---------|
| `src/swagger.js` | Swagger config & schemas |
| `openapi.yaml` | Complete OpenAPI spec (YAML) |
| `API_DOCUMENTATION.md` | Full API docs (Markdown) |
| `SWAGGER_GUIDE.md` | Usage guide |
| `SETUP_COMPLETE.md` | Implementation summary |

## 🔐 Authentication Quick Guide

### 1️⃣ Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "role": "Admin"
}
```

### 2️⃣ Login
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Response**: `{ "message": "Login successful", "token": "..." }`

### 3️⃣ Use Token
```bash
GET /customers
Authorization: Bearer {token_from_login}
```

## 📊 API Endpoints

| Method | Endpoint | Auth | Role | Permission |
|--------|----------|------|------|-----------|
| GET | `/health` | ❌ | - | - |
| POST | `/auth/register` | ❌ | - | - |
| POST | `/auth/login` | ❌ | - | - |
| GET | `/customers` | ✅ | Any | VIEW_CUSTOMERS |
| POST | `/customers` | ✅ | Any | EDIT_CUSTOMERS |
| POST | `/admin/users` | ✅ | Admin | - |
| PUT | `/admin/users/{id}/permissions` | ✅ | Admin | - |

## 🎭 Roles & Permissions

### Roles
- **Admin**: All permissions by default, access to admin endpoints
- **Employee**: Only assigned permissions, no admin access

### Permission List
```
Customer:  VIEW_CUSTOMERS, EDIT_CUSTOMERS, CREATE_CUSTOMER
Supplier:  VIEW_SUPPLIERS, EDIT_SUPPLIERS, CREATE_SUPPLIER
Product:   VIEW_PRODUCTS, EDIT_PRODUCTS, CREATE_PRODUCT
Order:     VIEW_ORDERS, EDIT_ORDERS, CREATE_ORDER
```

## 🧪 Testing Workflow

### In Swagger UI:
1. Open http://localhost:3000/api-docs
2. Go to `/auth/login` → Try it out
3. Enter credentials → Execute
4. Copy token → Click 🔒 Authorize
5. Paste: `Bearer {token}`
6. Test other endpoints!

### Via cURL:
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  | jq -r '.token')

# Use token
curl -X GET http://localhost:3000/customers \
  -H "Authorization: Bearer $TOKEN"
```

## ✨ Swagger UI Features

- 📝 **Try It Out**: Test endpoints directly from browser
- 🔐 **Authorize**: Store JWT token for all requests
- 📚 **Schemas**: View all data models
- 🔍 **Search**: Find endpoints by name
- 📥 **Download**: Get OpenAPI spec
- 💾 **Persistent Auth**: Token saved between sessions

## 🚨 HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Normal successful request |
| 201 | Created | Resource created (POST) |
| 400 | Bad Request | Invalid input/missing fields |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions/role |
| 500 | Server Error | Internal error |

## 🆘 Troubleshooting

**Can't see Swagger UI?**
- Ensure server is running: `npm start`
- Check port 3000 is available
- Clear browser cache

**"Token invalid or expired"**
- Login again to get fresh token
- Check Bearer format: `Bearer {token}`

**"You don't have permission"**
- Check user permissions in DB
- Admin can update with `/admin/users/{id}/permissions`

**"User not found"**
- Register user first with `/auth/register`
- Check username spelling

## 📦 Project Structure

```
wholesaler/
├── src/
│   ├── swagger.js          ← Config & schemas
│   ├── app.js              ← Swagger UI mounted
│   ├── routes/
│   │   ├── authRoutes.js   ← JWT endpoints
│   │   ├── adminRoutes.js  ← Admin endpoints
│   │   └── customerRoutes.js
│   └── ...
├── openapi.yaml            ← Full spec (YAML)
├── API_DOCUMENTATION.md    ← Detailed docs
├── SWAGGER_GUIDE.md        ← Usage guide
└── SETUP_COMPLETE.md       ← Implementation summary
```

## 🔄 Request/Response Examples

### Request (with token):
```
GET /customers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Response (200):
```json
{
  "message": "Bütün müşterileri burada döndüreceğiz"
}
```

### Error Response (403):
```json
{
  "error": "You don't have the required permission."
}
```

## 🎯 Quick Commands

```bash
# Start server
npm start

# Start with auto-reload
npm run dev

# Access docs
open http://localhost:3000/api-docs

# Test health
curl http://localhost:3000/health
```

## 🌐 Swagger UI URL
```
Development: http://localhost:3000/api-docs
Production: https://api.wholesaler.com/api-docs (after deployment)
```

---

**Need more info?** Read the full docs in `API_DOCUMENTATION.md` or `SWAGGER_GUIDE.md`

**Happy testing! 🚀**

