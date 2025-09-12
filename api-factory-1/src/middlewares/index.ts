// Setup all middlewares on the app
export function setupMiddlewares(app: any) {
    app.use(logger);
    app.use(authenticate);
    app.use(errorHandler);
}
import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // Placeholder for authentication logic
    const token = req.headers['authorization'];
    if (token) {
        // Validate token logic here
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
};