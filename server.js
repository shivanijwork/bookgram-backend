const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config({ quiet: true });

const app = express();

app.set("trust proxy", 1);
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
// Spine photos are sent as compact data URLs so the app can accept uploads
// without requiring a separate cloud-storage account.
app.use(express.json({ limit: "4mb" }));
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);

app.get("/", (req, res) => res.send("Bookgram API running"));
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  return app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

if (require.main === module) startServer();

// Vercel expects the Express app itself to be the exported function.
module.exports = app;
module.exports.startServer = startServer;
