import { updateProfile, changePassword, changeAvatar } from '../../../src/services/profile.service.js';
import * as profileRepo from '../../../src/repositories/profile.repository.js';
import * as authRepo from '../../../src/repositories/auth.repository.js';
import * as avatarService from '../../../src/services/avatar.service.js';

describe('profile.service', () => {
  describe('updateProfile', () => {
    it('devuelve el perfil actualizado cuando el repositorio no falla', async () => {
      const original = profileRepo.updateProfileFields;
      profileRepo.updateProfileFields = jest.fn().mockResolvedValue({ data: { id: 'u1', name: 'Nuevo' }, error: null });

      try {
        const result = await updateProfile('u1', { name: 'Nuevo' });
        expect(result).toEqual({ id: 'u1', name: 'Nuevo' });
      } finally {
        profileRepo.updateProfileFields = original;
      }
    });

    it('lanza AppError 400 si el repositorio falla', async () => {
      const original = profileRepo.updateProfileFields;
      profileRepo.updateProfileFields = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });

      try {
        await expect(updateProfile('u1', { name: 'Nuevo' })).rejects.toMatchObject({
          statusCode: 400,
          message: 'fail'
        });
      } finally {
        profileRepo.updateProfileFields = original;
      }
    });
  });

  describe('changePassword', () => {
    it('devuelve un mensaje de exito cuando el repositorio no falla', async () => {
      const original = authRepo.updateAuthPassword;
      authRepo.updateAuthPassword = jest.fn().mockResolvedValue({ error: null });

      try {
        const result = await changePassword('u1', 'nueva-clave');
        expect(result).toEqual({ message: 'Contraseña actualizada' });
      } finally {
        authRepo.updateAuthPassword = original;
      }
    });

    it('lanza AppError 400 si el repositorio falla', async () => {
      const original = authRepo.updateAuthPassword;
      authRepo.updateAuthPassword = jest.fn().mockResolvedValue({ error: { message: 'fail' } });

      try {
        await expect(changePassword('u1', 'nueva-clave')).rejects.toMatchObject({
          statusCode: 400,
          message: 'fail'
        });
      } finally {
        authRepo.updateAuthPassword = original;
      }
    });
  });

  describe('changeAvatar', () => {
    it('devuelve el perfil actualizado cuando el repositorio no falla', async () => {
      const originalUpload = avatarService.uploadAvatar;
      const originalUpdate = profileRepo.updateProfileAvatar;
      avatarService.uploadAvatar = jest.fn().mockResolvedValue('https://cdn/avatar.png');
      profileRepo.updateProfileAvatar = jest.fn().mockResolvedValue({ data: { id: 'u1', avatar_url: 'https://cdn/avatar.png' }, error: null });

      try {
        const result = await changeAvatar('u1', 'data:image/png;base64,xxx');
        expect(result).toEqual({ id: 'u1', avatar_url: 'https://cdn/avatar.png' });
      } finally {
        avatarService.uploadAvatar = originalUpload;
        profileRepo.updateProfileAvatar = originalUpdate;
      }
    });

    it('lanza AppError 400 si el repositorio falla', async () => {
      const originalUpload = avatarService.uploadAvatar;
      const originalUpdate = profileRepo.updateProfileAvatar;
      avatarService.uploadAvatar = jest.fn().mockResolvedValue('https://cdn/avatar.png');
      profileRepo.updateProfileAvatar = jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } });

      try {
        await expect(changeAvatar('u1', 'data:image/png;base64,xxx')).rejects.toMatchObject({
          statusCode: 400,
          message: 'fail'
        });
      } finally {
        avatarService.uploadAvatar = originalUpload;
        profileRepo.updateProfileAvatar = originalUpdate;
      }
    });
  });
});
