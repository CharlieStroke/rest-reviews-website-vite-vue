import { Router } from 'express';
import { container } from '../../config/container';
import { ReviewController } from '../controllers/ReviewController';
import { authenticateToken } from '../middlewares/AuthMiddleware';

const reviewRouter = Router();

// Resolve Controller with all its dependencies automatically
const reviewController = container.resolve(ReviewController);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new review
 *     description: Allows authenticated users to create a review for an establishment.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - establishmentId
 *               - foodScore
 *               - serviceScore
 *               - priceScore
 *               - comment
 *             properties:
 *               userId:
 *                 type: string
 *               establishmentId:
 *                 type: string
 *               foodScore:
 *                 type: integer
 *               serviceScore:
 *                 type: integer
 *               priceScore:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User has already reviewed this establishment
 */
reviewRouter.post('/', authenticateToken, reviewController.create);

export default reviewRouter;
