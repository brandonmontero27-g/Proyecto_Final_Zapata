import { getBuyerStats, getSellerStats } from '../../../src/services/stats.service.js';
import * as motorcyclesRepo from '../../../src/repositories/motorcycles.repository.js';
import * as favoritesRepo from '../../../src/repositories/favorites.repository.js';
import * as chatRepo from '../../../src/repositories/chat.repository.js';

describe('stats.service', () => {
  describe('getBuyerStats', () => {
    it('devuelve los conteos reales cuando el repositorio los trae', async () => {
      const originalFavorites = favoritesRepo.countFavoritesByUser;
      const originalChats = chatRepo.countChatsForUser;
      favoritesRepo.countFavoritesByUser = jest.fn().mockResolvedValue({ count: 3 });
      chatRepo.countChatsForUser = jest.fn().mockResolvedValue({ count: 2 });

      try {
        const stats = await getBuyerStats('buyer-1');
        expect(stats).toEqual({ savedFavorites: 3, activeChats: 2 });
        expect(chatRepo.countChatsForUser).toHaveBeenCalledWith('buyer-1', 'buyer');
      } finally {
        favoritesRepo.countFavoritesByUser = originalFavorites;
        chatRepo.countChatsForUser = originalChats;
      }
    });

    it('usa 0 por defecto cuando el count viene undefined', async () => {
      const originalFavorites = favoritesRepo.countFavoritesByUser;
      const originalChats = chatRepo.countChatsForUser;
      favoritesRepo.countFavoritesByUser = jest.fn().mockResolvedValue({});
      chatRepo.countChatsForUser = jest.fn().mockResolvedValue({});

      try {
        const stats = await getBuyerStats('buyer-1');
        expect(stats).toEqual({ savedFavorites: 0, activeChats: 0 });
      } finally {
        favoritesRepo.countFavoritesByUser = originalFavorites;
        chatRepo.countChatsForUser = originalChats;
      }
    });
  });

  describe('getSellerStats', () => {
    it('agrupa las motos por estado y devuelve los conteos reales', async () => {
      const originalMotorcycles = motorcyclesRepo.findMotorcyclesBySeller;
      const originalFavorites = favoritesRepo.countFavoritesForSellerMotorcycles;
      const originalChats = chatRepo.countChatsForUser;
      motorcyclesRepo.findMotorcyclesBySeller = jest.fn().mockResolvedValue({
        data: [{ status: 'approved' }, { status: 'approved' }, { status: 'pending' }]
      });
      favoritesRepo.countFavoritesForSellerMotorcycles = jest.fn().mockResolvedValue({ count: 5 });
      chatRepo.countChatsForUser = jest.fn().mockResolvedValue({ count: 4 });

      try {
        const stats = await getSellerStats('seller-1');
        expect(stats).toEqual({
          totalMotorcycles: 3,
          motorcyclesByStatus: { approved: 2, pending: 1 },
          favoritesReceived: 5,
          contactsReceived: 4
        });
        expect(chatRepo.countChatsForUser).toHaveBeenCalledWith('seller-1', 'seller');
      } finally {
        motorcyclesRepo.findMotorcyclesBySeller = originalMotorcycles;
        favoritesRepo.countFavoritesForSellerMotorcycles = originalFavorites;
        chatRepo.countChatsForUser = originalChats;
      }
    });

    it('usa valores por defecto cuando data/count vienen undefined', async () => {
      const originalMotorcycles = motorcyclesRepo.findMotorcyclesBySeller;
      const originalFavorites = favoritesRepo.countFavoritesForSellerMotorcycles;
      const originalChats = chatRepo.countChatsForUser;
      motorcyclesRepo.findMotorcyclesBySeller = jest.fn().mockResolvedValue({});
      favoritesRepo.countFavoritesForSellerMotorcycles = jest.fn().mockResolvedValue({});
      chatRepo.countChatsForUser = jest.fn().mockResolvedValue({});

      try {
        const stats = await getSellerStats('seller-1');
        expect(stats).toEqual({
          totalMotorcycles: 0,
          motorcyclesByStatus: {},
          favoritesReceived: 0,
          contactsReceived: 0
        });
      } finally {
        motorcyclesRepo.findMotorcyclesBySeller = originalMotorcycles;
        favoritesRepo.countFavoritesForSellerMotorcycles = originalFavorites;
        chatRepo.countChatsForUser = originalChats;
      }
    });
  });
});
