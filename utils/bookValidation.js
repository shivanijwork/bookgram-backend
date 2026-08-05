const BOOK_FIELDS = ["title", "author", "genre", "tags", "status", "coverUrl", "spineImage", "rating", "notes"];
const STATUSES = ["tbr", "reading", "read"];

const cleanString = (value) => typeof value === "string" ? value.trim() : value;

const isHttpUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isImageDataUrl = (value) => typeof value === "string" && /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(value);

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return tags;
  const unique = new Map();
  tags.forEach((tag) => {
    if (typeof tag !== "string") return;
    const cleaned = tag.trim();
    if (cleaned) unique.set(cleaned.toLowerCase(), cleaned);
  });
  return [...unique.values()];
};

const normalizeBookInput = (input = {}) => {
  const output = {};
  BOOK_FIELDS.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(input, field)) return;
    if (["title", "author", "genre", "coverUrl", "notes"].includes(field)) output[field] = cleanString(input[field]);
    else if (field === "spineImage") output.spineImage = input.spineImage;
    else if (field === "tags") output.tags = normalizeTags(input.tags);
    else if (field === "rating") output.rating = input.rating === "" || input.rating === null ? null : Number(input.rating);
    else output[field] = input[field];
  });
  return output;
};

const validateBookInput = (input, { partial = false } = {}) => {
  const errors = [];
  const has = (field) => Object.prototype.hasOwnProperty.call(input, field);

  if (!partial || has("title")) {
    if (typeof input.title !== "string" || !input.title.trim()) errors.push({ field: "title", message: "Title is required" });
    else if (input.title.trim().length > 200) errors.push({ field: "title", message: "Title cannot exceed 200 characters" });
  }
  if (!partial || has("author")) {
    if (typeof input.author !== "string" || !input.author.trim()) errors.push({ field: "author", message: "Author is required" });
    else if (input.author.trim().length > 160) errors.push({ field: "author", message: "Author cannot exceed 160 characters" });
  }
  if (!partial || has("genre")) {
    if (typeof input.genre !== "string" || !input.genre.trim()) errors.push({ field: "genre", message: "Genre is required" });
    else if (input.genre.trim().length > 80) errors.push({ field: "genre", message: "Genre cannot exceed 80 characters" });
  }
  if (has("tags")) {
    if (!Array.isArray(input.tags)) errors.push({ field: "tags", message: "Tags must be a list" });
    else if (input.tags.length > 20) errors.push({ field: "tags", message: "Use no more than 20 tags" });
    else if (input.tags.some((tag) => typeof tag !== "string" || tag.trim().length > 40)) errors.push({ field: "tags", message: "Each tag must be 40 characters or fewer" });
  }
  if (has("status") && !STATUSES.includes(input.status)) errors.push({ field: "status", message: "Choose TBR, Reading, or Read" });
  if (has("coverUrl") && (typeof input.coverUrl !== "string" || input.coverUrl.length > 2048 || !isHttpUrl(input.coverUrl))) errors.push({ field: "coverUrl", message: "Enter a valid HTTP or HTTPS image URL" });
  if (!partial && (!input.spineImage || !isImageDataUrl(input.spineImage))) errors.push({ field: "spineImage", message: "Upload a JPG, PNG, or WebP photo of the book spine" });
  if (has("spineImage") && input.spineImage && (!isImageDataUrl(input.spineImage) || input.spineImage.length > 3000000)) errors.push({ field: "spineImage", message: "Use a JPG, PNG, or WebP spine image smaller than 2 MB" });
  if (has("rating") && input.rating !== null && (!Number.isInteger(Number(input.rating)) || Number(input.rating) < 1 || Number(input.rating) > 5)) errors.push({ field: "rating", message: "Rating must be a whole number from 1 to 5" });
  if (has("notes") && (typeof input.notes !== "string" || input.notes.length > 5000)) errors.push({ field: "notes", message: "Notes cannot exceed 5000 characters" });

  return errors;
};

module.exports = { BOOK_FIELDS, STATUSES, normalizeBookInput, validateBookInput };
