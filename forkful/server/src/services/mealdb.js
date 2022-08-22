const axios = require('axios');
const NodeCache = require('node-cache');
const { meals: mockMeals, categories: mockCategories, areas: mockAreas, toListShape } = require('../data/mockMeals');

// Per-endpoint TTLs (seconds). Static-ish things live longer.
const TTL = {
  search: 60 * 5,        // 5 min
  ingredient: 60 * 10,   // 10 min
  category: 60 * 10,
  area: 60 * 10,
  filterCategory: 60 * 10,
  filterArea: 60 * 10,
  filterIngredient: 60 * 10,
  lookup: 60 * 60,       // 1 hour — individual meals are stable
  random: 30,            // short — clients want freshness
  categoriesList: 60 * 60 * 6,
  areasList: 60 * 60 * 6,
};

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });
const inflight = new Map();

const base = () => {
  const root = process.env.MEALDB_BASE_URL || 'https://www.themealdb.com/api/json/v1';
  const key = process.env.MEALDB_API_KEY || '1';
  return `${root}/${key}`;
};

// getOrSet(key, ttl, fetcher) with inflight promise dedup.
// Returns { value, source: 'cache' | 'upstream' | 'mock', ttl }
const getOrSet = async (key, ttl, fetcher) => {
  const hit = cache.get(key);
  if (hit !== undefined) {
    const remaining = cache.getTtl(key);
    const ttlLeft = remaining ? Math.max(0, Math.round((remaining - Date.now()) / 1000)) : ttl;
    return { value: hit, source: 'cache', ttl: ttlLeft };
  }
  if (inflight.has(key)) {
    const value = await inflight.get(key);
    return { value, source: 'cache', ttl };
  }
  const p = (async () => {
    try {
      const v = await fetcher();
      cache.set(key, v, ttl);
      return v;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  const value = await p;
  return { value, source: 'upstream', ttl };
};

const http = axios.create({ timeout: 7000 });

const fetchJSON = async (path, params = {}) => {
  const url = `${base()}${path}`;
  const { data } = await http.get(url, { params });
  return data;
};

// --- Mock filter helpers ---
const mockSearchByName = (q) => {
  const s = (q || '').toLowerCase();
  if (!s) return mockMeals.slice(0, 6);
  return mockMeals.filter((m) => m.strMeal.toLowerCase().includes(s));
};
const mockFilterByCategory = (c) =>
  mockMeals.filter((m) => m.strCategory.toLowerCase() === (c || '').toLowerCase()).map(toListShape);
const mockFilterByArea = (a) =>
  mockMeals.filter((m) => m.strArea.toLowerCase() === (a || '').toLowerCase()).map(toListShape);
const mockFilterByIngredient = (i) => {
  const s = (i || '').toLowerCase();
  return mockMeals
    .filter((m) =>
      Object.keys(m)
        .filter((k) => k.startsWith('strIngredient'))
        .some((k) => (m[k] || '').toLowerCase().includes(s))
    )
    .map(toListShape);
};
const mockLookup = (id) => mockMeals.find((m) => m.idMeal === String(id)) || null;
const mockRandom = () => mockMeals[Math.floor(Math.random() * mockMeals.length)];

// --- Public service functions. Each returns { value, source, ttl } ---
const safe = async (key, ttl, upstreamFn, mockFn) => {
  try {
    return await getOrSet(key, ttl, upstreamFn);
  } catch (err) {
    // Upstream failed (offline, rate-limited, DNS). Serve deterministic mock so
    // the demo still works end-to-end.
    return { value: mockFn(), source: 'mock', ttl: 0 };
  }
};

const searchByName = (q) =>
  safe(
    `search:${q}`,
    TTL.search,
    async () => (await fetchJSON('/search.php', { s: q })).meals || [],
    () => mockSearchByName(q)
  );

const filterByCategory = (c) =>
  safe(
    `filter:cat:${c}`,
    TTL.filterCategory,
    async () => (await fetchJSON('/filter.php', { c })).meals || [],
    () => mockFilterByCategory(c)
  );

const filterByArea = (a) =>
  safe(
    `filter:area:${a}`,
    TTL.filterArea,
    async () => (await fetchJSON('/filter.php', { a })).meals || [],
    () => mockFilterByArea(a)
  );

const filterByIngredient = (i) =>
  safe(
    `filter:ing:${i}`,
    TTL.filterIngredient,
    async () => (await fetchJSON('/filter.php', { i })).meals || [],
    () => mockFilterByIngredient(i)
  );

const lookupById = (id) =>
  safe(
    `lookup:${id}`,
    TTL.lookup,
    async () => {
      const data = await fetchJSON('/lookup.php', { i: id });
      return (data.meals && data.meals[0]) || null;
    },
    () => mockLookup(id)
  );

const random = () =>
  safe(
    `random:${Date.now() >> 15}`, // bucket keys per ~32s so the cache rotates
    TTL.random,
    async () => {
      const data = await fetchJSON('/random.php');
      return (data.meals && data.meals[0]) || null;
    },
    () => mockRandom()
  );

const listCategories = () =>
  safe(
    'list:categories',
    TTL.categoriesList,
    async () => (await fetchJSON('/categories.php')).categories || [],
    () => mockCategories
  );

const listAreas = () =>
  safe(
    'list:areas',
    TTL.areasList,
    async () => (await fetchJSON('/list.php', { a: 'list' })).meals || [],
    () => mockAreas
  );

const cacheStats = () => ({
  keys: cache.keys().length,
  hits: cache.getStats().hits,
  misses: cache.getStats().misses,
});

module.exports = {
  searchByName,
  filterByCategory,
  filterByArea,
  filterByIngredient,
  lookupById,
  random,
  listCategories,
  listAreas,
  cacheStats,
};
