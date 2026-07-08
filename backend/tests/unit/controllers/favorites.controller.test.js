import { add, remove, list } from '../../../src/controllers/favorites.controller.js';
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
      title: 'Moto favorita controller',
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

describe('Favorites Controller (Supabase local real)', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('add agrega un favorito real y responde 201', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const moto = await insertApprovedMotorcycle(seller.id);

    req.user = { id: buyer.id };
    req.body = { motorcycleId: moto.id };
    await add(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.motorcycle_id).toBe(moto.id);
  });

  it('remove elimina un favorito real y responde con el mensaje', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const moto = await insertApprovedMotorcycle(seller.id);

    req.user = { id: buyer.id };
    req.body = { motorcycleId: moto.id };
    await add(req, res);

    req.params.motorcycleId = moto.id;
    await remove(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Favorito eliminado' });
  });

  it('list responde con los favoritos reales del comprador autenticado', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const moto = await insertApprovedMotorcycle(seller.id);

    req.user = { id: buyer.id };
    req.body = { motorcycleId: moto.id };
    await add(req, res);

    req.user = { id: buyer.id };
    await list(req, res);

    const body = res.json.mock.calls[res.json.mock.calls.length - 1][0];
    expect(body.map((m) => m.id)).toContain(moto.id);
  });
});
