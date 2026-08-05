const User = require("../models/User");
const { createToken } = require("../utils/auth");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const validateRegistration = ({ name, email, phone, password }) => {
  const errors = [];
  if (!name || !name.trim()) errors.push({ field: "name", message: "Name is required" });
  if (!emailPattern.test(normalizeEmail(email))) errors.push({ field: "email", message: "Enter a valid email address" });
  if (password?.length < 8) errors.push({ field: "password", message: "Password must be at least 8 characters" });
  if (phone && !/^\d{10}$/.test(phone.trim())) errors.push({ field: "phone", message: "Phone must contain exactly 10 digits" });
  return errors;
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const errors = validateRegistration({ name, email, phone, password });
    if (errors.length) {
      return res.status(400).json({ status: false, message: "Please correct the highlighted fields", errors });
    }

    const normalizedEmail = normalizeEmail(email);
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ status: false, message: "An account with this email already exists", errors: [] });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || undefined,
      password,
    });

    const token = createToken(user);
    return res.status(201).json({ status: true, message: "Account created successfully", data: { user: user.toSafeObject(), token } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ status: false, message: "An account with these details already exists", errors: [] });
    }
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: false, message: "Email and password are required", errors: [] });
    }

    const user = await User.findOne({ email, deletedAt: null }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: false, message: "Invalid email or password", errors: [] });
    }

    const token = createToken(user);
    return res.json({ status: true, message: "Login successful", data: { user: user.toSafeObject(), token } });
  } catch (error) {
    return next(error);
  }
};

exports.me = (req, res) => res.json({
  status: true,
  message: "Current user fetched successfully",
  data: { user: req.user.toSafeObject() },
});
