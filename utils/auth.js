const jwt = require("jsonwebtoken");

const createToken = (user) => jwt.sign(
  { userId: user._id.toString() },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);

exports.createToken = createToken;
