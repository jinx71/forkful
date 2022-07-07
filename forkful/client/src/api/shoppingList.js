import client from './client';

export const previewList = async (recipeIds) => {
  const { data } = await client.post('/shopping-list/preview', { recipeIds });
  return data.data;
};

export const fromFavorites = async () => {
  const { data } = await client.post('/shopping-list/from-favorites');
  return data.data;
};

export const saveList = async ({ recipeIds, name }) => {
  const { data } = await client.post('/shopping-list', { recipeIds, name });
  return data.data.list;
};

export const listMine = async () => {
  const { data } = await client.get('/shopping-list');
  return data.data.lists;
};

export const getList = async (id) => {
  const { data } = await client.get(`/shopping-list/${id}`);
  return data.data.list;
};

export const toggleItem = async (listId, itemId) => {
  const { data } = await client.patch(`/shopping-list/${listId}/items/${itemId}`);
  return data.data.list;
};

export const deleteList = async (id) => {
  const { data } = await client.delete(`/shopping-list/${id}`);
  return data.data;
};
