import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { container } from '../../config/container';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middlewares/AuthMiddleware';

/**
 * @swagger
 * components:
 *   headers:
 *     RateLimit:
 *       description: Auth endpoints are rate limited to 10 requests per 15-minute window per IP
 */
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.'
    }
});

const authRouter = Router();
const authController = container.resolve(AuthController);

authRouter.post('/register', authRateLimiter, authController.register);
authRouter.post('/login', authRateLimiter, authController.login);
authRouter.post('/refresh', authRateLimiter, authController.refresh);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user info
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
authRouter.get('/me', authenticateToken, authController.getMe);
authRouter.patch('/me', authenticateToken, authController.updateMe);

export default authRouter;
