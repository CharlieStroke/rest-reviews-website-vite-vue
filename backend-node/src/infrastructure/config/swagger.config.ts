import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.config';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'REST Reviews API',
            version: '1.0.0',
            description: 'API for Managing Establishments and Reviews',
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: 'Local Server',
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
            schemas: {
                RegisterUserInput: {
                    type: 'object',
                    required: ['name', 'email', 'password', 'role'],
                    properties: {
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 6 },
                        role: { type: 'string', enum: ['student', 'manager', 'admin'] }
                    }
                },
                LoginUserInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string' },
                        password: { type: 'string' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                name: { type: 'string' },
                                email: { type: 'string' },
                                role: { type: 'string' },
                                token: { type: 'string' }
                            }
                        }
                    }
                },
                CreateReviewInput: {
                    type: 'object',
                    required: ['userId', 'establishmentId', 'foodScore', 'serviceScore', 'priceScore', 'comment'],
                    properties: {
                        userId: { type: 'string' },
                        establishmentId: { type: 'string' },
                        foodScore: { type: 'integer' },
                        serviceScore: { type: 'integer' },
                        priceScore: { type: 'integer' },
                        comment: { type: 'string' }
                    }
                },
                ReviewResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                establishmentId: { type: 'string' },
                                foodScore: { type: 'integer' },
                                serviceScore: { type: 'integer' },
                                priceScore: { type: 'integer' },
                                createdAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Paths to files containing OpenAPI documentation comments
    apis: ['./src/infrastructure/http/routes/*.ts', './src/infrastructure/http/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
