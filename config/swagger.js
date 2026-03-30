const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Habits Tracker API',
      version: '1.0.0',
      description: 'API documentation for Habits Tracker application',
      contact: {
        name: 'API Support',
        email: 'support@habitstracker.com'
      }
    },
    servers: [
      {
        url: 'https://gp1habitstrackerbackend-htyl9geu5-ess-projects-ecec6cc8.vercel.app',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};
