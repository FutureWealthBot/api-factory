import { config } from 'dotenv';

config();

const appConfig = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'database',
  },
  api: {
    key: process.env.API_KEY || 'your-api-key',
  },
};

export default appConfig;