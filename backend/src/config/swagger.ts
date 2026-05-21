import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SAI Physiotherapy API',
      version: '1.0.0',
      description:
        'Enterprise REST API for SAI Physiotherapy Spine Care & Paralysis Centre. Gujarat, India.',
      contact: {
        name: 'SAI Physiotherapy',
        email: 'clinic@saiphysiotherapy.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
      {
        url: 'https://api.saiphysiotherapy.com/api/v1',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter: Bearer <access_token>',
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & authorization' },
      { name: 'Patients', description: 'Patient management & EMR' },
      { name: 'Appointments', description: 'Appointment booking & management' },
      { name: 'Sessions', description: 'Treatment sessions & SOAP notes' },
      { name: 'Billing', description: 'Offline billing & invoice management' },
      { name: 'Services', description: 'Clinic services catalog' },
      { name: 'Blog', description: 'Blog & health articles' },
      { name: 'Testimonials', description: 'Patient testimonials & reviews' },
      { name: 'Settings', description: 'CMS & clinic configuration' },
      { name: 'Analytics', description: 'Reports & analytics dashboard' },
      { name: 'Upload', description: 'File upload (Cloudinary)' },
    ],
  },
  apis: ['./src/routes/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
