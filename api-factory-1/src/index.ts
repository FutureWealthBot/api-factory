import express from 'express';
import { setupRoutes } from './routes';
import { setupMiddlewares } from './middlewares';
import config from './config';

const app = express();
const PORT = config.port || 3000;

// Middleware setup
setupMiddlewares(app);

// Routes setup
setupRoutes(app);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

export default app;