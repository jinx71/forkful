const ok = (res, data, message, status = 200, extra = {}) =>
  res.status(status).json({ success: true, data, message, ...extra });

const fail = (res, status, message, errors = []) =>
  res.status(status).json({ success: false, message, errors });

module.exports = { ok, fail };
