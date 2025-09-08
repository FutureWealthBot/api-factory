import express from 'express';
import marketingRoutes from './marketingRoutes';

const app = express();
app.use(express.json());
app.use('/api/marketing', marketingRoutes);

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Admin API listening on port ${PORT}`);
});
