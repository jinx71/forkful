const { validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const User = require('../models/User');
const mealdb = require('../services/mealdb');

// GET /api/favorites
const listFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return ok(res, { favorites: user.favorites });
});

// POST /api/favorites { mealId }
const addFavorite = asyncHandler(async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return fail(res, 400, 'Validation failed', errs.array());

  const { mealId } = req.body;
  const user = await User.findById(req.user._id);
  if (user.favorites.some((f) => f.mealId === String(mealId))) {
    return ok(res, { favorites: user.favorites }, 'Already in favorites');
  }
  const { value: meal } = await mealdb.lookupById(mealId);
  if (!meal) return fail(res, 404, 'Recipe not found');

  user.favorites.push({
    mealId: String(meal.idMeal),
    name: meal.strMeal,
    thumbnail: meal.strMealThumb || '',
    category: meal.strCategory || '',
    area: meal.strArea || '',
  });
  await user.save();
  return ok(res, { favorites: user.favorites }, 'Added', 201);
});

// DELETE /api/favorites/:mealId
const removeFavorite = asyncHandler(async (req, res) => {
  const { mealId } = req.params;
  const user = await User.findById(req.user._id);
  const before = user.favorites.length;
  user.favorites = user.favorites.filter((f) => f.mealId !== String(mealId));
  if (user.favorites.length === before) return fail(res, 404, 'Not in favorites');
  await user.save();
  return ok(res, { favorites: user.favorites }, 'Removed');
});

module.exports = { listFavorites, addFavorite, removeFavorite };
