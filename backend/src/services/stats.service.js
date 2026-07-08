import { findMotorcyclesBySeller } from '../repositories/motorcycles.repository.js';
import { countFavoritesByUser, countFavoritesForSellerMotorcycles } from '../repositories/favorites.repository.js';
import { countChatsForUser } from '../repositories/chat.repository.js';

export async function getBuyerStats(userId) {
  const [favorites, chats] = await Promise.all([countFavoritesByUser(userId), countChatsForUser(userId, 'buyer')]);

  return {
    savedFavorites: favorites.count ?? 0,
    activeChats: chats.count ?? 0
  };
}

export async function getSellerStats(sellerId) {
  const [motorcyclesResult, favoritesResult, chatsResult] = await Promise.all([
    findMotorcyclesBySeller(sellerId),
    countFavoritesForSellerMotorcycles(sellerId),
    countChatsForUser(sellerId, 'seller')
  ]);

  const motorcycles = motorcyclesResult.data || [];
  const motorcyclesByStatus = motorcycles.reduce((acc, motorcycle) => {
    acc[motorcycle.status] = (acc[motorcycle.status] || 0) + 1;
    return acc;
  }, {});

  return {
    totalMotorcycles: motorcycles.length,
    motorcyclesByStatus,
    favoritesReceived: favoritesResult.count ?? 0,
    contactsReceived: chatsResult.count ?? 0
  };
}
