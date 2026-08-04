const mongoose = require("mongoose");
const Book = require("../models/Book");
const { BOOK_FIELDS, normalizeBookInput, validateBookInput } = require("../utils/bookValidation");

const invalidId = (id) => !mongoose.Types.ObjectId.isValid(id);
const notFound = (res) => res.status(404).json({ status: false, message: "Book not found", errors: [] });
const validationFailure = (res, errors) => res.status(400).json({ status: false, message: "Please correct the highlighted fields", errors });
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.createBook = async (req, res, next) => {
  try {
    const errors = validateBookInput(req.body);
    if (errors.length) return validationFailure(res, errors);
    const input = normalizeBookInput(req.body);
    const book = await Book.create({ ...input, user: req.user._id });
    return res.status(201).json({ status: true, message: "Book added successfully", data: { book } });
  } catch (error) {
    return next(error);
  }
};

exports.getBooks = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 24));
    const filter = { user: req.user._id };

    if (["tbr", "reading", "read"].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.genre) filter.genre = new RegExp(`^${escapeRegex(req.query.genre.trim())}$`, "i");
    if (req.query.tag) filter.tags = new RegExp(`^${escapeRegex(req.query.tag.trim())}$`, "i");
    if (req.query.search?.trim()) {
      const search = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = [{ title: search }, { author: search }];
    }

    const sorts = {
      newest: { createdAt: -1 }, oldest: { createdAt: 1 },
      "title-asc": { title: 1 }, "title-desc": { title: -1 },
      "author-asc": { author: 1 }, "rating-desc": { rating: -1, createdAt: -1 },
    };
    const sort = sorts[req.query.sort] || sorts.newest;
    const [books, total] = await Promise.all([
      Book.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Book.countDocuments(filter),
    ]);

    return res.json({
      status: true,
      message: "Books fetched successfully",
      data: { books, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getBook = async (req, res, next) => {
  try {
    if (invalidId(req.params.id)) return notFound(res);
    const book = await Book.findOne({ _id: req.params.id, user: req.user._id });
    if (!book) return notFound(res);
    return res.json({ status: true, message: "Book fetched successfully", data: { book } });
  } catch (error) {
    return next(error);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    if (invalidId(req.params.id)) return notFound(res);
    const suppliedFields = BOOK_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field));
    if (!suppliedFields.length) return validationFailure(res, [{ field: "form", message: "Provide at least one book field to update" }]);
    const input = Object.fromEntries(suppliedFields.map((field) => [field, req.body[field]]));
    const errors = validateBookInput(input, { partial: true });
    if (errors.length) return validationFailure(res, errors);
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: normalizeBookInput(input) },
      { new: true, runValidators: true }
    );
    if (!book) return notFound(res);
    return res.json({ status: true, message: "Book updated successfully", data: { book } });
  } catch (error) {
    return next(error);
  }
};

exports.updateBookStatus = async (req, res, next) => {
  try {
    if (invalidId(req.params.id)) return notFound(res);
    const input = { status: req.body.status };
    const errors = validateBookInput(input, { partial: true });
    if (errors.length) return validationFailure(res, errors);
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: input },
      { new: true, runValidators: true }
    );
    if (!book) return notFound(res);
    return res.json({ status: true, message: "Reading status updated", data: { book } });
  } catch (error) {
    return next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    if (invalidId(req.params.id)) return notFound(res);
    const book = await Book.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!book) return notFound(res);
    return res.json({ status: true, message: "Book deleted successfully", data: null });
  } catch (error) {
    return next(error);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const [summary] = await Book.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        tbr: { $sum: { $cond: [{ $eq: ["$status", "tbr"] }, 1, 0] } },
        reading: { $sum: { $cond: [{ $eq: ["$status", "reading"] }, 1, 0] } },
        read: { $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] } },
        genreNames: { $addToSet: { $toLower: "$genre" } },
      } },
      { $project: { _id: 0, total: 1, tbr: 1, reading: 1, read: 1, genres: { $size: "$genreNames" } } },
    ]);
    return res.json({ status: true, message: "Collection summary fetched successfully", data: summary || { total: 0, tbr: 0, reading: 0, read: 0, genres: 0 } });
  } catch (error) {
    return next(error);
  }
};
