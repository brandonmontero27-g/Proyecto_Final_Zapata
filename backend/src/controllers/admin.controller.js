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
} from '../services/admin.service.js';

export async function stats(req, res) {
  res.json(await getStats());
}

export async function pendingDocuments(req, res) {
  res.json(await getPendingDocuments());
}

export async function reviewDoc(req, res) {
  const documento = await reviewDocument(req.params.id, req.body, req.user);
  res.json({ documento });
}

export async function pendingMotorcycles(req, res) {
  res.json(await getPendingMotorcycles());
}

export async function reviewMotorcycle(req, res) {
  const moto = await updateMotorcycleStatus(req.params.id, req.body, req.user);
  res.json({ moto });
}

export async function block(req, res) {
  const result = await blockUser(req.params.id, req.body, req.user);
  res.json(result);
}

export async function allMotorcycles(req, res) {
  res.json(await getAllMotorcyclesAdmin());
}

export async function allUsers(req, res) {
  res.json(await getAllUsers());
}

export async function setRole(req, res) {
  const user = await setUserRole(req.params.id, req.body.rol, req.user);
  res.json({ user });
}

export async function logs(req, res) {
  res.json(await getAuditLogs());
}
