import {
  findApprovedMotorcycles,
  findMotorcyclesBySeller,
  findRelatedMotorcycles
} from '../../../src/repositories/motorcycles.repository.js';
import { supabaseAdmin } from '../../../src/config/supabase.js';
import { createRealUser, cleanupCreatedUsers } from '../../helpers/testData.js';

const createdMotorcycleIds = [];

afterAll(async () => {
  for (const id of createdMotorcycleIds.splice(0)) {
    await supabaseAdmin.from('motorcycles').delete().eq('id', id).catch?.(() => {});
  }
  await cleanupCreatedUsers();
});

async function insertApprovedMotorcycle(sellerId, overrides = {}) {
  const { data, error } = await supabaseAdmin
    .from('motorcycles')
    .insert({
      seller_id: sellerId,
      title: 'Moto repo real',
      brand: 'Honda',
      model: 'CB1',
      year: 2020,
      displacement_cc: 150,
      price: 6000,
      location: 'Huamanga',
      contact_phone: '900000000',
      status: 'approved',
      ...overrides
    })
    .select()
    .single();
  if (error) throw error;
  createdMotorcycleIds.push(data.id);
  return data;
}

describe('motorcycles.repository (Supabase local real)', () => {
  describe('findApprovedMotorcycles - paginacion', () => {
    it('respeta el limit indicado', async () => {
      const seller = await createRealUser({ role: 'seller' });
      await insertApprovedMotorcycle(seller.id, { brand: 'Yamaha', title: 'Pagina A' });
      await insertApprovedMotorcycle(seller.id, { brand: 'Yamaha', title: 'Pagina B' });
      await insertApprovedMotorcycle(seller.id, { brand: 'Yamaha', title: 'Pagina C' });

      const { data, error } = await findApprovedMotorcycles({ marca: 'Yamaha', limit: 2, page: 1 });

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
    });

    it('avanza de pagina con page=2', async () => {
      const seller = await createRealUser({ role: 'seller' });
      await insertApprovedMotorcycle(seller.id, { brand: 'Bajaj', title: 'Pag2 A' });
      await insertApprovedMotorcycle(seller.id, { brand: 'Bajaj', title: 'Pag2 B' });

      const { data: firstPage } = await findApprovedMotorcycles({ marca: 'Bajaj', limit: 1, page: 1 });
      const { data: secondPage } = await findApprovedMotorcycles({ marca: 'Bajaj', limit: 1, page: 2 });

      expect(firstPage).toHaveLength(1);
      expect(secondPage).toHaveLength(1);
      expect(firstPage[0].id).not.toBe(secondPage[0].id);
    });

    it('ignora un limit mayor al maximo permitido (100) sin lanzar error', async () => {
      const { error } = await findApprovedMotorcycles({ limit: 99999, page: 1 });
      expect(error).toBeNull();
    });

    it('usa todos los valores por defecto cuando se llama sin argumentos', async () => {
      const { error } = await findApprovedMotorcycles();
      expect(error).toBeNull();
    });

    it('usa los valores por defecto si limit/page vienen explicitamente en 0 (falsy)', async () => {
      const { error } = await findApprovedMotorcycles({ limit: 0, page: 0 });
      expect(error).toBeNull();
    });

    it('trata page=0 o negativo como pagina 1', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const moto = await insertApprovedMotorcycle(seller.id, { brand: 'Suzuki', title: 'Pagina cero' });

      const { data } = await findApprovedMotorcycles({ marca: 'Suzuki', page: -3 });

      expect(data.map((m) => m.id)).toContain(moto.id);
    });

    it('filtra por categoria, precio maximo, anio y condition (estado)', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const moto = await insertApprovedMotorcycle(seller.id, {
        brand: 'Kawasaki',
        category: 'naked',
        year: 2019,
        price: 5000,
        condition: 'used',
        title: 'Filtro completo'
      });

      const { data } = await findApprovedMotorcycles({
        categoria: 'naked',
        precioMax: 5000,
        anio: 2019,
        estado: 'used'
      });

      expect(data.map((m) => m.id)).toContain(moto.id);
    });
  });

  describe('findMotorcyclesBySeller', () => {
    it('devuelve solo las publicaciones del vendedor indicado, ordenadas por fecha', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const otherSeller = await createRealUser({ role: 'seller' });
      const mine = await insertApprovedMotorcycle(seller.id, { title: 'Mia' });
      await insertApprovedMotorcycle(otherSeller.id, { title: 'De otro' });

      const { data, error } = await findMotorcyclesBySeller(seller.id);

      expect(error).toBeNull();
      expect(data.map((m) => m.id)).toContain(mine.id);
      expect(data.every((m) => m.seller_id === seller.id)).toBe(true);
    });
  });

  describe('findRelatedMotorcycles', () => {
    it('devuelve motos aprobadas de la misma marca o categoria, excluyendo la propia', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const target = await insertApprovedMotorcycle(seller.id, { brand: 'Honda', category: 'naked', title: 'Objetivo' });
      const related = await insertApprovedMotorcycle(seller.id, { brand: 'Honda', category: 'scooter', title: 'Relacionada por marca' });

      const { data } = await findRelatedMotorcycles(target.id, { brand: 'Honda', category: 'naked' });

      const ids = data.map((m) => m.id);
      expect(ids).not.toContain(target.id);
      expect(ids).toContain(related.id);
    });
  });
});
