import { apiFetch } from "./client.js";

export function listFavoritesRequest(token) {
  return apiFetch("/favoritos", { token });
}

export function addFavoriteRequest(token, motorcycleId) {
  return apiFetch("/favoritos", { method: "POST", token, body: { motorcycleId } });
}

export function removeFavoriteRequest(token, motorcycleId) {
  return apiFetch(`/favoritos/${motorcycleId}`, { method: "DELETE", token });
}
