const { validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const mealdb = require('../services/mealdb');
const ShoppingList = require('../models/ShoppingList');
const User = require('../models/User');
const { buildShoppingList } = require('../services/shoppingList');
const { isConnected } = require('../config/db');

// POST /api/shopping-list/preview { recipeIds: [] }
// Public-ish: requires recipeIds in body. No DB write. Returns aggregated items.
const preview = asyncHandler(async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return fail(res, 400, 'Validation failed', errs.array());

  const { recipeIds = [] } = req.body;
  if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
    return fail(res, 400, 'recipeIds must be a non-empty array');
  }
  // Look up each meal in parallel (cache makes repeats free).
  const lookups = await Promise.all(recipeIds.map((id) => mealdb.lookupById(id)));
  const meals = lookups.map((l) => l.value).filter(Boolean);
  if (meals.length === 0) return fail(res, 404, 'No recipes resolved');

  const items = buildShoppingList(meals);
  return ok(res, {
    items,
    recipeIds: meals.map((m) => m.idMeal),
    recipeNames: meals.map((m) => m.strMeal),
    meta: { recipesIn: recipeIds.length, recipesResolved: meals.length },
  });
});

// POST /api/shopping-list { name, recipeIds: [] } — save (auth required)
const save = asyncHandler(async (req, res) => {
  if (!isConnected()) return fail(res, 503, 'Database not connected');
  const errs = validationResult(req);
  if (!errs.isEmpty()) return fail(res, 400, 'Validation failed', errs.array());

  const { recipeIds = [], name } = req.body;
  if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
    return fail(res, 400, 'recipeIds must be a non-empty array');
  }
  const lookups = await Promise.all(recipeIds.map((id) => mealdb.lookupById(id)));
  const meals = lookups.map((l) => l.value).filter(Boolean);
  const items = buildShoppingList(meals);

  const list = await ShoppingList.create({
    user: req.user._id,
    name: name || `List · ${new Date().toLocaleDateString()}`,
    recipeIds: meals.map((m) => m.idMeal),
    recipeNames: meals.map((m) => m.strMeal),
    items,
  });
  return ok(res, { list }, 'Saved', 201);
});

// GET /api/shopping-list — current user's lists
const listMine = asyncHandler(async (req, res) => {
  const lists = await ShoppingList.find({ user: req.user._id }).sort('-createdAt');
  return ok(res, { lists });
});

// GET /api/shopping-list/:id
const getById = asyncHandler(async (req, res) => {
  const list = await ShoppingList.findOne({ _id: req.params.id, user: req.user._id });
  if (!list) return fail(res, 404, 'List not found');
  return ok(res, { list });
});

// PATCH /api/shopping-list/:id/items/:itemId — toggle checked
const toggleItem = asyncHandler(async (req, res) => {
  const list = await ShoppingList.findOne({ _id: req.params.id, user: req.user._id });
  if (!list) return fail(res, 404, 'List not found');
  const item = list.items.id(req.params.itemId);
  if (!item) return fail(res, 404, 'Item not found');
  item.checked = !item.checked;
  await list.save();
  return ok(res, { list });
});

// DELETE /api/shopping-list/:id
const remove = asyncHandler(async (req, res) => {
  const list = await ShoppingList.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!list) return fail(res, 404, 'List not found');
  return ok(res, { id: req.params.id }, 'Deleted');
});

// POST /api/shopping-list/from-favorites — convenience
const fromFavorites = asyncHandler(async (req, res) => {
  if (!isConnected()) return fail(res, 503, 'Database not connected');
  const user = await User.findById(req.user._id);
  const recipeIds = user.favorites.map((f) => f.mealId);
  if (recipeIds.length === 0) return fail(res, 400, 'You have no favorites yet');

  const lookups = await Promise.all(recipeIds.map((id) => mealdb.lookupById(id)));
  const meals = lookups.map((l) => l.value).filter(Boolean);
  const items = buildShoppingList(meals);
  return ok(res, {
    items,
    recipeIds: meals.map((m) => m.idMeal),
    recipeNames: meals.map((m) => m.strMeal),
  });
});

module.exports = { preview, save, listMine, getById, toggleItem, remove, fromFavorites };
