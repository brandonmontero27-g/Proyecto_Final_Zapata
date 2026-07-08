import {
  createMotorcycle,
  listMotorcycles,
  addMotorcycleImages,
  listMyMotorcycles,
  getMotorcycleDetail
} from '../services/motorcycles.service.js';

export async function create(req, res) {
  const motorcycle = await createMotorcycle(req.user.id, req.body);
  res.status(201).json(motorcycle);
}

export async function uploadImages(req, res) {
  const motorcycle = await addMotorcycleImages(req.params.id, req.user, req.body.images);
  res.json(motorcycle);
}

export async function list(req, res) {
  const { marca, categoria, precio_max, anio, estado, page, limit } = req.query;
  const motorcycles = await listMotorcycles({ marca, categoria, precioMax: precio_max, anio, estado, page, limit });
  res.json(motorcycles);
}

export async function mine(req, res) {
  const motorcycles = await listMyMotorcycles(req.user.id);
  res.json(motorcycles);
}

export async function detail(req, res) {
  const motorcycle = await getMotorcycleDetail(req.params.id);
  res.json(motorcycle);
}
