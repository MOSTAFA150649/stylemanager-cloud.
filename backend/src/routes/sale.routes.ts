import { Router } from 'express';
import { createSale, getTodaySales } from '../controllers/sale.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createSale);
router.get('/today', getTodaySales);

export default router;
