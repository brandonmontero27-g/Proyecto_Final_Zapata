import request from 'supertest';
import app from '../../src/app.js';
import { supabaseAdmin } from '../../src/config/supabase.js';
import { createRealUser, cleanupCreatedUsers } from '../helpers/testData.js';

const TINY_PNG_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

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

async function createMotorcycle(sellerId) {
  const { data } = await supabaseAdmin
    .from('motorcycles')
    .insert({
      seller_id: sellerId,
      title: 'Moto para fotos integration',
      brand: 'Honda',
      model: 'CB1',
      year: 2020,
      displacement_cc: 150,
      price: 6000,
      location: 'San Blas',
      contact_phone: '900000000',
      status: 'pending'
    })
    .select()
    .single();
  createdMotorcycleIds.push(data.id);
  return data;
}

describe('Motorcycle Images Integration (Supabase Storage real)', () => {
  it('el dueño (seller) puede subir fotos a su propia publicacion', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const token = await loginAndGetToken(seller);
    const moto = await createMotorcycle(seller.id);

    const res = await request(app)
      .post(`/api/motorcycles/${moto.id}/imagenes`)
      .set('Authorization', `Bearer ${token}`)
      .send({ images: [TINY_PNG_BASE64] });

    expect(res.status).toBe(200);
    expect(res.body.images).toHaveLength(1);
    expect(res.body.images[0]).toMatch(/\.webp$/);
  });

  it('un admin puede subir fotos a la publicacion de otro', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const admin = await createRealUser({ role: 'admin' });
    const token = await loginAndGetToken(admin);
    const moto = await createMotorcycle(seller.id);

    const res = await request(app)
      .post(`/api/motorcycles/${moto.id}/imagenes`)
      .set('Authorization', `Bearer ${token}`)
      .send({ images: [TINY_PNG_BASE64] });

    expect(res.status).toBe(200);
  });

  it('un vendedor NO puede subir fotos a la publicacion de otro vendedor (403)', async () => {
    const owner = await createRealUser({ role: 'seller' });
    const intruso = await createRealUser({ role: 'seller' });
    const token = await loginAndGetToken(intruso);
    const moto = await createMotorcycle(owner.id);

    const res = await request(app)
      .post(`/api/motorcycles/${moto.id}/imagenes`)
      .set('Authorization', `Bearer ${token}`)
      .send({ images: [TINY_PNG_BASE64] });

    expect(res.status).toBe(403);
  });

  it('rechaza sin token -> 401', async () => {
    const res = await request(app).post('/api/motorcycles/00000000-0000-0000-0000-000000000000/imagenes').send({ images: [TINY_PNG_BASE64] });
    expect(res.status).toBe(401);
  });

  it('rechaza un body sin imagenes -> 400', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const token = await loginAndGetToken(seller);
    const moto = await createMotorcycle(seller.id);

    const res = await request(app)
      .post(`/api/motorcycles/${moto.id}/imagenes`)
      .set('Authorization', `Bearer ${token}`)
      .send({ images: [] });

    expect(res.status).toBe(400);
  });

  it('devuelve 404 si la publicacion no existe', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const token = await loginAndGetToken(seller);

    const res = await request(app)
      .post('/api/motorcycles/00000000-0000-0000-0000-000000000000/imagenes')
      .set('Authorization', `Bearer ${token}`)
      .send({ images: [TINY_PNG_BASE64] });

    expect(res.status).toBe(404);
  });
});
