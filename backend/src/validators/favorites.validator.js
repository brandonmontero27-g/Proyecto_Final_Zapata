import { z } from 'zod';

export const addFavoriteSchema = z.object({
  motorcycleId: z.string().uuid('motorcycleId debe ser un UUID válido')
});
