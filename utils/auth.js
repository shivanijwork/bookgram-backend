const jwt = require("jsonwebtoken");

const COOKIE_NAME = "bookgram_token";

const cookieOptions = () => {
  const days = Number(process.env.COOKIE_EXPIRES_DAYS || 7);
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: days * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

const createToken = (user) => jwt.sign(
  { userId: user._id.toString(), role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);

exports.COOKIE_NAME = COOKIE_NAME;
exports.setAuthCookie = (res, user) => res.cookie(COOKIE_NAME, createToken(user), cookieOptions());
exports.clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
});
