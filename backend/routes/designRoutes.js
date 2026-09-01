const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { requireAdminKey } = require("../middleware/adminAuth");
const {
  getDesigns,
  getDesignById,
  searchImage,
  createDesign,
  deleteDesign,
} = require("../controllers/designController");

// Public gallery
router.get("/", getDesigns);

// AI image similarity search - THE core feature
router.post("/search/image", upload.single("image"), searchImage);

// Single design detail
router.get("/:id", getDesignById);

// Manually add / remove a single design (admin key required)
router.post("/", requireAdminKey, upload.single("image"), createDesign);
router.delete("/:id", requireAdminKey, deleteDesign);

// health.js or directly in your main server file (e.g. server.js / app.js)

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
