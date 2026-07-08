import { supabaseAdmin } from '../config/supabase.js';

export function findChatByParticipants(buyerId, sellerId, motorcycleId) {
  return supabaseAdmin
    .from('chats')
    .select('*')
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .eq('motorcycle_id', motorcycleId)
    .maybeSingle();
}

export function insertChat({ buyerId, sellerId, motorcycleId }) {
  return supabaseAdmin
    .from('chats')
    .insert({ buyer_id: buyerId, seller_id: sellerId, motorcycle_id: motorcycleId })
    .select()
    .single();
}

export function findChatsForUser(userId, role) {
  const column = role === 'seller' ? 'seller_id' : 'buyer_id';
  return supabaseAdmin
    .from('chats')
    .select('*, motorcycles(title)')
    .eq(column, userId)
    .order('updated_at', { ascending: false });
}

export function countChatsForUser(userId, role) {
  const column = role === 'seller' ? 'seller_id' : 'buyer_id';
  return supabaseAdmin.from('chats').select('*', { count: 'exact', head: true }).eq(column, userId);
}

export function findChatById(chatId) {
  return supabaseAdmin.from('chats').select('*').eq('id', chatId).single();
}

export function updateChatLastMessage(chatId, lastMessage) {
  return supabaseAdmin.from('chats').update({ last_message: lastMessage, unread: true }).eq('id', chatId);
}

export function findMessagesByChat(chatId) {
  return supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
}

export function insertMessage({ chatId, sender, text }) {
  return supabaseAdmin.from('chat_messages').insert({ chat_id: chatId, sender, text }).select().single();
}
