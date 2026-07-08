import { z } from 'zod';

export const createMotorcycleSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  brand: z.string().min(1, 'La marca es obligatoria'),
  model: z.string().min(1, 'El modelo es obligatorio'),
  year: z.coerce.number().int().min(1980, 'El año no es válido'),
  category: z.enum(['scooter', 'naked', 'deportiva', 'enduro', 'cub', 'electrica']).optional(),
  displacementCc: z.coerce.number().int().nonnegative('El cilindraje no puede ser negativo'),
  price: z.coerce.number().nonnegative('El precio no puede ser negativo'),
  mileageKm: z.coerce.number().int().nonnegative('El kilometraje no puede ser negativo').optional(),
  fuelType: z.enum(['gasolina', 'electrica', 'hibrida']).optional(),
  transmission: z.enum(['manual', 'automatica']).optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  location: z.string().min(1, 'La ubicación es obligatoria'),
  address: z.string().optional(),
  contactPhone: z.string().min(1, 'El teléfono de contacto es obligatorio'),
  whatsappPhone: z.string().optional(),
  stock: z.coerce.number().int().nonnegative('El stock no puede ser negativo').optional(),
  condition: z.enum(['new', 'used']).optional(),
  images: z.array(z.string()).optional()
});

export const uploadImagesSchema = z.object({
  images: z
    .array(z.string().min(1))
    .min(1, 'Debes enviar al menos una imagen')
    .max(8, 'Máximo 8 imágenes por publicación')
});
