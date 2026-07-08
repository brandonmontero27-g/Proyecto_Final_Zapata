import {
  insertMotorcycle,
  findApprovedMotorcycles,
  findMotorcycleById,
  updateMotorcycleImages,
  findMotorcyclesBySeller,
  findRelatedMotorcycles
} from '../repositories/motorcycles.repository.js';
import { geocode } from './geocoding.service.js';
import { uploadMotorcycleImages } from './image.service.js';
import { notifyAdminsOfNewMotorcycle } from './notifications.service.js';
import { NotFoundError, ForbiddenError, AppError } from '../errors/AppError.js';
import logger from '../config/logger.js';

// Geocodificar es best-effort: si Nominatim falla o no responde, la
// publicacion se crea igual, solo sin coordenadas. Se omite en tests para no
// depender de red externa ni del limite de 1 req/segundo de Nominatim.
export async function resolveCoordinates(address, location) {
  if (process.env.NODE_ENV === 'test') {
    return { coordinateX: null, coordinateY: null };
  }

  try {
    const coords = await geocode(`${address}, ${location}, Peru`);
    if (!coords) return { coordinateX: null, coordinateY: null };
    return { coordinateX: coords.lon, coordinateY: coords.lat };
  } catch (err) {
    logger.warn('No se pudo geocodificar la direccion: ' + err.message);
    return { coordinateX: null, coordinateY: null };
  }
}

export async function createMotorcycle(sellerId, data) {
  const {
    title,
    brand,
    model,
    year,
    category,
    displacementCc,
    price,
    mileageKm,
    fuelType,
    transmission,
    color,
    description,
    location,
    address,
    contactPhone,
    whatsappPhone,
    stock,
    condition,
    images
  } = data;

  const { coordinateX, coordinateY } = await resolveCoordinates(address, location);

  const { data: motorcycle, error } = await insertMotorcycle({
    seller_id: sellerId,
    title,
    brand,
    model,
    year,
    category: category || 'naked',
    displacement_cc: displacementCc,
    price,
    mileage_km: mileageKm || 0,
    fuel_type: fuelType || 'gasolina',
    transmission: transmission || 'manual',
    color,
    description,
    location,
    address,
    contact_phone: contactPhone,
    whatsapp_phone: whatsappPhone || contactPhone,
    stock: stock || 1,
    condition: condition || 'used',
    images: images || [],
    status: 'pending',
    coordinate_x: coordinateX,
    coordinate_y: coordinateY
  });

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  try {
    await notifyAdminsOfNewMotorcycle({ motorcycleId: motorcycle.id, motorcycleTitle: motorcycle.title, actorId: sellerId });
  } catch (err) {
    logger.warn(`No se pudo notificar a los admins de la publicación ${motorcycle.id}: ${err.message}`);
  }

  return motorcycle;
}

export async function addMotorcycleImages(motorcycleId, user, images) {
  const { data: motorcycle, error } = await findMotorcycleById(motorcycleId);

  if (error || !motorcycle) {
    throw new NotFoundError('Moto');
  }

  if (motorcycle.seller_id !== user.id && user.role !== 'admin') {
    throw new ForbiddenError('No puedes editar fotos de una publicación que no es tuya');
  }

  const newUrls = await uploadMotorcycleImages(motorcycleId, images);
  const allImages = [...(motorcycle.images || []), ...newUrls];

  const { data: updated, error: updateError } = await updateMotorcycleImages(motorcycleId, allImages);

  if (updateError) {
    throw new AppError(updateError.message, 400, 'IMAGE_UPDATE_FAILED');
  }

  return updated;
}

export async function listMotorcycles(filters = {}) {
  const { data, error } = await findApprovedMotorcycles(filters);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
}

export async function listMyMotorcycles(sellerId) {
  const { data, error } = await findMotorcyclesBySeller(sellerId);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
}

export async function getMotorcycleDetail(id) {
  const { data: motorcycle, error } = await findMotorcycleById(id);

  if (error || !motorcycle) {
    throw new NotFoundError('Moto');
  }

  const { data: related } = await findRelatedMotorcycles(id, { brand: motorcycle.brand, category: motorcycle.category });

  return { ...motorcycle, related: related || [] };
}
