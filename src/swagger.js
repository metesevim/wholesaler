import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wholesaler API',
      version: '1.0.0',
      description: 'API for managing wholesaler operations including authentication, customer management, and admin functions',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.wholesaler.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
              example: 1,
            },
            username: {
              type: 'string',
              description: 'Username',
              example: 'john_doe',
            },
            password: {
              type: 'string',
              description: 'Hashed password (not returned in responses)',
              format: 'password',
            },
            role: {
              type: 'string',
              enum: ['Admin', 'Employee'],
              description: 'User role',
              example: 'Employee',
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of permission strings',
              example: ['VIEW_CUSTOMERS', 'EDIT_CUSTOMERS'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
          },
        },
        Permission: {
          type: 'string',
          enum: [
            'VIEW_CUSTOMERS',
            'EDIT_CUSTOMERS',
            'CREATE_CUSTOMER',
            'VIEW_SUPPLIERS',
            'EDIT_SUPPLIERS',
            'CREATE_SUPPLIER',
            'VIEW_PRODUCTS',
            'EDIT_PRODUCTS',
            'CREATE_PRODUCT',
            'VIEW_ORDERS',
            'EDIT_ORDERS',
            'CREATE_ORDER',
          ],
          description: 'Available permissions',
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'john_doe',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'password', 'role'],
          properties: {
            username: {
              type: 'string',
              example: 'john_doe',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
            },
            role: {
              type: 'string',
              enum: ['Admin', 'Employee'],
              example: 'Employee',
            },
          },
        },
        CreateEmployeeRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'jane_smith',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
            },
            permissions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Permission',
              },
              description: 'Optional array of permissions to assign',
              example: ['VIEW_CUSTOMERS', 'CREATE_CUSTOMER'],
            },
          },
        },
        SetPermissionsRequest: {
          type: 'object',
          required: ['permissions'],
          properties: {
            permissions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Permission',
              },
              description: 'Array of permissions to set',
              example: ['VIEW_CUSTOMERS', 'EDIT_CUSTOMERS', 'VIEW_SUPPLIERS'],
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful',
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT token for authentication',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'User not found.',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'gayet iyi',
            },
            message: {
              type: 'string',
              example: 'Wholesaler API is running.',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };

