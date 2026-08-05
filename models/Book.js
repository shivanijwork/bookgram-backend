const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, required: true, trim: true, maxlength: 160 },
    genre: { type: String, required: true, trim: true, maxlength: 80 },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    status: {
      type: String,
      enum: ["tbr", "reading", "read"],
      default: "tbr",
    },
    coverUrl: { type: String, trim: true, maxlength: 2048, default: "" },
    coverPublicId: { type: String, select: false, default: null },
    spineImage: { type: String, maxlength: 3000000, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null },
    notes: { type: String, trim: true, maxlength: 5000, default: "" },
  },
  { timestamps: true }
);

bookSchema.index({ user: 1, status: 1 });
bookSchema.index({ user: 1, genre: 1 });
bookSchema.index({ user: 1, createdAt: -1 });
bookSchema.index({ user: 1, title: 1, author: 1 });

module.exports = mongoose.model("Book", bookSchema);
