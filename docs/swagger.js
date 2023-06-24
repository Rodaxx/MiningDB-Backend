const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MiningDB API Docs',
      version: '1.0.0',
      description: 'La documentacion de como utilizar la API de MiningDB',
    },
    components: {
      securitySchemes: {
          Authorization: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              value: "Bearer <JWT token here>"
          }
    }
  }
  },
  apis: ['./routes/*.js'], // Ruta de los archivos que contienen las rutas de tu API
};

const specs = swaggerJsdoc(options);
const swaggerUiOptions = {
  explorer: true
};


module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
};
