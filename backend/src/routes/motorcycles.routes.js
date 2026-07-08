import { Router } from 'express';
import { create, list, uploadImages, mine, detail } from '../controllers/motorcycles.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createMotorcycleSchema, uploadImagesSchema } from '../validators/motorcycles.validator.js';

const router = Router();

// Orden importa: auth/rol antes que validate, para que "sin token" siga
// devolviendo 401 (y "rol incorrecto" 403) aunque el body tambien sea invalido.
router.post('/', requireAuth, requireRole('seller', 'admin'), validate(createMotorcycleSchema), create);
router.get('/mine', requireAuth, requireRole('seller', 'admin'), mine);
router.get('/', list);
router.get('/:id', detail);
// La verificacion de "es tu propia publicacion" vive en el service (necesita
// leer la moto primero), no aqui como requireRole.
router.post('/:id/imagenes', requireAuth, validate(uploadImagesSchema), uploadImages);

export default router;
