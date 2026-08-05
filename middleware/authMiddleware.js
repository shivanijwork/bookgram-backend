const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const authorization = req.get("authorization") || "";
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
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
