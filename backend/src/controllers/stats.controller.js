import { getBuyerStats, getSellerStats } from '../services/stats.service.js';

export async function buyerStats(req, res) {
  const stats = await getBuyerStats(req.user.id);
  res.json(stats);
}

export async function sellerStats(req, res) {
  const stats = await getSellerStats(req.user.id);
  res.json(stats);
}
