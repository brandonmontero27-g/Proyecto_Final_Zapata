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

async function publishMotorcycle(token) {
  const res = await request(app)
    .post('/api/motorcycles')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Moto integration notifications',
      description: 'Cerca del centro de Huamanga',
      brand: 'Honda',
      model: 'CB1',
      year: 2020,
      displacementCc: 150,
      price: 6500,
      address: 'Jr. Notificaciones 1, Huamanga',
      location: 'San Blas',
      contactPhone: '966123456'
    });
  createdMotorcycleIds.push(res.body.id);
  return res.body;
}

describe('Notifications Integration (Supabase local real)', () => {
  it('al crear una publicacion, todos los admins reciben una notificacion', async () => {
    const admin1 = await createRealUser({ role: 'admin' });
    const admin2 = await createRealUser({ role: 'admin' });
    const seller = await createRealUser({ role: 'seller' });
    const sellerToken = await loginAndGetToken(seller);
    const admin1Token = await loginAndGetToken(admin1);
    const admin2Token = await loginAndGetToken(admin2);

    const moto = await publishMotorcycle(sellerToken);

    const res1 = await request(app).get('/api/notificaciones').set('Authorization', `Bearer ${admin1Token}`);
    const res2 = await request(app).get('/api/notificaciones').set('Authorization', `Bearer ${admin2Token}`);

    expect(res1.status).toBe(200);
    expect(res1.body.notifications.some((n) => n.motorcycle_id === moto.id && n.type === 'motorcycle_pending_review')).toBe(true);
    expect(res2.body.notifications.some((n) => n.motorcycle_id === moto.id && n.type === 'motorcycle_pending_review')).toBe(true);
  });

  it('al aprobar/observar/suspender, el vendedor dueño recibe la notificacion correspondiente', async () => {
    const admin = await createRealUser({ role: 'admin' });
    const seller = await createRealUser({ role: 'seller' });
    const adminToken = await loginAndGetToken(admin);
    const sellerToken = await loginAndGetToken(seller);

    const cases = [
      { estado: 'approved', type: 'motorcycle_approved' },
      { estado: 'flagged', type: 'motorcycle_flagged' },
      { estado: 'suspended', type: 'motorcycle_suspended' }
    ];

    for (const { estado, type } of cases) {
      const moto = await publishMotorcycle(sellerToken);

      const reviewRes = await request(app)
        .put(`/api/admin/motos/${moto.id}/estado`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estado });
      expect(reviewRes.status).toBe(200);

      const notifRes = await request(app).get('/api/notificaciones').set('Authorization', `Bearer ${sellerToken}`);
      expect(notifRes.status).toBe(200);
      expect(notifRes.body.notifications.some((n) => n.motorcycle_id === moto.id && n.type === type)).toBe(true);
    }
  });

  it('marcar como leida baja el unreadCount, y no se puede marcar la de otro usuario', async () => {
    const admin1 = await createRealUser({ role: 'admin' });
    const admin2 = await createRealUser({ role: 'admin' });
    const seller = await createRealUser({ role: 'seller' });
    const sellerToken = await loginAndGetToken(seller);
    const admin1Token = await loginAndGetToken(admin1);
    const admin2Token = await loginAndGetToken(admin2);

    await publishMotorcycle(sellerToken);

    const before = await request(app).get('/api/notificaciones').set('Authorization', `Bearer ${admin1Token}`);
    const unreadBefore = before.body.unreadCount;
    const notificationId = before.body.notifications[0].id;

    const readRes = await request(app)
      .put(`/api/notificaciones/${notificationId}/leer`)
      .set('Authorization', `Bearer ${admin1Token}`);
    expect(readRes.status).toBe(200);

    const after = await request(app).get('/api/notificaciones').set('Authorization', `Bearer ${admin1Token}`);
    expect(after.body.unreadCount).toBe(unreadBefore - 1);

    const intrusoRes = await request(app)
      .put(`/api/notificaciones/${notificationId}/leer`)
      .set('Authorization', `Bearer ${admin2Token}`);
    expect(intrusoRes.status).toBe(404);
  });

  it('rechaza peticiones sin token', async () => {
    const res = await request(app).get('/api/notificaciones');
    expect(res.status).toBe(401);
  });
});
