import { apiFetch } from "./client.js";

export function getBuyerStatsRequest(token) {
  return apiFetch("/stats/comprador", { token });
}

export function getSellerStatsRequest(token) {
  return apiFetch("/stats/vendedor", { token });
}
