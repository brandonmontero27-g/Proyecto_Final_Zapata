import { supabaseAdmin } from '../config/supabase.js';

export function insertFavorite(userId, motorcycleId) {
  return supabaseAdmin.from('favorites').insert({ user_id: userId, motorcycle_id: motorcycleId }).select().single();
}

export function deleteFavorite(userId, motorcycleId) {
  return supabaseAdmin.from('favorites').delete().eq('user_id', userId).eq('motorcycle_id', motorcycleId);
}

export function findFavoritesByUser(userId) {
  return supabaseAdmin
    .from('favorites')
    .select('motorcycle_id, motorcycles(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export function countFavoritesByUser(userId) {
  return supabaseAdmin.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId);
}

export function countFavoritesForSellerMotorcycles(sellerId) {
  return supabaseAdmin
    .from('favorites')
    .select('motorcycle_id, motorcycles!inner(seller_id)', { count: 'exact', head: true })
    .eq('motorcycles.seller_id', sellerId);
}
