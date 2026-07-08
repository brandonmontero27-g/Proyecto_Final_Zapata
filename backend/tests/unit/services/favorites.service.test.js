import { addFavorite, removeFavorite, listFavorites } from '../../../src/services/favorites.service.js';
import * as favoritesRepo from '../../../src/repositories/favorites.repository.js';
import { supabaseAdmin } from '../../../src/config/supabase.js';
import { createRealUser, cleanupCreatedUsers } from '../../helpers/testData.js';

const createdMotorcycleIds = [];

afterAll(async () => {
  for (const id of createdMotorcycleIds.splice(0)) {
    await supabaseAdmin.from('motorcycles').delete().eq('id', id).catch?.(() => {});
  }
  await cleanupCreatedUsers();
});

async function insertApprovedMotorcycle(sellerId) {
  const { data, error } = await supabaseAdmin
    .from('motorcycles')
    .insert({
      seller_id: sellerId,
      title: 'Moto favorita real',
      brand: 'Honda',
      model: 'CB1',
      year: 2020,
      displacement_cc: 150,
      price: 6000,
      location: 'San Blas',
      contact_phone: '900000000',
      status: 'approved'
    })
    .select()
    .single();
  if (error) throw error;
  createdMotorcycleIds.push(data.id);
  return data;
}

describe('Favorites Service (Supabase local real)', () => {
  describe('addFavorite', () => {
    it('agrega un favorito real', async () => {
      const buyer = await createRealUser({ role: 'buyer' });
      const seller = await createRealUser({ role: 'seller' });
      const moto = await insertApprovedMotorcycle(seller.id);

      const favorite = await addFavorite(buyer.id, moto.id);

      expect(favorite.user_id).toBe(buyer.id);
      expect(favorite.motorcycle_id).toBe(moto.id);
    });

    it('lanza error con statusCode 400 si el motorcycle_id no existe (violacion de FK real)', async () => {
      const buyer = await createRealUser({ role: 'buyer' });
      const fakeMotorcycleId = '00000000-0000-0000-0000-000000000000';

      await expect(addFavorite(buyer.id, fakeMotorcycleId)).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('removeFavorite', () => {
    it('elimina un favorito real', async () => {
      const buyer = await createRealUser({ role: 'buyer' });
      const seller = await createRealUser({ role: 'seller' });
      const moto = await insertApprovedMotorcycle(seller.id);
      await addFavorite(buyer.id, moto.id);

      const result = await removeFavorite(buyer.id, moto.id);

      expect(result).toEqual({ message: 'Favorito eliminado' });
      const { data } = await supabaseAdmin
        .from('favorites')
        .select('*')
        .eq('user_id', buyer.id)
        .eq('motorcycle_id', moto.id);
      expect(data).toHaveLength(0);
    });

    it('lanza error con statusCode 400 si el repositorio falla', async () => {
      const originalFn = favoritesRepo.deleteFavorite;
      favoritesRepo.deleteFavorite = jest.fn().mockResolvedValue({ error: { message: 'fail' } });

      try {
        await expect(removeFavorite('cualquier-id', 'cualquier-moto')).rejects.toMatchObject({ statusCode: 400 });
      } finally {
        favoritesRepo.deleteFavorite = originalFn;
      }
    });
  });

  describe('listFavorites', () => {
    it('devuelve las motos favoritas reales del comprador', async () => {
      const buyer = await createRealUser({ role: 'buyer' });
      const seller = await createRealUser({ role: 'seller' });
      const moto = await insertApprovedMotorcycle(seller.id);
      await addFavorite(buyer.id, moto.id);

      const favorites = await listFavorites(buyer.id);

      expect(favorites.map((m) => m.id)).toContain(moto.id);
    });

    it('lanza error con statusCode 500 si el repositorio falla', async () => {
      const originalFn = favoritesRepo.findFavoritesByUser;
      favoritesRepo.findFavoritesByUser = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });

      try {
        await expect(listFavorites('cualquier-id')).rejects.toMatchObject({ statusCode: 500 });
      } finally {
        favoritesRepo.findFavoritesByUser = originalFn;
      }
    });
  });
});
