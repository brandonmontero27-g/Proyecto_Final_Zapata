import request from 'supertest';
import app from '../../src/app.js';
import { supabaseAdmin } from '../../src/config/supabase.js';
import { createRealUser, cleanupCreatedUsers } from '../helpers/testData.js';

const createdMotorcycleIds = [];
const createdChatIds = [];

afterAll(async () => {
  for (const id of createdChatIds.splice(0)) {
    await supabaseAdmin.from('chats').delete().eq('id', id).catch?.(() => {});
  }
  for (const id of createdMotorcycleIds.splice(0)) {
    await supabaseAdmin.from('motorcycles').delete().eq('id', id).catch?.(() => {});
  }
  await cleanupCreatedUsers();
});

async function loginAndGetToken(user) {
  const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
  return res.body.token;
}

async function createMotorcycle(sellerId, status = 'approved') {
  const { data } = await supabaseAdmin
    .from('motorcycles')
    .insert({
      seller_id: sellerId,
      title: 'Moto integration stats',
      brand: 'Honda',
      model: 'CB1',
      year: 2020,
      displacement_cc: 150,
      price: 6000,
      location: 'San Blas',
      contact_phone: '900000000',
      status
    })
    .select()
    .single();
  createdMotorcycleIds.push(data.id);
  return data;
}

describe('Stats Integration (Supabase local real)', () => {
  it('GET /api/stats/comprador devuelve conteos reales de favoritos y chats', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const buyerToken = await loginAndGetToken(buyer);
    const moto = await createMotorcycle(seller.id);

    await request(app)
      .post('/api/favoritos')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ motorcycleId: moto.id });

    const chatRes = await request(app)
      .post('/api/chats')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ sellerId: seller.id, motorcycleId: moto.id });
    createdChatIds.push(chatRes.body.id);

    const res = await request(app).get('/api/stats/comprador').set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.savedFavorites).toBe(1);
    expect(res.body.activeChats).toBe(1);
  });

  it('GET /api/stats/vendedor devuelve conteos reales de anuncios, favoritos recibidos y contactos', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const buyer = await createRealUser({ role: 'buyer' });
    const sellerToken = await loginAndGetToken(seller);
    const buyerToken = await loginAndGetToken(buyer);

    const approved = await createMotorcycle(seller.id, 'approved');
    await createMotorcycle(seller.id, 'pending');

    await request(app)
      .post('/api/favoritos')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ motorcycleId: approved.id });

    const chatRes = await request(app)
      .post('/api/chats')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ sellerId: seller.id, motorcycleId: approved.id });
    createdChatIds.push(chatRes.body.id);

    const res = await request(app).get('/api/stats/vendedor').set('Authorization', `Bearer ${sellerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalMotorcycles).toBe(2);
    expect(res.body.motorcyclesByStatus.approved).toBe(1);
    expect(res.body.motorcyclesByStatus.pending).toBe(1);
    expect(res.body.favoritesReceived).toBe(1);
    expect(res.body.contactsReceived).toBe(1);
  });

  it('un comprador no puede pedir /api/stats/vendedor (403)', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const token = await loginAndGetToken(buyer);

    const res = await request(app).get('/api/stats/vendedor').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('rechaza peticiones sin token', async () => {
    const res = await request(app).get('/api/stats/comprador');
    expect(res.status).toBe(401);
  });
});
