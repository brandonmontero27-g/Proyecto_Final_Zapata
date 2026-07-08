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

async function createMotorcycle(sellerId) {
  const { data } = await supabaseAdmin
    .from('motorcycles')
    .insert({
      seller_id: sellerId,
      title: 'Moto integration chat',
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
  createdMotorcycleIds.push(data.id);
  return data;
}

describe('Chat Integration (Supabase local real)', () => {
  it('flujo completo: comprador inicia chat, envia mensaje, vendedor lo lee y responde', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const buyerToken = await loginAndGetToken(buyer);
    const sellerToken = await loginAndGetToken(seller);
    const moto = await createMotorcycle(seller.id);

    const startRes = await request(app)
      .post('/api/chats')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ sellerId: seller.id, motorcycleId: moto.id });
    expect(startRes.status).toBe(201);
    const chatId = startRes.body.id;
    createdChatIds.push(chatId);

    const msg1 = await request(app)
      .post(`/api/chats/${chatId}/messages`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ text: '¿Sigue disponible la moto?' });
    expect(msg1.status).toBe(201);
    expect(msg1.body.sender).toBe('buyer');

    const listRes = await request(app).get('/api/chats').set('Authorization', `Bearer ${sellerToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.map((c) => c.id)).toContain(chatId);

    const messagesRes = await request(app)
      .get(`/api/chats/${chatId}/messages`)
      .set('Authorization', `Bearer ${sellerToken}`);
    expect(messagesRes.status).toBe(200);
    expect(messagesRes.body).toHaveLength(1);

    const reply = await request(app)
      .post(`/api/chats/${chatId}/messages`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ text: 'Si, sigue disponible' });
    expect(reply.status).toBe(201);
    expect(reply.body.sender).toBe('seller');
  });

  it('un comprador que no participa no puede leer los mensajes de otro chat (403)', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const seller = await createRealUser({ role: 'seller' });
    const intruso = await createRealUser({ role: 'buyer' });
    const buyerToken = await loginAndGetToken(buyer);
    const intrusoToken = await loginAndGetToken(intruso);
    const moto = await createMotorcycle(seller.id);

    const startRes = await request(app)
      .post('/api/chats')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ sellerId: seller.id, motorcycleId: moto.id });
    const chatId = startRes.body.id;
    createdChatIds.push(chatId);

    const res = await request(app)
      .get(`/api/chats/${chatId}/messages`)
      .set('Authorization', `Bearer ${intrusoToken}`);
    expect(res.status).toBe(403);
  });

  it('un vendedor no puede iniciar un chat (solo compradores) -> 403', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const otherSeller = await createRealUser({ role: 'seller' });
    const token = await loginAndGetToken(seller);
    const moto = await createMotorcycle(otherSeller.id);

    const res = await request(app)
      .post('/api/chats')
      .set('Authorization', `Bearer ${token}`)
      .send({ sellerId: otherSeller.id, motorcycleId: moto.id });
    expect(res.status).toBe(403);
  });

  it('rechaza iniciar chat sin token -> 401', async () => {
    const res = await request(app).post('/api/chats').send({ sellerId: 'x', motorcycleId: 'y' });
    expect(res.status).toBe(401);
  });
});
