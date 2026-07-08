// Fotos de stock reales (Pexels, licencia libre de uso comercial) usadas como
// imagen por defecto cuando un vendedor aun no sube fotos propias de la moto.
// Se agrupan por categoria para que el placeholder sea visualmente coherente
// con lo que se esta anunciando.
function pexelsUrl(id, width = 800) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

export const MOTORCYCLE_IMAGE_POOL = {
  scooter: [2393835, 2393816, 8964912, 13867583].map((id) => pexelsUrl(id)),
  naked: [2116475, 1416169, 1707817, 4600769].map((id) => pexelsUrl(id)),
  deportiva: [2611691, 1715185, 3874337, 976853].map((id) => pexelsUrl(id)),
  enduro: [8964912, 2519374, 5985998, 4390477].map((id) => pexelsUrl(id)),
  cub: [2611676, 1119796, 13867580, 2393244].map((id) => pexelsUrl(id)),
  electrica: [13861468, 13867583, 2116475, 1416169].map((id) => pexelsUrl(id))
};

export const DEFAULT_MOTORCYCLE_IMAGE = MOTORCYCLE_IMAGE_POOL.naked[0];

function hashSeed(seed) {
  const str = String(seed ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Elige imagenes de forma estable por moto (mismo id -> mismas fotos)
// en vez de aleatorio en cada render, rotando dentro del pool de la categoria.
export function getPlaceholderImages(category, seed, count = 3) {
  const pool = MOTORCYCLE_IMAGE_POOL[category] || MOTORCYCLE_IMAGE_POOL.naked;
  const start = hashSeed(seed) % pool.length;
  const total = Math.min(count, pool.length);
  return Array.from({ length: total }, (_, i) => pool[(start + i) % pool.length]);
}

export function getPlaceholderImage(category, seed) {
  return getPlaceholderImages(category, seed, 1)[0];
}
