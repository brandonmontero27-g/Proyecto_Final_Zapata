import { listMyNotifications, markAsRead, markAllAsRead } from '../../../src/services/notifications.service.js';
import * as notificationsRepo from '../../../src/repositories/notifications.repository.js';

describe('notifications.service', () => {
  describe('listMyNotifications', () => {
    it('lanza AppError 500 si falla la busqueda de notificaciones', async () => {
      const originalFind = notificationsRepo.findNotificationsForUser;
      const originalCount = notificationsRepo.countUnreadNotifications;
      notificationsRepo.findNotificationsForUser = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });
      notificationsRepo.countUnreadNotifications = jest.fn().mockResolvedValue({ count: 0, error: null });

      try {
        await expect(listMyNotifications('u1')).rejects.toMatchObject({ statusCode: 500, message: 'fail' });
      } finally {
        notificationsRepo.findNotificationsForUser = originalFind;
        notificationsRepo.countUnreadNotifications = originalCount;
      }
    });

    it('lanza AppError 500 si falla el conteo de no leidas', async () => {
      const originalFind = notificationsRepo.findNotificationsForUser;
      const originalCount = notificationsRepo.countUnreadNotifications;
      notificationsRepo.findNotificationsForUser = jest.fn().mockResolvedValue({ data: [], error: null });
      notificationsRepo.countUnreadNotifications = jest.fn().mockResolvedValue({ count: null, error: { message: 'fail count' } });

      try {
        await expect(listMyNotifications('u1')).rejects.toMatchObject({ statusCode: 500, message: 'fail count' });
      } finally {
        notificationsRepo.findNotificationsForUser = originalFind;
        notificationsRepo.countUnreadNotifications = originalCount;
      }
    });
  });

  describe('markAsRead', () => {
    it('lanza AppError 400 si el repositorio falla', async () => {
      const original = notificationsRepo.markNotificationRead;
      notificationsRepo.markNotificationRead = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });

      try {
        await expect(markAsRead('n1', 'u1')).rejects.toMatchObject({ statusCode: 400, message: 'fail' });
      } finally {
        notificationsRepo.markNotificationRead = original;
      }
    });
  });

  describe('markAllAsRead', () => {
    it('devuelve un mensaje de exito cuando el repositorio no falla', async () => {
      const original = notificationsRepo.markAllNotificationsRead;
      notificationsRepo.markAllNotificationsRead = jest.fn().mockResolvedValue({ error: null });

      try {
        const result = await markAllAsRead('u1');
        expect(result).toEqual({ message: 'Notificaciones marcadas como leídas' });
      } finally {
        notificationsRepo.markAllNotificationsRead = original;
      }
    });

    it('lanza AppError 400 si el repositorio falla', async () => {
      const original = notificationsRepo.markAllNotificationsRead;
      notificationsRepo.markAllNotificationsRead = jest.fn().mockResolvedValue({ error: { message: 'fail' } });

      try {
        await expect(markAllAsRead('u1')).rejects.toMatchObject({ statusCode: 400, message: 'fail' });
      } finally {
        notificationsRepo.markAllNotificationsRead = original;
      }
    });
  });
});
