import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('[Error]:', err.message || err);

    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
    });
};
