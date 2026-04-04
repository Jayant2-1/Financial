const swaggerJSDoc = require('swagger-jsdoc');

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Finance Data Processing API',
    version: '1.0.0',
    description: 'JWT cookie-based finance backend with RBAC'
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' }
    }
  }
};

module.exports = swaggerJSDoc({
  definition,
  apis: ['./src/routes/*.js']
});
