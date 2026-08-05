const router = require("express").Router();
const { register, login, me } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authRateLimit } = require("../middleware/rateLimit");

router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);
router.get("/me", protect, me);

module.exports = router;
