import {
  stats,
  pendingDocuments,
  reviewDoc,
  pendingMotorcycles,
  reviewMotorcycle,
  block,
  allMotorcycles,
  allUsers,
  setRole,
  logs
} from '../../../src/controllers/admin.controller.js';
import { supabaseAdmin } from '../../../src/config/supabase.js';
import { createRealUser, cleanupCreatedUsers } from '../../helpers/testData.js';

const createdDocIds = [];
const createdMotorcycleIds = [];

afterAll(async () => {
  for (const id of createdDocIds.splice(0)) {
    await supabaseAdmin.from('verification_documents').delete().eq('id', id).catch?.(() => {});
  }
  for (const id of createdMotorcycleIds.splice(0)) {
    await supabaseAdmin.from('motorcycles').delete().eq('id', id).catch?.(() => {});
  }
  await cleanupCreatedUsers();
});

describe('Admin Controller (Supabase local real)', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  it('stats responde con conteos reales de la base de datos', async () => {
    const before = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
    await createRealUser({ role: 'buyer' });

    await stats(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.totalUsers).toBe((before.count ?? 0) + 1);
  });

  it('pendingDocuments responde con los documentos reales en estado pending', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const { data: doc } = await supabaseAdmin
      .from('verification_documents')
      .insert({ user_id: buyer.id, doc_url: 'https://example.com/doc.png', status: 'pending' })
      .select()
      .single();
    createdDocIds.push(doc.id);

    await pendingDocuments(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.map((d) => d.id)).toContain(doc.id);
  });

  it('reviewDoc aprueba un documento real y envuelve el resultado en { documento }', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    const { data: doc } = await supabaseAdmin
      .from('verification_documents')
      .insert({ user_id: buyer.id, doc_url: 'https://example.com/doc2.png', status: 'pending' })
      .select()
      .single();
    createdDocIds.push(doc.id);

    req.params.id = doc.id;
    req.body = { estado: 'approved', comentario: 'Valido' };
    await reviewDoc(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.documento.status).toBe('approved');
  });

  it('pendingMotorcycles responde con las motos reales en estado pending', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const { data: moto } = await supabaseAdmin
      .from('motorcycles')
      .insert({
        seller_id: seller.id,
        title: 'Moto pendiente controller',
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
    createdMotorcycleIds.push(moto.id);

    await pendingMotorcycles(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.map((m) => m.id)).toContain(moto.id);
  });

  it('reviewMotorcycle aprueba una moto real y envuelve el resultado en { moto }', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const { data: moto } = await supabaseAdmin
      .from('motorcycles')
      .insert({
        seller_id: seller.id,
        title: 'Moto a aprobar controller',
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
    createdMotorcycleIds.push(moto.id);

    req.params.id = moto.id;
    req.body = { estado: 'approved' };
    await reviewMotorcycle(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.moto.status).toBe('approved');
  });

  it('block bloquea a un usuario real y responde con el mensaje', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    req.params.id = buyer.id;
    req.body = { motivo: 'Fraude', dias: 7 };

    await block(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario bloqueado' });
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', buyer.id).single();
    expect(profile.blocked_reason).toBe('Fraude');
  });

  it('allMotorcycles responde con todas las publicaciones reales', async () => {
    const seller = await createRealUser({ role: 'seller' });
    const { data: moto } = await supabaseAdmin
      .from('motorcycles')
      .insert({
        seller_id: seller.id,
        title: 'Moto allMotorcycles controller',
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
    createdMotorcycleIds.push(moto.id);

    await allMotorcycles(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.map((m) => m.id)).toContain(moto.id);
  });

  it('allUsers responde con todos los perfiles reales', async () => {
    const buyer = await createRealUser({ role: 'buyer' });

    await allUsers(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.map((u) => u.id)).toContain(buyer.id);
  });

  it('setRole actualiza el rol real y envuelve el resultado en { user }', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    req.params.id = buyer.id;
    req.body = { rol: 'seller' };
    req.user = { id: buyer.id, name: 'Admin Test' };

    await setRole(req, res);

    const body = res.json.mock.calls[0][0];
    expect(body.user.role).toBe('seller');
  });

  it('logs responde con la bitacora real de auditoria', async () => {
    const buyer = await createRealUser({ role: 'buyer' });
    req.params.id = buyer.id;
    req.body = { motivo: 'Auditoria', dias: 1 };
    await block(req, res);

    await logs(req, res);

    const body = res.json.mock.calls[res.json.mock.calls.length - 1][0];
    expect(Array.isArray(body)).toBe(true);
  });
});
