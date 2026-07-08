import { supabaseAdmin } from '../src/config/supabase.js';

export async function createUser({ email, password, role, name, phone }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role, phone }
  });
  if (error) throw error;
  // El profile se crea solo via el trigger handle_new_auth_user (ver database/schema.sql),
  // que lee name/role/phone de user_metadata.
  return { id: data.user.id, email, password, name, role };
}

export async function createListing(sellerId, motorcycleData) {
  const { data, error } = await supabaseAdmin
    .from('motorcycles')
    .insert({ seller_id: sellerId, status: 'approved', images: [], ...motorcycleData })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addFavorite(buyerId, motorcycleId) {
  const { error } = await supabaseAdmin.from('favorites').insert({ user_id: buyerId, motorcycle_id: motorcycleId });
  if (error) throw error;
}

export function pickRandom(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MODELS_BY_BRAND = {
  Honda: ['CB190R', 'XR150L', 'CBR250RR', 'Navi'],
  Yamaha: ['MT-03', 'YBR125', 'XTZ150', 'NMAX'],
  Bajaj: ['Pulsar NS200', 'Pulsar 180', 'Dominar 400', 'Boxer CT100'],
  KTM: ['Duke 200', 'Duke 390', 'RC 200'],
  Suzuki: ['Gixxer 150', 'Gixxer SF', 'Access 125'],
  TVS: ['Apache RTR 160', 'Raider 125', 'Sport 100'],
  Zongshen: ['ZS150', 'RX3', 'Cyclone RX3S'],
  Kawasaki: ['Z400', 'Ninja 400', 'KLX 150']
};

export const BRANDS = Object.keys(MODELS_BY_BRAND);

const CATEGORIES_BY_BRAND_HINT = {
  Duke: 'naked',
  RC: 'deportiva',
  Ninja: 'deportiva',
  CBR: 'deportiva',
  Z400: 'naked',
  MT: 'naked',
  Gixxer: 'naked',
  Apache: 'naked',
  NMAX: 'scooter',
  Access: 'scooter',
  Navi: 'scooter',
  Boxer: 'cub',
  Raider: 'cub',
  Sport: 'cub',
  YBR: 'cub',
  XR150L: 'enduro',
  XTZ150: 'enduro',
  RX3: 'enduro',
  KLX: 'enduro',
  Dominar: 'naked',
  Pulsar: 'naked',
  ZS150: 'cub'
};

function guessCategory(model) {
  const hit = Object.entries(CATEGORIES_BY_BRAND_HINT).find(([key]) => model.includes(key));
  return hit ? hit[1] : 'naked';
}

const CITIES = ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Ayacucho', 'Chiclayo', 'Piura'];
const COLORS = ['Rojo', 'Negro', 'Azul', 'Blanco', 'Gris', 'Naranja'];

// Fotos de stock reales (Pexels, licencia libre de uso comercial), no scraping.
// Se agrupan por categoria de moto para que el seed luzca como un catalogo real.
function pexelsUrl(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
}

const IMAGE_POOL = {
  scooter: [2393835, 2393816, 8964912, 13867583].map(pexelsUrl),
  naked: [2116475, 1416169, 1707817, 4600769].map(pexelsUrl),
  deportiva: [2611691, 1715185, 3874337, 976853].map(pexelsUrl),
  enduro: [8964912, 2519374, 5985998, 4390477].map(pexelsUrl),
  cub: [2611676, 1119796, 13867580, 2393244].map(pexelsUrl),
  electrica: [13861468, 13867583, 2116475, 1416169].map(pexelsUrl)
};

function pickListingImages(category) {
  const pool = IMAGE_POOL[category] || IMAGE_POOL.naked;
  const count = randomInt(2, 3);
  return pickRandom(pool, Math.min(count, pool.length));
}

const DESCRIPTION_TEMPLATES = [
  (brand, model) => `${brand} ${model} en excelente estado, mantenimiento al dia y papeles en regla.`,
  (brand, model) => `Se vende ${brand} ${model}, unico dueño, uso particular. Acepto cambio con moto de menor valor.`,
  (brand, model) => `${brand} ${model} recien revisada, llantas nuevas, lista para transferencia inmediata.`,
  (brand, model) => `Oportunidad: ${brand} ${model} full equipo, ideal para trabajo o uso diario en la ciudad.`
];

const PRICE_BY_CATEGORY = {
  scooter: [4500, 8500],
  naked: [7500, 16000],
  deportiva: [13000, 28000],
  enduro: [8000, 15000],
  cub: [4000, 7500],
  electrica: [5500, 12000]
};

export function buildSyntheticListing(city, brand) {
  const models = MODELS_BY_BRAND[brand] || MODELS_BY_BRAND.Honda;
  const model = models[randomInt(0, models.length - 1)];
  const category = guessCategory(model);
  const condition = Math.random() < 0.6 ? 'used' : 'new';
  const year = condition === 'new' ? 2025 : randomInt(2015, 2024);
  const descTemplate = DESCRIPTION_TEMPLATES[randomInt(0, DESCRIPTION_TEMPLATES.length - 1)];
  const [minPrice, maxPrice] = PRICE_BY_CATEGORY[category] || [7000, 15000];
  const phone = `9${randomInt(10000000, 99999999)}`;

  return {
    title: `${brand} ${model} ${year}`,
    brand,
    model,
    year,
    category,
    displacement_cc: randomInt(100, 400),
    price: randomInt(minPrice, maxPrice),
    mileage_km: condition === 'new' ? 0 : randomInt(500, 40000),
    fuel_type: category === 'electrica' ? 'electrica' : 'gasolina',
    transmission: 'manual',
    color: COLORS[randomInt(0, COLORS.length - 1)],
    condition,
    stock: randomInt(1, 3),
    location: city,
    address: `Av. Principal ${randomInt(100, 950)}`,
    description: descTemplate(brand, model),
    contact_phone: phone,
    whatsapp_phone: phone,
    images: pickListingImages(category)
  };
}
