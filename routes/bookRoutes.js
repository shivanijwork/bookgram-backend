const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createBook, getBooks, getBook, updateBook, updateBookStatus, deleteBook, getSummary,
} = require("../controllers/bookController");

router.use(protect);
router.get("/summary", getSummary);
router.route("/").get(getBooks).post(createBook);
router.patch("/:id/status", updateBookStatus);
router.route("/:id").get(getBook).patch(updateBook).delete(deleteBook);

module.exports = router;
