import { Router } from 'express';
import { buyerStats, sellerStats } from '../controllers/stats.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/comprador', requireAuth, requireRole('buyer'), buyerStats);
router.get('/vendedor', requireAuth, requireRole('seller'), sellerStats);

export default router;
