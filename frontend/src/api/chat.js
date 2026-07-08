import { apiFetch } from "./client.js";

export function startChatRequest(token, sellerId, motorcycleId) {
  return apiFetch("/chats", { method: "POST", token, body: { sellerId, motorcycleId } });
}

export function listChatsRequest(token) {
  return apiFetch("/chats", { token });
}

export function getMessagesRequest(token, chatId) {
  return apiFetch(`/chats/${chatId}/messages`, { token });
}

export function sendMessageRequest(token, chatId, text) {
  return apiFetch(`/chats/${chatId}/messages`, { method: "POST", token, body: { text } });
}
