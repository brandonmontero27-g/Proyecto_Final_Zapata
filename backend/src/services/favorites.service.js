import { insertFavorite, deleteFavorite, findFavoritesByUser } from '../repositories/favorites.repository.js';

export async function addFavorite(userId, motorcycleId) {
  const { data, error } = await insertFavorite(userId, motorcycleId);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  return data;
}

export async function removeFavorite(userId, motorcycleId) {
  const { error } = await deleteFavorite(userId, motorcycleId);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  return { message: 'Favorito eliminado' };
}

export async function listFavorites(userId) {
  const { data, error } = await findFavoritesByUser(userId);

  if (error) {
    const err = new Error(error.message);
    err.statusCode = 500;
    throw err;
  }

  return data.map((row) => row.motorcycles).filter(Boolean);
}
