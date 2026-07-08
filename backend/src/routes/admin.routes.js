import { Router } from 'express';
import {
  stats,
  pendingDocuments,
  reviewDoc,
  pendingMotorcycles,
  reviewMotorcycle,
  block,
  allMotorcycles,
  allUsers,
  setRole,
  logs
} from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { reviewDocSchema, blockUserSchema, motorcycleStatusSchema, setRoleSchema } from '../validators/admin.validator.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/stats', stats);
router.get('/documentos/pendientes', pendingDocuments);
router.put('/documentos/:id', validate(reviewDocSchema), reviewDoc);
router.get('/motos/pendientes', pendingMotorcycles);
router.get('/motos', allMotorcycles);
router.put('/motos/:id/estado', validate(motorcycleStatusSchema), reviewMotorcycle);
router.get('/usuarios', allUsers);
router.put('/usuarios/:id/bloquear', validate(blockUserSchema), block);
router.put('/usuarios/:id/rol', validate(setRoleSchema), setRole);
router.get('/logs', logs);

export default router;
