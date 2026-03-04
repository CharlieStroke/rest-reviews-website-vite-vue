import { Request, Response, NextFunction } from 'express';
import { CreateReviewUseCase } from '../../../application/use-cases/reviews/CreateReviewUseCase';
import { CreateReviewSchema } from '../../../application/dtos/ReviewDTO';
import { z } from 'zod';

export class ReviewController {
    constructor(private createReviewUseCase: CreateReviewUseCase) { }

    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // We assume the user ID comes from the JWT Auth token (req.user), 
            // but the schema asks for it. We'll merge it with body.
            const payload = {
                ...req.body,
                userId: (req as any).user?.userId || req.body.userId // Fallback to body for now if JWT not fully attached
            };

            const validatedData = CreateReviewSchema.parse(payload);
            const review = await this.createReviewUseCase.execute(validatedData);

            res.status(201).json({
                success: true,
                message: 'Review submitted successfully',
                data: {
                    id: review.id,
                    establishmentId: review.establishmentId,
                    foodScore: review.foodScore,
                    serviceScore: review.serviceScore,
                    priceScore: review.priceScore,
                    createdAt: review.createdAt
                }
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, errors: (error as any).errors });
                return;
            }
            if (error instanceof Error && error.message.includes('already reviewed')) {
                res.status(409).json({ success: false, message: error.message }); // 409 Conflict
                return;
            }
            next(error);
        }
    };
}
