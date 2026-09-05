// utils/swagger.js
// Auto-generates OpenAPI 3.0 documentation for all API endpoints.
// Accessible at GET /api/docs in development mode.

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MindMirror API',
      version: '1.0.0',
      description: 'Mental wellness journaling application with AI-powered insights',
      contact: { name: 'MindMirror' },
    },
    servers: [{ url: '/api', description: 'API server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Validation failed' },
          },
        },
        JournalEntry: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            mood: { type: 'number', minimum: 1, maximum: 10 },
            date: { type: 'string', format: 'date-time' },
            themes: { type: 'array', items: { type: 'string' } },
            sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
          },
        },
        VideoReflection: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            note: { type: 'string' },
            videoUrl: { type: 'string' },
            processingStatus: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
            transcript: { type: 'string' },
            summary: { type: 'string' },
            mood_score: { type: 'number' },
          },
        },
        Job: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            state: { type: 'string', enum: ['waiting', 'active', 'completed', 'failed'] },
            progress: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
