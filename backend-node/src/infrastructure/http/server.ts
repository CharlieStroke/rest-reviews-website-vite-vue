import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRouter from './routes/auth.routes';
import reviewRouter from './routes/review.routes';
import { globalErrorHandler } from './middlewares/ErrorMiddleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Utility Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/reviews', reviewRouter);

// Global Error Handler
app.use(globalErrorHandler);

// Start Server (If explicitly run, not exported)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`Check health at: http://localhost:${PORT}/health`);
    });
}

export default app;
