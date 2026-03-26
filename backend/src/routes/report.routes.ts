import { Router } from 'express';
import { getDashboardStats, getSalesReport } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/sales', getSalesReport);

export default router;
