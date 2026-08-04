const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config({ quiet: true });

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("MONGO_URI and JWT_SECRET environment variables are required");
  process.exit(1);
}

const app = express();

app.set("trust proxy", 1);
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("Bookgram API running"));
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  return app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

if (require.main === module) startServer();

module.exports = { app, startServer };
