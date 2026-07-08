import { z } from 'zod';

export const startChatSchema = z.object({
  sellerId: z.string().uuid('sellerId debe ser un uuid valido'),
  motorcycleId: z.string().uuid('motorcycleId debe ser un uuid valido')
});

export const sendMessageSchema = z.object({
  text: z.string().min(1, 'El mensaje no puede estar vacio').max(4000)
});
