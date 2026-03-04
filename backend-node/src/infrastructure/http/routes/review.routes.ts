import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { PrismaReviewRepository } from '../../repositories/PrismaReviewRepository';
import { PrismaUserRepository } from '../../repositories/PrismaUserRepository';
import { PrismaEstablishmentRepository } from '../../repositories/PrismaEstablishmentRepository';
import { CreateReviewUseCase } from '../../../application/use-cases/reviews/CreateReviewUseCase';
import { authenticateToken } from '../middlewares/AuthMiddleware';

const reviewRouter = Router();

// Instantiate repositories
const reviewRepo = new PrismaReviewRepository();
const userRepo = new PrismaUserRepository();
const establishmentRepo = new PrismaEstablishmentRepository();

// Instantiate Use Case
const createReviewUseCase = new CreateReviewUseCase(reviewRepo, userRepo, establishmentRepo);

// Instantiate Controller
const reviewController = new ReviewController(createReviewUseCase);

// Routes
reviewRouter.post('/', authenticateToken, reviewController.create);

export default reviewRouter;
