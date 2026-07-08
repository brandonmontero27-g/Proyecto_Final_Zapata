import { create, list, mine, detail } from '../../../src/controllers/motorcycles.controller.js';
import { supabaseAdmin } from '../../../src/config/supabase.js';
import { createRealUser, cleanupCreatedUsers } from '../../helpers/testData.js';

const createdMotorcycleIds = [];

afterAll(async () => {
  for (const id of createdMotorcycleIds.splice(0)) {
    await supabaseAdmin.from('motorcycles').delete().eq('id', id).catch?.(() => {});
  }
  await cleanupCreatedUsers();
});

describe('Motorcycles Controller (Supabase local real)', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('create publica una moto real con el vendedor autenticado y responde 201', async () => {
    const seller = await createRealUser({ role: 'seller' });
    req.user = { id: seller.id };
    req.body = {
      title: 'Moto Controller Real',
      brand: 'Honda',
      model: 'CB1',
      year: 2021,
      displacementCc: 150,
      price: 7000,
      location: 'San Blas',
      address: 'Jr. Controller 1',
      contactPhone: '900000000'
    };

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.seller_id).toBe(seller.id);
    createdMotorcycleIds.push(body.id);
  });

  it('list devuelve solo publicaciones aprobadas reales aplicando filtros', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const { data: approved } = await supabaseAdmin
      .from('motorcycles')
      .insert({
        seller_id: seller.id,
        title: 'Approved Controller Real',
        brand: 'Yamaha',
        model: 'XTZ',
        year: 2020,
        displacement_cc: 125,
        price: 5000,
        location: 'Belén',
        contact_phone: '900000000',
        status: 'approved'
      })
      .select()
      .single();
    createdMotorcycleIds.push(approved.id);

    req.query = { marca: 'Yamaha' };
    await list(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.map((m) => m.id)).toContain(approved.id);
  });

  it('mine devuelve solo las publicaciones reales del vendedor autenticado', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const { data: moto } = await supabaseAdmin
      .from('motorcycles')
      .insert({
        seller_id: seller.id,
        title: 'Mia controller real',
        brand: 'Suzuki',
        model: 'GN125',
        year: 2019,
        displacement_cc: 125,
        price: 4500,
        location: 'San Blas',
        contact_phone: '900000000',
        status: 'pending'
      })
      .select()
      .single();
    createdMotorcycleIds.push(moto.id);

    req.user = { id: seller.id };
    await mine(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.map((m) => m.id)).toContain(moto.id);
  });

  it('detail devuelve la moto real con su arreglo related', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const { data: moto } = await supabaseAdmin
      .from('motorcycles')
      .insert({
        seller_id: seller.id,
        title: 'Detalle controller real',
        brand: 'Kawasaki',
        model: 'Z400',
        year: 2021,
        displacement_cc: 400,
        price: 15000,
        location: 'San Blas',
        contact_phone: '900000000',
        status: 'approved'
      })
      .select()
      .single();
    createdMotorcycleIds.push(moto.id);

    req.params = { id: moto.id };
    await detail(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.id).toBe(moto.id);
    expect(Array.isArray(body.related)).toBe(true);
  });
});
