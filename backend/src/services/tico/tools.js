import { listMotorcycles } from '../motorcycles.service.js';

// Definicion de herramientas agnostica al proveedor de IA: describe que
// puede hacer Tico y como ejecutarlo, sin saber nada de Gemini/Groq. La capa
// que sabe hablar con cada proveedor (tico.service.js / groq.provider.js)
// traduce esto a su formato.
export const searchMotorcyclesTool = {
  name: 'search_motorcycles',
  description:
    'Busca motos ya aprobadas y disponibles en MotoMarket, filtrando opcionalmente por marca, categoria y precio maximo en soles.',
  parameters: {
    type: 'OBJECT',
    properties: {
      marca: { type: 'STRING', description: 'Marca de la moto, ej. Honda, Yamaha, Bajaj' },
      categoria: { type: 'STRING', description: 'scooter, naked, deportiva, enduro, cub o electrica' },
      precio_max: { type: 'NUMBER', description: 'Precio maximo en soles' }
    }
  },
  execute: async (args) => {
    try {
      const motorcycles = await listMotorcycles({
        marca: typeof args.marca === 'string' ? args.marca : undefined,
        categoria: typeof args.categoria === 'string' ? args.categoria : undefined,
        precioMax: typeof args.precio_max === 'number' ? args.precio_max : undefined
      });

      return {
        total: motorcycles.length,
        motos: motorcycles.slice(0, 5).map((m) => ({
          titulo: m.title,
          marca: m.brand,
          modelo: m.model,
          anio: m.year,
          precio_soles: m.price,
          kilometraje_km: m.mileage_km
        }))
      };
    } catch {
      return { error: 'No se pudo consultar el catalogo de motos en este momento.' };
    }
  }
};

export const ticoTools = [searchMotorcyclesTool];
