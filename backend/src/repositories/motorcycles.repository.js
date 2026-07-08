import { supabaseAdmin } from '../config/supabase.js';

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export function insertMotorcycle(record) {
  return supabaseAdmin.from('motorcycles').insert(record).select().single();
}

// Paginado via .range(): sin esto, un catalogo approved que crezca trae todas
// las filas en cada request (era el principal cuello de botella de /motorcycles).
export function findApprovedMotorcycles({ marca, categoria, precioMax, anio, estado, page = 1, limit = DEFAULT_LIMIT } = {}) {
  const safeLimit = Math.min(Number(limit) || DEFAULT_LIMIT, MAX_LIMIT);
  const safePage = Math.max(Number(page) || 1, 1);
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabaseAdmin
    .from('motorcycles')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (marca) query = query.eq('brand', marca);
  if (categoria) query = query.eq('category', categoria);
  if (precioMax) query = query.lte('price', Number(precioMax));
  if (anio) query = query.eq('year', Number(anio));
  if (estado) query = query.eq('condition', estado);

  return query;
}

export function findMotorcycleById(id) {
  return supabaseAdmin.from('motorcycles').select('*').eq('id', id).single();
}

export function findMotorcyclesBySeller(sellerId) {
  return supabaseAdmin
    .from('motorcycles')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
}

export function updateMotorcycleImages(id, images) {
  return supabaseAdmin.from('motorcycles').update({ images }).eq('id', id).select().single();
}

// Motos de la misma marca o categoria, excluyendo la propia (seccion
// "Motos relacionadas" del detalle).
export function findRelatedMotorcycles(motorcycleId, { brand, category }) {
  return supabaseAdmin
    .from('motorcycles')
    .select('*')
    .eq('status', 'approved')
    .neq('id', motorcycleId)
    .or(`brand.eq.${brand},category.eq.${category}`)
    .order('created_at', { ascending: false })
    .limit(4);
}
