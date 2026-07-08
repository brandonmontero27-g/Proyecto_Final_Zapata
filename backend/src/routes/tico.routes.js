import { Router } from 'express';
import { chat } from '../controllers/tico.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ticoChatSchema } from '../validators/tico.validator.js';

const router = Router();

router.post('/chat', validate(ticoChatSchema), chat);

export default router;
