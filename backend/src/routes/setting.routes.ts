import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate, requireAdmin, updateSettings);

export default router;
