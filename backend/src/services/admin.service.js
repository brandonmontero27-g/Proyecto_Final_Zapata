import {
  countProfiles,
  countMotorcycles,
  countPendingDocuments,
  findPendingDocuments,
  updateDocumentStatus,
  updateProfileVerification,
  findPendingMotorcycles,
  updateMotorcycleStatusRecord,
  updateProfileBlock,
  findAllMotorcyclesAdmin,
  findAllProfiles,
  updateProfileRole,
  insertAuditLog,
  findAuditLogs
} from '../repositories/admin.repository.js';
import { notifySellerOfMotorcycleReview } from './notifications.service.js';
import logger from '../config/logger.js';

export async function getStats() {
  const [users, motorcycles, pendingDocs] = await Promise.all([
    countProfiles(),
    countMotorcycles(),
    countPendingDocuments()
  ]);

  return {
    totalUsers: users.count ?? 0,
    totalMotorcycles: motorcycles.count ?? 0,
    pendingDocuments: pendingDocs.count ?? 0
  };
}

export async function getPendingDocuments() {
  const { data, error } = await findPendingDocuments();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
}

export async function reviewDocument(docId, { estado, comentario }, actor) {
  const { data: doc, error } = await updateDocumentStatus(docId, { status: estado, comment: comentario });

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  if (estado === 'approved') {
    await updateProfileVerification(doc.user_id, { is_verified: true, verification_status: 'approved' });
  } else if (estado === 'rejected') {
    await updateProfileVerification(doc.user_id, { verification_status: 'rejected' });
  }

  await insertAuditLog({
    userId: actor?.id,
    actorName: actor?.name ?? 'Admin',
    action: estado === 'approved' ? 'Aprobó credencial' : 'Rechazó credencial',
    details: `Documento ${docId} marcado como ${estado}.`,
    type: 'user'
  });

  return doc;
}

export async function getPendingMotorcycles() {
  const { data, error } = await findPendingMotorcycles();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
}

export async function updateMotorcycleStatus(motorcycleId, { estado }, actor) {
  const { data, error } = await updateMotorcycleStatusRecord(motorcycleId, estado);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  await insertAuditLog({
    userId: actor?.id,
    actorName: actor?.name ?? 'Admin',
    action: `Moderar publicación: ${estado}`,
    details: `Publicación '${data?.title ?? motorcycleId}' cambiada a estado '${estado}'.`,
    type: 'motorcycle'
  });

  try {
    if (data) {
      await notifySellerOfMotorcycleReview({
        sellerId: data.seller_id,
        motorcycleId: data.id,
        motorcycleTitle: data.title,
        estado,
        actorId: actor?.id
      });
    }
  } catch (err) {
    logger.warn(`No se pudo notificar sobre la publicación ${motorcycleId}: ${err.message}`);
  }

  return data;
}

export async function blockUser(userId, { motivo, dias }, actor) {
  const blockedUntil = dias ? new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString() : null;

  const { error } = await updateProfileBlock(userId, { blockedUntil, motivo });

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  await insertAuditLog({
    userId: actor?.id,
    actorName: actor?.name ?? 'Admin',
    action: 'Bloqueó usuario',
    details: `Usuario ${userId} bloqueado. Motivo: ${motivo}`,
    type: 'user'
  });

  return { message: 'Usuario bloqueado' };
}

export async function getAllMotorcyclesAdmin() {
  const { data, error } = await findAllMotorcyclesAdmin();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
}

export async function getAllUsers() {
  const { data, error } = await findAllProfiles();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
}

export async function setUserRole(userId, role, actor) {
  const { data, error } = await updateProfileRole(userId, role);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  await insertAuditLog({
    userId: actor?.id,
    actorName: actor?.name ?? 'Admin',
    action: 'Cambio de rol',
    details: `Usuario ${userId} actualizado al rol '${role}'.`,
    type: 'user'
  });

  return data;
}

export async function getAuditLogs() {
  const { data, error } = await findAuditLogs();

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data;
}
