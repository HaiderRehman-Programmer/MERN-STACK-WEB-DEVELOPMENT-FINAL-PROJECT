import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PERN LMS API',
      version: '1.0.0',
      description: 'Enterprise-grade Learning Management System Backend API documentation. This interactive playground allows you to test endpoints directly.',
      contact: {
        name: 'API Support',
        email: 'support@pernlms.com',
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
  apis: ['./src/modules/**/*.ts', './src/app.ts'], // Path to the API docs inside the controllers
};

export const swaggerSpec = swaggerJsdoc(options);
