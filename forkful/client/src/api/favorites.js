import client from './client';

export const listFavorites = async () => {
  const { data } = await client.get('/favorites');
  return data.data.favorites;
};

export const addFavorite = async (mealId) => {
  const { data } = await client.post('/favorites', { mealId });
  return data.data.favorites;
};

export const removeFavorite = async (mealId) => {
  const { data } = await client.delete(`/favorites/${mealId}`);
  return data.data.favorites;
};
