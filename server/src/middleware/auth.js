const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isConnected } = require('../config/db');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated', errors: [] });
    }
    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!isConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Auth unavailable — database not connected.',
        errors: [],
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists', errors: [] });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
