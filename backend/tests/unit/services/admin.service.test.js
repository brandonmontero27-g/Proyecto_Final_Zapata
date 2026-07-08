import {
  getStats,
  getPendingDocuments,
  reviewDocument,
  getPendingMotorcycles,
  updateMotorcycleStatus,
  blockUser,
  getAllMotorcyclesAdmin,
  getAllUsers,
  setUserRole,
  getAuditLogs
} from '../../../src/services/admin.service.js';
import * as adminRepo from '../../../src/repositories/admin.repository.js';
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

async function insertPendingMotorcycle(sellerId, overrides = {}) {
  const { data, error } = await supabaseAdmin
    .from('motorcycles')
    .insert({
      seller_id: sellerId,
      title: 'Moto pendiente de prueba',
      brand: 'Honda',
      model: 'CB1',
      year: 2020,
      displacement_cc: 150,
      price: 6000,
      location: 'San Blas',
      contact_phone: '900000000',
      status: 'pending',
      ...overrides
    })
    .select()
    .single();
  if (error) throw error;
  createdMotorcycleIds.push(data.id);
  return data;
}

describe('Admin Service (Supabase local real)', () => {
  describe('getStats', () => {
    it('el conteo de usuarios sube en 1 real al crear un usuario', async () => {
      const before = await getStats();

      await createRealUser({ role: 'buyer' });

      const after = await getStats();

      expect(after.totalUsers).toBe(before.totalUsers + 1);
    });

    it('usa 0 por defecto si algun conteo viene null/undefined', async () => {
      const originalCountProfiles = adminRepo.countProfiles;
      const originalCountMotorcycles = adminRepo.countMotorcycles;
      const originalCountPending = adminRepo.countPendingDocuments;
      adminRepo.countProfiles = jest.fn().mockResolvedValue({ count: null });
      adminRepo.countMotorcycles = jest.fn().mockResolvedValue({ count: undefined });
      adminRepo.countPendingDocuments = jest.fn().mockResolvedValue({ count: null });

      try {
        const stats = await getStats();
        expect(stats).toEqual({ totalUsers: 0, totalMotorcycles: 0, pendingDocuments: 0 });
      } finally {
        adminRepo.countProfiles = originalCountProfiles;
        adminRepo.countMotorcycles = originalCountMotorcycles;
        adminRepo.countPendingDocuments = originalCountPending;
      }
    });
  });

  describe('getPendingDocuments + reviewDocument', () => {
    it('lista un documento pendiente real y lo aprueba, verificando el perfil', async () => {
      const buyer = await createRealUser({ role: 'buyer' });

      const { data: doc } = await supabaseAdmin
        .from('verification_documents')
        .insert({ user_id: buyer.id, doc_url: 'https://example.com/carnet.png', status: 'pending' })
        .select()
        .single();
      createdDocIds.push(doc.id);

      const pending = await getPendingDocuments();
      expect(pending.map((d) => d.id)).toContain(doc.id);

      const reviewed = await reviewDocument(doc.id, { estado: 'approved', comentario: 'Documento valido' });
      expect(reviewed.status).toBe('approved');

      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', buyer.id).single();
      expect(profile.is_verified).toBe(true);
      expect(profile.verification_status).toBe('approved');
    });

    it('rechaza un documento real y actualiza el estado de verificacion del perfil', async () => {
      const buyer = await createRealUser({ role: 'buyer' });

      const { data: doc } = await supabaseAdmin
        .from('verification_documents')
        .insert({ user_id: buyer.id, doc_url: 'https://example.com/borroso.png', status: 'pending' })
        .select()
        .single();
      createdDocIds.push(doc.id);

      await reviewDocument(doc.id, { estado: 'rejected', comentario: 'Ilegible' });

      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', buyer.id).single();
      expect(profile.verification_status).toBe('rejected');
      expect(profile.is_verified).toBe(false);
    });

    it('lanza error con statusCode 400 si el documento no existe (real: .single() sin filas)', async () => {
      const inexistente = '00000000-0000-0000-0000-000000000000';

      await expect(reviewDocument(inexistente, { estado: 'approved', comentario: 'x' })).rejects.toMatchObject({
        statusCode: 400
      });
    });

    it('no actualiza verification_status si estado no es approved ni rejected', async () => {
      const originalUpdateDoc = adminRepo.updateDocumentStatus;
      const originalUpdateVerif = adminRepo.updateProfileVerification;
      adminRepo.updateDocumentStatus = jest.fn().mockResolvedValue({
        data: { id: 'fake-doc', user_id: 'fake-user' },
        error: null
      });
      adminRepo.updateProfileVerification = jest.fn();

      try {
        const result = await reviewDocument('fake-doc', { estado: 'otro-estado' });
        expect(result.id).toBe('fake-doc');
        expect(adminRepo.updateProfileVerification).not.toHaveBeenCalled();
      } finally {
        adminRepo.updateDocumentStatus = originalUpdateDoc;
        adminRepo.updateProfileVerification = originalUpdateVerif;
      }
    });
  });

  describe('getPendingMotorcycles + updateMotorcycleStatus', () => {
    it('lista una moto pendiente real y la aprueba', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const moto = await insertPendingMotorcycle(seller.id);

      const pending = await getPendingMotorcycles();
      expect(pending.map((m) => m.id)).toContain(moto.id);

      const approved = await updateMotorcycleStatus(moto.id, { estado: 'approved' });
      expect(approved.status).toBe('approved');

      const { data: fetched } = await supabaseAdmin.from('motorcycles').select('*').eq('id', moto.id).single();
      expect(fetched.status).toBe('approved');
    });

    it('marca una moto como flagged (rechazada)', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const moto = await insertPendingMotorcycle(seller.id);

      const flagged = await updateMotorcycleStatus(moto.id, { estado: 'flagged' });
      expect(flagged.status).toBe('flagged');
    });

    it('lanza error con statusCode 400 si el id no es un uuid valido (error real de Postgres)', async () => {
      await expect(updateMotorcycleStatus('esto-no-es-un-uuid', { estado: 'approved' })).rejects.toMatchObject({
        statusCode: 400
      });
    });

    it('usa el motorcycleId en los detalles del log si el repositorio no devuelve datos', async () => {
      const originalFn = adminRepo.updateMotorcycleStatusRecord;
      adminRepo.updateMotorcycleStatusRecord = jest.fn().mockResolvedValue({ data: null, error: null });

      try {
        const result = await updateMotorcycleStatus('fake-motorcycle-id', { estado: 'approved' });
        expect(result).toBeNull();

        const logs = await getAuditLogs();
        expect(logs.some((l) => l.details?.includes('fake-motorcycle-id'))).toBe(true);
      } finally {
        adminRepo.updateMotorcycleStatusRecord = originalFn;
      }
    });
  });

  describe('blockUser', () => {
    it('bloquea a un usuario real calculando la fecha de fin segun los dias', async () => {
      const buyer = await createRealUser({ role: 'buyer' });

      const result = await blockUser(buyer.id, { motivo: 'Publicaciones fraudulentas', dias: 7 });
      expect(result).toEqual({ message: 'Usuario bloqueado' });

      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', buyer.id).single();
      expect(profile.blocked_reason).toBe('Publicaciones fraudulentas');
      expect(profile.blocked_until).toBeTruthy();
    });

    it('bloquea a un usuario real de forma permanente cuando no se especifican dias', async () => {
      const buyer = await createRealUser({ role: 'buyer' });

      const result = await blockUser(buyer.id, { motivo: 'Spam permanente', dias: null });
      expect(result).toEqual({ message: 'Usuario bloqueado' });

      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', buyer.id).single();
      expect(profile.blocked_reason).toBe('Spam permanente');
      expect(profile.blocked_until).toBeNull();
    });

    it('lanza error con statusCode 400 si el id no es un uuid valido (error real de Postgres)', async () => {
      await expect(blockUser('esto-no-es-un-uuid', { motivo: 'x', dias: 1 })).rejects.toMatchObject({
        statusCode: 400
      });
    });
  });

  describe('reviewDocument - Estado Rejected', () => {
    it('rechaza un documento y deja al usuario sin verificar', async () => {
      const buyer = await createRealUser({ role: 'buyer' });

      const { data: doc } = await supabaseAdmin
        .from('verification_documents')
        .insert({ user_id: buyer.id, doc_url: 'https://example.com/invalido.png', status: 'pending' })
        .select()
        .single();
      createdDocIds.push(doc.id);

      const reviewed = await reviewDocument(doc.id, { estado: 'rejected', comentario: 'Documento borroso' });
      expect(reviewed.status).toBe('rejected');

      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', buyer.id).single();
      expect(profile.verification_status).toBe('rejected');
      expect(profile.is_verified).toBe(false);
    });
  });

  describe('getPendingDocuments - Error Cases', () => {
    it('maneja error cuando falla la consulta de documentos', async () => {
      // Mock para forzar error en el repositorio
      const originalFn = adminRepo.findPendingDocuments;
      adminRepo.findPendingDocuments = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      try {
        await expect(getPendingDocuments()).rejects.toMatchObject({
          statusCode: 500
        });
      } finally {
        adminRepo.findPendingDocuments = originalFn;
      }
    });
  });

  describe('getPendingMotorcycles - Error Cases', () => {
    it('maneja error cuando falla la consulta de motos pendientes', async () => {
      // Mock para forzar error en el repositorio
      const originalFn = adminRepo.findPendingMotorcycles;
      adminRepo.findPendingMotorcycles = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      try {
        await expect(getPendingMotorcycles()).rejects.toMatchObject({
          statusCode: 500
        });
      } finally {
        adminRepo.findPendingMotorcycles = originalFn;
      }
    });
  });

  describe('getAllMotorcyclesAdmin', () => {
    it('devuelve todas las publicaciones reales (cualquier estado)', async () => {
      const seller = await createRealUser({ role: 'seller' });
      const moto = await insertPendingMotorcycle(seller.id, { title: 'Para listado admin' });

      const all = await getAllMotorcyclesAdmin();

      expect(all.map((m) => m.id)).toContain(moto.id);
    });

    it('lanza error con statusCode 500 si el repositorio falla', async () => {
      const originalFn = adminRepo.findAllMotorcyclesAdmin;
      adminRepo.findAllMotorcyclesAdmin = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });

      try {
        await expect(getAllMotorcyclesAdmin()).rejects.toMatchObject({ statusCode: 500 });
      } finally {
        adminRepo.findAllMotorcyclesAdmin = originalFn;
      }
    });
  });

  describe('getAllUsers', () => {
    it('devuelve todos los perfiles reales', async () => {
      const buyer = await createRealUser({ role: 'buyer' });

      const all = await getAllUsers();

      expect(all.map((u) => u.id)).toContain(buyer.id);
    });

    it('lanza error con statusCode 500 si el repositorio falla', async () => {
      const originalFn = adminRepo.findAllProfiles;
      adminRepo.findAllProfiles = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });

      try {
        await expect(getAllUsers()).rejects.toMatchObject({ statusCode: 500 });
      } finally {
        adminRepo.findAllProfiles = originalFn;
      }
    });
  });

  describe('setUserRole', () => {
    it('actualiza el rol real de un usuario', async () => {
      const buyer = await createRealUser({ role: 'buyer' });

      const updated = await setUserRole(buyer.id, 'seller');

      expect(updated.role).toBe('seller');
    });

    it('lanza error con statusCode 400 si el id no es un uuid valido (error real de Postgres)', async () => {
      await expect(setUserRole('esto-no-es-un-uuid', 'seller')).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('getAuditLogs', () => {
    it('devuelve el log real generado al aprobar un documento', async () => {
      const buyer = await createRealUser({ role: 'buyer' });
      const { data: doc } = await supabaseAdmin
        .from('verification_documents')
        .insert({ user_id: buyer.id, doc_url: 'https://example.com/audit.png', status: 'pending' })
        .select()
        .single();
      createdDocIds.push(doc.id);

      await reviewDocument(doc.id, { estado: 'approved', comentario: 'ok' }, { id: buyer.id, name: 'Admin Test' });

      const logs = await getAuditLogs();

      expect(logs.some((l) => l.details?.includes(doc.id))).toBe(true);
    });

    it('lanza error con statusCode 500 si el repositorio falla', async () => {
      const originalFn = adminRepo.findAuditLogs;
      adminRepo.findAuditLogs = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });

      try {
        await expect(getAuditLogs()).rejects.toMatchObject({ statusCode: 500 });
      } finally {
        adminRepo.findAuditLogs = originalFn;
      }
    });
  });
});
