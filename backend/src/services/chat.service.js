import { NotFoundError, ForbiddenError, AppError } from '../errors/AppError.js';
import {
  findChatByParticipants,
  insertChat,
  findChatsForUser,
  findChatById,
  updateChatLastMessage,
  findMessagesByChat,
  insertMessage
} from '../repositories/chat.repository.js';

async function assertParticipant(chat, userId) {
  if (chat.buyer_id !== userId && chat.seller_id !== userId) {
    throw new ForbiddenError('No participas en esta conversacion');
  }
}

export async function startChat(buyerId, { sellerId, motorcycleId }) {
  const { data: existing } = await findChatByParticipants(buyerId, sellerId, motorcycleId);
  if (existing) return existing;

  const { data, error } = await insertChat({ buyerId, sellerId, motorcycleId });

  if (error) {
    throw new AppError(error.message, 400, 'CHAT_CREATE_FAILED');
  }

  return data;
}

export async function listChatsForUser(userId, role) {
  const { data, error } = await findChatsForUser(userId, role);

  if (error) {
    throw new AppError(error.message, 500, 'CHAT_LIST_FAILED');
  }

  return data;
}

export async function getMessages(chatId, user) {
  const { data: chat, error } = await findChatById(chatId);

  if (error || !chat) {
    throw new NotFoundError('Chat');
  }

  await assertParticipant(chat, user.id);

  const { data, error: msgError } = await findMessagesByChat(chatId);

  if (msgError) {
    throw new AppError(msgError.message, 500, 'CHAT_MESSAGES_FAILED');
  }

  return data;
}

export async function sendMessage(chatId, user, text) {
  const { data: chat, error } = await findChatById(chatId);

  if (error || !chat) {
    throw new NotFoundError('Chat');
  }

  await assertParticipant(chat, user.id);

  if (user.role !== 'buyer' && user.role !== 'seller') {
    throw new ForbiddenError('Solo compradores y vendedores pueden enviar mensajes');
  }

  const { data: message, error: msgError } = await insertMessage({ chatId, sender: user.role, text });

  if (msgError) {
    throw new AppError(msgError.message, 400, 'MESSAGE_SEND_FAILED');
  }

  await updateChatLastMessage(chatId, text);

  return message;
}
