import client, { cacheMeta } from './client';

const unwrap = (resp) => ({ ...resp.data.data, _cache: cacheMeta(resp) });

export const searchRecipes = async (q) => unwrap(await client.get('/recipes/search', { params: { q } }));
export const filterByCategory = async (category) => unwrap(await client.get('/recipes/filter', { params: { category } }));
export const filterByArea = async (area) => unwrap(await client.get('/recipes/filter', { params: { area } }));
export const filterByIngredient = async (ingredient) =>
  unwrap(await client.get('/recipes/filter', { params: { ingredient } }));
export const randomRecipe = async () => unwrap(await client.get('/recipes/random'));
export const listCategories = async () => unwrap(await client.get('/recipes/categories'));
export const listAreas = async () => unwrap(await client.get('/recipes/areas'));
export const getRecipe = async (id) => unwrap(await client.get(`/recipes/${id}`));
