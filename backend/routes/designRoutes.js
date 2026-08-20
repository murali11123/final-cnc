const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protectAdmin } = require('../middleware/auth');
const {
  getDesigns,
  getDesignsAdmin,
  getDesignById,
  createDesign,
  updateDesign,
  regenerateAI,
  deleteDesign,
  searchImage,
  reindexAll
} = require('../controllers/designController');

// Public gallery and details routes
router.get('/', getDesigns);
router.get('/:id', getDesignById);

// Public AI image similarity search route
router.post('/search/image', upload.single('image'), searchImage);

// Admin protected designs CRUD and utilities
router.get('/admin/list', protectAdmin, getDesignsAdmin);
router.post('/', protectAdmin, upload.single('image'), createDesign);
router.put('/:id', protectAdmin, upload.single('image'), updateDesign);
router.post('/:id/regenerate', protectAdmin, regenerateAI);
router.delete('/:id', protectAdmin, deleteDesign);
router.post('/search/reindex', protectAdmin, reindexAll);

module.exports = router;
