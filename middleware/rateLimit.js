const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 20;

exports.authRateLimit = (req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || now - current.startedAt >= WINDOW_MS) {
    attempts.set(key, { count: 1, startedAt: now });
    return next();
  }

  if (current.count >= MAX_ATTEMPTS) {
    return res.status(429).json({ status: false, message: "Too many attempts. Please try again later.", errors: [] });
  }

  current.count += 1;
  return next();
};
