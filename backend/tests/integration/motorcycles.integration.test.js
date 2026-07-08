import request from 'supertest';
import app from '../../src/app.js';
import { supabaseAdmin } from '../../src/config/supabase.js';
import { createRealUser, cleanupCreatedUsers } from '../helpers/testData.js';

const createdMotorcycleIds = [];

afterAll(async () => {
  for (const id of createdMotorcycleIds.splice(0)) {
    await supabaseAdmin.from('motorcycles').delete().eq('id', id).catch?.(() => {});
  }
  await cleanupCreatedUsers();
});

async function loginAndGetToken(user) {
  const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
  return res.body.token;
}

describe('Motorcycles Integration (Supabase local real)', () => {
  it('debe publicar una moto real correctamente si el usuario es vendedor', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const token = await loginAndGetToken(seller);

    const motorcycleData = {
      title: 'Moto centrica integration',
      description: 'Cerca del centro de Huamanga',
      brand: 'Honda',
      model: 'CB1',
      year: 2021,
      displacementCc: 150,
      price: 7500,
      address: 'Jr. Ayacucho 123, Huamanga',
      location: 'San Blas',
      contactPhone: '966123456'
    };

    const res = await request(app).post('/api/motorcycles').set('Authorization', `Bearer ${token}`).send(motorcycleData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('pending');
    createdMotorcycleIds.push(res.body.id);
  });

  it('debe rechazar la publicacion si el usuario autenticado no es vendedor ni admin', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const token = await loginAndGetToken(buyer);

    const res = await request(app)
      .post('/api/motorcycles')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'No deberia poder' });

    expect(res.status).toBe(403);
  });

  it('debe rechazar la publicacion sin token de autenticacion', async () => {
    const res = await request(app).post('/api/motorcycles').send({ title: 'Sin token' });

    expect(res.status).toBe(401);
  });

  it('debe rechazar la publicacion si el body no cumple el esquema (falta contactPhone)', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const token = await loginAndGetToken(seller);

    const res = await request(app)
      .post('/api/motorcycles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Sin telefono',
        brand: 'Yamaha',
        model: 'XTZ',
        year: 2020,
        displacementCc: 125,
        price: 4000,
        location: 'Belén'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('details');
  });

  it('debe listar motos aprobadas reales con filtros, sin requerir autenticacion', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const { data: approved } = await supabaseAdmin
      .from('motorcycles')
      .insert({
        seller_id: seller.id,
        title: 'Aprobada integration',
        brand: 'Bajaj',
        model: 'Pulsar',
        year: 2019,
        displacement_cc: 200,
        price: 5500,
        location: 'Santa Ana',
        contact_phone: '900000000',
        status: 'approved'
      })
      .select()
      .single();
    createdMotorcycleIds.push(approved.id);

    const res = await request(app).get('/api/motorcycles?marca=Bajaj');

    expect(res.status).toBe(200);
    expect(res.body.map((m) => m.id)).toContain(approved.id);
  });

  it('debe obtener el detalle real de una moto por id con su arreglo related', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const { data: moto } = await supabaseAdmin
      .from('motorcycles')
      .insert({
        seller_id: seller.id,
        title: 'Detalle integration',
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

    const res = await request(app).get(`/api/motorcycles/${moto.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(moto.id);
    expect(Array.isArray(res.body.related)).toBe(true);
  });

  it('debe devolver 404 si la moto no existe', async () => {
    const res = await request(app).get('/api/motorcycles/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});
