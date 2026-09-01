require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");
const designRoutes = require("./routes/designRoutes");
const contactRoutes = require("./routes/contactRoutes");
const { getPipeline } = require("./services/embeddingService");

// Catch crashes that would otherwise silently kill the process (and cause 502s)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (logs success/failure clearly - see config/db.js)
connectDB();

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check — before rate limiting, so it's always reachable
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
});

const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    message:
      "Too many image searches. Please wait a few minutes before trying again.",
  },
});

app.use("/api", generalLimiter);
app.use("/api/designs/search/image", searchLimiter);

// Routes
app.use("/api/designs", designRoutes);
app.use("/api/contact", contactRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Express Error Handler:", err.stack || err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "An unexpected server error occurred.",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );

  // Pre-load the CLIP model at startup instead of on the first request.
  // This avoids a slow/heavy model load happening inside a live user request,
  // which was likely causing memory spikes and 502s.
  getPipeline()
    .then(() => console.log("CLIP model pre-loaded and ready."))
    .catch((err) =>
      console.error("Failed to pre-load CLIP model:", err.message),
    );
});
