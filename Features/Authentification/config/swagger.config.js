import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
dotenv.config();

const hostname =  'localhost' || process.env.HOSTNAME ;
const port = process.env.PORT || 9090;



const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'TRIPY',
      version: '1.0.0',
      description: 'Description TRIPY BACKEND',
    },
    servers: [
      {
        url: 'http://' + hostname + ':' +port,
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
    },
    security: [{
      bearerAuth: []
    }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
 