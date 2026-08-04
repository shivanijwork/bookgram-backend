const router = require("express").Router();
const { register, login, logout, me } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authRateLimit } = require("../middleware/rateLimit");

router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);
router.post("/logout", logout);
router.get("/me", protect, me);

module.exports = router;
