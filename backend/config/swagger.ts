import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MERN LMS API',
      version: '1.0.0',
      description: 'Enterprise-grade Learning Management System Backend API documentation. Built with MongoDB, Express, React, and Node.js.',
      contact: {
        name: 'API Support',
        email: 'support@mernlms.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./backend/modules/**/*.ts', './backend/app.ts'], // Path to the API docs inside the controllers
};

export const swaggerSpec = swaggerJsdoc(options);
