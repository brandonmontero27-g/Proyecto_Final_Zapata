import 'dotenv/config';
import { supabaseAdmin } from '../src/config/supabase.js';
import { geocode } from '../src/services/geocoding.service.js';

// Utilidad de un solo uso: geocodifica las publicaciones existentes que no
// tienen coordenadas (ej. las creadas por el seed, que inserta directo a la
// tabla sin pasar por motorcycles.service.js). Respeta el limite de Nominatim
// de 1 req/segundo con una pausa entre llamadas.

// Caja delimitadora aproximada del territorio peruano. Cualquier resultado de
// Nominatim fuera de este rango se descarta (evita falsos positivos de una
// ciudad homonima en otro pais).
const PERU_BOUNDS = { minLat: -18.5, maxLat: -0.03, minLon: -81.4, maxLon: -68.6 };

// Centroides verificados manualmente contra Nominatim, usados como respaldo
// cuando la direccion exacta (sintetica) no da match.
const CITY_CENTROIDS = {
  Lima: { lat: -12.0464, lon: -77.0428 },
  Arequipa: { lat: -16.409, lon: -71.5375 },
  Trujillo: { lat: -8.1116, lon: -79.0288 },
  Cusco: { lat: -13.5319, lon: -71.9675 },
  Ayacucho: { lat: -13.1588, lon: -74.2239 },
  Chiclayo: { lat: -6.7714, lon: -79.8409 },
  Piura: { lat: -5.1945, lon: -80.6328 }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function inBounds(lat, lon) {
  return (
    lat >= PERU_BOUNDS.minLat &&
    lat <= PERU_BOUNDS.maxLat &&
    lon >= PERU_BOUNDS.minLon &&
    lon <= PERU_BOUNDS.maxLon
  );
}

// Jitter pequeño y estable por id para que las publicaciones de una misma
// ciudad no queden todas apiladas en el mismo punto exacto.
function jitter(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const a = ((hash % 1000) / 1000 - 0.5) * 0.03;
  const b = (((hash >> 8) % 1000) / 1000 - 0.5) * 0.03;
  return { dLat: a, dLon: b };
}

async function run() {
  const { data: motorcycles, error } = await supabaseAdmin
    .from('motorcycles')
    .select('id, address, location, title');

  if (error) {
    console.error('Error consultando publicaciones:', error.message);
    process.exit(1);
  }

  console.log(`${motorcycles.length} publicaciones a procesar.`);

  let exact = 0;
  let approx = 0;
  let skipped = 0;

  for (const motorcycle of motorcycles) {
    let lat;
    let lon;
    let source;

    const query = `${motorcycle.address}, ${motorcycle.location}, Peru`;
    try {
      const coords = await geocode(query);
      if (coords && inBounds(coords.lat, coords.lon)) {
        lat = coords.lat;
        lon = coords.lon;
        source = 'exacta';
      }
    } catch {
      // se resuelve por el fallback de abajo
    }
    await sleep(1100);

    if (lat == null) {
      const centroid = CITY_CENTROIDS[motorcycle.location];
      if (centroid) {
        const { dLat, dLon } = jitter(motorcycle.id);
        lat = centroid.lat + dLat;
        lon = centroid.lon + dLon;
        source = 'ciudad (aproximada)';
      }
    }

    if (lat == null) {
      console.log(`Sin ciudad conocida, se omite: "${motorcycle.title}" (${motorcycle.location})`);
      skipped += 1;
      continue;
    }

    const { error: updateError } = await supabaseAdmin
      .from('motorcycles')
      .update({ coordinate_x: lon, coordinate_y: lat })
      .eq('id', motorcycle.id);

    if (updateError) {
      console.log(`Error guardando "${motorcycle.title}": ${updateError.message}`);
      skipped += 1;
    } else {
      console.log(`OK (${source}): "${motorcycle.title}" -> (${lat.toFixed(5)}, ${lon.toFixed(5)})`);
      if (source === 'exacta') exact += 1;
      else approx += 1;
    }
  }

  console.log(`\nCompletado. ${exact} con direccion exacta, ${approx} aproximadas por ciudad, ${skipped} omitidas.`);
}

run().catch((err) => {
  console.error('Fallo el backfill:', err.message);
  process.exit(1);
});
