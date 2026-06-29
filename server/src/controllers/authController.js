const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const { isConnected } = require('../config/db');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const requireDB = (res) => {
  if (!isConnected()) {
    fail(res, 503, 'Auth unavailable — database not connected. Set MONGO_URI in server/.env.');
    return false;
  }
  return true;
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const errs = validationResult(req);
  if (!errs.isEmpty()) return fail(res, 400, 'Validation failed', errs.array());

  const { name, email, password } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return fail(res, 409, 'Email already registered');

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  return ok(res, { token, user: user.toSafeJSON() }, 'Registered', 201);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  if (!requireDB(res)) return;
  const errs = validationResult(req);
  if (!errs.isEmpty()) return fail(res, 400, 'Validation failed', errs.array());

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) return fail(res, 401, 'Invalid credentials');
  const matched = await user.matchPassword(password);
  if (!matched) return fail(res, 401, 'Invalid credentials');

  const token = signToken(user._id);
  return ok(res, { token, user: user.toSafeJSON() }, 'Logged in');
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => ok(res, { user: req.user.toSafeJSON() }));

module.exports = { register, login, me };
