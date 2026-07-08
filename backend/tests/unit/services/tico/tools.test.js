import { searchMotorcyclesTool } from '../../../../src/services/tico/tools.js';
import * as motorcyclesService from '../../../../src/services/motorcycles.service.js';
import { supabaseAdmin } from '../../../../src/config/supabase.js';
import { createRealUser, cleanupCreatedUsers } from '../../../helpers/testData.js';

const createdMotorcycleIds = [];

afterAll(async () => {
  for (const id of createdMotorcycleIds.splice(0)) {
    await supabaseAdmin.from('motorcycles').delete().eq('id', id).catch?.(() => {});
  }
  await cleanupCreatedUsers();
});

describe('searchMotorcyclesTool', () => {
  it('busca motos reales aprobadas y mapea los campos esperados', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const { data: moto } = await supabaseAdmin
      .from('motorcycles')
      .insert({
        seller_id: seller.id,
        title: 'Moto para Tico',
        brand: 'Tico Marca Real',
        model: 'TC1',
        year: 2021,
        displacement_cc: 150,
        price: 7000,
        mileage_km: 500,
        location: 'Huamanga',
        contact_phone: '900000000',
        status: 'approved'
      })
      .select()
      .single();
    createdMotorcycleIds.push(moto.id);

    const result = await searchMotorcyclesTool.execute({ marca: 'Tico Marca Real' });

    expect(result.total).toBeGreaterThanOrEqual(1);
    const mapped = result.motos.find((m) => m.titulo === 'Moto para Tico');
    expect(mapped.marca).toBe('Tico Marca Real');
    expect(Number(mapped.precio_soles)).toBe(7000);
    expect(mapped.kilometraje_km).toBe(500);
  });

  it('pasa categoria y precio_max cuando vienen con el tipo correcto (string/number)', async () => {
    const originalFn = motorcyclesService.listMotorcycles;
    motorcyclesService.listMotorcycles = jest.fn().mockResolvedValue([]);

    try {
      await searchMotorcyclesTool.execute({ categoria: 'naked', precio_max: 5000, marca: 'Honda' });

      expect(motorcyclesService.listMotorcycles).toHaveBeenCalledWith({
        categoria: 'naked',
        precioMax: 5000,
        marca: 'Honda'
      });
    } finally {
      motorcyclesService.listMotorcycles = originalFn;
    }
  });

  it('ignora argumentos con tipos incorrectos (no son string/number)', async () => {
    const originalFn = motorcyclesService.listMotorcycles;
    motorcyclesService.listMotorcycles = jest.fn().mockResolvedValue([]);

    try {
      await searchMotorcyclesTool.execute({ categoria: 123, precio_max: '200', marca: 456 });

      expect(motorcyclesService.listMotorcycles).toHaveBeenCalledWith({
        categoria: undefined,
        precioMax: undefined,
        marca: undefined
      });
    } finally {
      motorcyclesService.listMotorcycles = originalFn;
    }
  });

  it('devuelve como maximo 5 resultados', async () => {
    const originalFn = motorcyclesService.listMotorcycles;
    const many = Array.from({ length: 8 }, (_, i) => ({
      title: `M${i}`,
      brand: 'X',
      model: 'X',
      year: 2020,
      price: 100,
      mileage_km: 5
    }));
    motorcyclesService.listMotorcycles = jest.fn().mockResolvedValue(many);

    try {
      const result = await searchMotorcyclesTool.execute({});
      expect(result.total).toBe(8);
      expect(result.motos).toHaveLength(5);
    } finally {
      motorcyclesService.listMotorcycles = originalFn;
    }
  });

  it('devuelve un error legible si listMotorcycles falla', async () => {
    const originalFn = motorcyclesService.listMotorcycles;
    motorcyclesService.listMotorcycles = jest.fn().mockRejectedValue(new Error('DB caida'));

    try {
      const result = await searchMotorcyclesTool.execute({});
      expect(result).toEqual({ error: 'No se pudo consultar el catalogo de motos en este momento.' });
    } finally {
      motorcyclesService.listMotorcycles = originalFn;
    }
  });
});
