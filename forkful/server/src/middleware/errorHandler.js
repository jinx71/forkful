// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Server error';
  const errors = err.errors || [];

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    status = 400;
    message = 'Invalid id';
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
  }
  // Mongoose validation
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    Object.values(err.errors).forEach((e) => errors.push({ field: e.path, msg: e.message }));
  }
  // JWT
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[error] ${status} ${message}`);
    if (status >= 500) console.error(err.stack);
  }

  res.status(status).json({ success: false, message, errors });
};

module.exports = errorHandler;
