import { apiFetch } from "./client.js";

export function sendTicoMessage(message, history) {
  return apiFetch("/tico/chat", { method: "POST", body: { message, history } });
}
