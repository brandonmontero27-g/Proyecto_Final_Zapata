import { apiFetch } from "./client.js";

export function listMotorcyclesRequest({ marca, categoria, precio_max, anio, estado, page, limit } = {}) {
  return apiFetch("/motorcycles", { params: { marca, categoria, precio_max, anio, estado, page, limit } });
}

export function getMotorcycleRequest(id) {
  return apiFetch(`/motorcycles/${id}`);
}

export function createMotorcycleRequest(token, data) {
  return apiFetch("/motorcycles", { method: "POST", token, body: data });
}

export function uploadMotorcycleImagesRequest(token, motorcycleId, images) {
  return apiFetch(`/motorcycles/${motorcycleId}/imagenes`, { method: "POST", token, body: { images } });
}

export function listMyMotorcyclesRequest(token) {
  return apiFetch("/motorcycles/mine", { token });
}
