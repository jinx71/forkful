const asyncHandler = require('../middleware/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const mealdb = require('../services/mealdb');

const setCacheHeaders = (res, source, ttl) => {
  res.set('X-Cache', source);
  res.set('X-Cache-TTL', String(ttl || 0));
  res.set('X-Data-Source', source === 'mock' ? 'mock' : 'themealdb');
};

const respondMeta = (res, value, source, ttl, payloadKey = 'meals') => {
  setCacheHeaders(res, source, ttl);
  return ok(res, { [payloadKey]: value || [], meta: { source, ttl } });
};

// GET /api/recipes/search?q=...
const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return fail(res, 400, 'Query parameter "q" is required');
  const { value, source, ttl } = await mealdb.searchByName(q);
  return respondMeta(res, value, source, ttl);
});

// GET /api/recipes/filter?category=...&area=...&ingredient=...
const filter = asyncHandler(async (req, res) => {
  const { category, area, ingredient } = req.query;
  if (category) {
    const r = await mealdb.filterByCategory(category);
    return respondMeta(res, r.value, r.source, r.ttl);
  }
  if (area) {
    const r = await mealdb.filterByArea(area);
    return respondMeta(res, r.value, r.source, r.ttl);
  }
  if (ingredient) {
    const r = await mealdb.filterByIngredient(ingredient);
    return respondMeta(res, r.value, r.source, r.ttl);
  }
  return fail(res, 400, 'Provide one of: category, area, ingredient');
});

// GET /api/recipes/random
const random = asyncHandler(async (req, res) => {
  const { value, source, ttl } = await mealdb.random();
  setCacheHeaders(res, source, ttl);
  return ok(res, { meal: value, meta: { source, ttl } });
});

// GET /api/recipes/categories
const categories = asyncHandler(async (req, res) => {
  const { value, source, ttl } = await mealdb.listCategories();
  return respondMeta(res, value, source, ttl, 'categories');
});

// GET /api/recipes/areas
const areas = asyncHandler(async (req, res) => {
  const { value, source, ttl } = await mealdb.listAreas();
  return respondMeta(res, value, source, ttl, 'areas');
});

// GET /api/recipes/:id
const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { value, source, ttl } = await mealdb.lookupById(id);
  if (!value) return fail(res, 404, 'Recipe not found');
  setCacheHeaders(res, source, ttl);
  return ok(res, { meal: value, meta: { source, ttl } });
});

// GET /api/recipes/_cache (debug)
const cacheStats = asyncHandler(async (req, res) => ok(res, mealdb.cacheStats()));

module.exports = { search, filter, random, categories, areas, getById, cacheStats };
