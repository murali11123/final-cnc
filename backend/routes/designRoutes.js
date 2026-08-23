const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAdminKey } = require('../middleware/adminAuth');
const {
  getDesigns,
  getDesignById,
  searchImage,
  createDesign,
  deleteDesign
} = require('../controllers/designController');

// Public gallery
router.get('/', getDesigns);

// AI image similarity search - THE core feature
router.post('/search/image', upload.single('image'), searchImage);

// Single design detail
router.get('/:id', getDesignById);

// Manually add / remove a single design (admin key required)
router.post('/', requireAdminKey, upload.single('image'), createDesign);
router.delete('/:id', requireAdminKey, deleteDesign);

module.exports = router;