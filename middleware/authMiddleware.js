const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { COOKIE_NAME } = require("../utils/auth");

const readCookie = (header = "", name) => {
  const cookie = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
};

exports.protect = async (req, res, next) => {
  try {
    const token = readCookie(req.headers.cookie, COOKIE_NAME);
    if (!token) return res.status(401).json({ status: false, message: "Authentication required", errors: [] });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: payload.userId, deletedAt: null });
    if (!user) return res.status(401).json({ status: false, message: "Your session is no longer valid", errors: [] });

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ status: false, message: "Your session has expired", errors: [] });
    }
    return next(error);
  }
};
