# Wholesaler Login - Layered Architecture

A React application with clean, layered architecture using **plain JavaScript only** (no TypeScript).

## 🏗️ Architecture

This application follows a strict **layered architecture** pattern with clear separation of concerns:

```
App Layer (Bootstrap, Routing, Guards)
    ↓
Feature Layer (Pages, Hooks, State)
    ↓
UI Layer (Components)
    ↓
Domain Layer (Models, Validators) + Data Layer (API, Repositories)
    ↓
Shared Layer (Utilities, Constants)
```

See [REACT_LAYERED_ARCHITECTURE.md](../mds/REACT_LAYERED_ARCHITECTURE.md) for detailed documentation.

## 📁 Project Structure

```
src/
├── app/                      # Application bootstrap
│   ├── App.js               # Main app component
│   ├── AppProviders.js      # Global providers
│   ├── AppRouter.js         # Routing configuration
│   └── ProtectedRoute.js    # Auth guard
│
├── features/                 # Feature modules
│   ├── auth/
│   │   ├── pages/           # Login, Register pages
│   │   ├── components/      # Auth-specific components
│   │   └── hooks/           # useAuth hook
│   └── dashboard/
│       └── pages/           # Dashboard page
│
├── components/               # Reusable UI components
│   ├── forms/               # Input, Button, etc.
│   └── feedback/            # Message, Spinner
│
├── data/                     # Data access layer
│   ├── client/              # HTTP client
│   └── repositories/        # API repositories
│
├── domain/                   # Business logic
│   ├── models/              # Data models
│   ├── constants/           # Constants
│   ├── validators/          # Validation logic
│   └── mappers/             # Data mappers
│
├── shared/                   # Shared utilities
│   ├── utils/               # Helper functions
│   ├── hooks/               # Common hooks
│   └── constants/           # App constants
│
└── contexts/                 # React contexts
    └── AuthContext.js       # Authentication context
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on port 3000 (or configure via .env)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm start
```

### Environment Variables

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:3000
NODE_ENV=development
```

## 🔐 Authentication Flow

### How It Works

1. **User enters credentials** in `LoginForm` component
2. **Form validates** locally using domain validators
3. **LoginPage** calls `useAuth().login()`
4. **AuthContext** calls `authRepository.login()`
5. **Repository** makes HTTP POST to `/auth/login`
6. **Backend** returns token + user data
7. **Repository** maps response using `userMapper`
8. **AuthContext** updates user state and stores token
9. **LoginPage** redirects to dashboard
10. **ProtectedRoute** verifies authentication

### API Endpoints

The app expects these endpoints:

- `POST /auth/login` - Login with credentials
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

## 🧩 Layer Responsibilities

### App Layer
- Application bootstrap
- Routing configuration
- Global providers setup
- Route guards

### Feature Layer
- Feature pages (route-level components)
- Feature-specific hooks
- State orchestration
- Connects UI to data

### UI Layer
- Pure, reusable components
- No API calls or business logic
- Props-driven and stateless

### Data Layer
- HTTP client configuration
- API repositories
- Request/response mapping
- Centralized error handling

### Domain Layer
- Models (plain JavaScript objects)
- Validators (pure functions)
- Mappers (data transformation)
- Business constants

### Shared Layer
- Common utilities
- Storage helpers
- Logging
- App-wide constants

## 📝 Coding Standards

### File Naming
- Components: PascalCase with `.jsx` (e.g., `LoginForm.jsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.js`)
- Utilities: camelCase with `.js` (e.g., `storage.js`)

### Component Structure
```javascript
// 1. Imports
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// 2. Component
const MyComponent = ({ prop1, prop2 }) => {
  // State, effects, handlers
  return <div>...</div>;
};

// 3. PropTypes
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

// 4. Export
export default MyComponent;
```

### Documentation
- Use JSDoc comments for all functions
- Use PropTypes for all components
- Document complex logic with inline comments

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Adding a New Feature

1. Create feature folder in `src/features/`
2. Add pages, components, hooks as needed
3. Create repository in `src/data/repositories/`
4. Add routes in `src/app/AppRouter.js`
5. Update documentation

### Adding a New API Endpoint

1. Add endpoint to `src/data/client/apiConfig.js`
2. Create/update repository method
3. Use in feature hooks or pages

## 🔒 Security

- Auth tokens stored in localStorage
- HTTP interceptors add tokens to requests
- Automatic token refresh on 401 responses
- Protected routes with auth guards

## 📚 Documentation

- **Architecture Guide**: [REACT_LAYERED_ARCHITECTURE.md](../mds/REACT_LAYERED_ARCHITECTURE.md)
- **API Documentation**: [API_DOCUMENTATION.md](../mds/API_DOCUMENTATION.md)
- **Migration Guide**: See architecture doc

## 🚫 Technology Constraints

**This project uses plain JavaScript only:**
- ✅ Use `.js` and `.jsx` files
- ✅ Use JSDoc for documentation
- ✅ Use PropTypes for type checking
- ❌ NO TypeScript
- ❌ NO `.ts` or `.tsx` files
- ❌ NO type annotations

## 🤝 Contributing

1. Follow the layered architecture
2. Respect layer boundaries (no shortcuts)
3. Add PropTypes to all components
4. Document with JSDoc comments
5. Write tests for business logic

## 📄 License

MIT

