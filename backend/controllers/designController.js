const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Design = require('../models/Design');
const embeddingService = require('../services/embeddingService');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Helper to upload image buffer (either to Cloudinary or locally)
 * Returns { imageUrl, thumbnailUrl }
 */
const saveImageFile = async (file) => {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: '3d-cnc' },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            imageUrl: result.secure_url,
            thumbnailUrl: result.eager && result.eager[0] ? result.eager[0].secure_url : result.secure_url
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  } else {
    // Local storage fallback
    const ext = path.extname(file.originalname) || '.png';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const relativePath = `/uploads/${filename}`;
    const absolutePath = path.join(__dirname, '..', 'uploads', filename);

    // Write file to local folder
    fs.writeFileSync(absolutePath, file.buffer);
    return {
      imageUrl: relativePath,
      thumbnailUrl: relativePath
    };
  }
};

/**
 * Background worker to extract embedding and update Design document
 */
const processEmbeddingInBackground = async (designId, fileBuffer, mimeType) => {
  try {
    const { embedding } = await embeddingService.generateImageEmbedding(fileBuffer, mimeType);
    
    await Design.findByIdAndUpdate(designId, {
      embedding: embedding,
      aiStatus: 'Ready'
    });
    console.log(`AI Embedding successfully created for Design ID: ${designId}`);
  } catch (error) {
    console.error(`AI Embedding failed for Design ID: ${designId}. Error:`, error.message);
    await Design.findByIdAndUpdate(designId, {
      aiStatus: 'Failed'
    });
  }
};

// GET /api/designs - Public gallery (active only)
const getDesigns = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { active: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      // Search by name, code, or tags
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    } else if (sort === 'priceAsc') {
      sortOption = { price: 1 };
    } else if (sort === 'priceDesc') {
      sortOption = { price: -1 };
    }

    const designs = await Design.find(query).sort(sortOption).select('-embedding');
    res.json(designs);
  } catch (error) {
    console.error('getDesigns error:', error.message);
    res.status(500).json({ message: 'Error retrieving designs' });
  }
};

// GET /api/designs/admin - Admin gallery (all designs, with embeddings metadata)
const getDesignsAdmin = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const designs = await Design.find(query).sort({ createdAt: -1 }).select('-embedding');
    res.json(designs);
  } catch (error) {
    console.error('getDesignsAdmin error:', error.message);
    res.status(500).json({ message: 'Error retrieving designs for admin' });
  }
};

// GET /api/designs/:id
const getDesignById = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id).select('-embedding');
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    res.json(design);
  } catch (error) {
    console.error('getDesignById error:', error.message);
    res.status(500).json({ message: 'Error retrieving design' });
  }
};

// POST /api/designs - Admin Protected
const createDesign = async (req, res) => {
  try {
    const { name, code, category, description, price, tags } = req.body;

    if (!name || !code || !category) {
      return res.status(400).json({ message: 'Name, Unique Code, and Category are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'An image upload is required.' });
    }

    // Check code uniqueness
    const codeExists = await Design.findOne({ code });
    if (codeExists) {
      return res.status(400).json({ message: `Design code '${code}' already exists. Choose a unique code.` });
    }

    // Save image
    const { imageUrl, thumbnailUrl } = await saveImageFile(req.file);

    // Save design
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const newDesign = new Design({
      name,
      code: code.toUpperCase(),
      category,
      description: description || '',
      price: price ? parseFloat(price) : null,
      tags: tagsArray,
      imageUrl,
      thumbnailUrl,
      aiStatus: 'Processing'
    });

    const savedDesign = await newDesign.save();

    // Trigger AI embedding calculation asynchronously
    processEmbeddingInBackground(savedDesign._id, req.file.buffer, req.file.mimetype);

    // Return the response immediately so dashboard isn't blocked
    res.status(201).json({
      message: 'Design created successfully. AI similarity embedding is being calculated.',
      data: savedDesign
    });
  } catch (error) {
    console.error('createDesign error:', error.message);
    res.status(500).json({ message: error.message || 'Error creating design' });
  }
};

// PUT /api/designs/:id - Admin Protected
const updateDesign = async (req, res) => {
  try {
    const { name, code, category, description, price, tags, active } = req.body;
    const designId = req.params.id;

    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Check unique code if changed
    if (code && code.toUpperCase() !== design.code) {
      const codeExists = await Design.findOne({ code: code.toUpperCase() });
      if (codeExists) {
        return res.status(400).json({ message: `Design code '${code}' already exists.` });
      }
      design.code = code.toUpperCase();
    }

    if (name) design.name = name;
    if (category) design.category = category;
    if (description !== undefined) design.description = description;
    if (price !== undefined) design.price = price ? parseFloat(price) : null;
    if (active !== undefined) design.active = active === 'true' || active === true;
    
    if (tags) {
      design.tags = tags.split(',').map(t => t.trim()).filter(t => t);
    }

    let fileUploaded = false;
    if (req.file) {
      // Save new image file
      const { imageUrl, thumbnailUrl } = await saveImageFile(req.file);
      design.imageUrl = imageUrl;
      design.thumbnailUrl = thumbnailUrl;
      design.aiStatus = 'Processing';
      fileUploaded = true;
    }

    const updatedDesign = await design.save();

    // Trigger AI embedding if image replaced
    if (fileUploaded && req.file) {
      processEmbeddingInBackground(updatedDesign._id, req.file.buffer, req.file.mimetype);
    }

    res.json({
      message: 'Design updated successfully.',
      data: updatedDesign
    });
  } catch (error) {
    console.error('updateDesign error:', error.message);
    res.status(500).json({ message: 'Error updating design.' });
  }
};

// POST /api/designs/:id/regenerate - Admin Protected (Retry AI)
const regenerateAI = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ message: 'Design not found.' });
    }

    // Mark status as processing
    design.aiStatus = 'Processing';
    await design.save();

    // If local file, read from disk. If web url (Cloudinary), download it
    let imageBuffer;
    let mimeType = 'image/png'; // fallback

    if (design.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', design.imageUrl);
      if (!fs.existsSync(filePath)) {
        design.aiStatus = 'Failed';
        await design.save();
        return res.status(400).json({ message: 'Local image file not found on disk. Re-upload the image.' });
      }
      imageBuffer = fs.readFileSync(filePath);
      mimeType = path.extname(design.imageUrl) === '.png' ? 'image/png' : 'image/jpeg';
    } else {
      // Download from Cloudinary
      try {
        const response = await axios.get(design.imageUrl, { responseType: 'arraybuffer' });
        imageBuffer = Buffer.from(response.data);
        mimeType = response.headers['content-type'] || 'image/jpeg';
      } catch (err) {
        design.aiStatus = 'Failed';
        await design.save();
        return res.status(400).json({ message: 'Failed to download image from remote URL.' });
      }
    }

    // Process in background
    processEmbeddingInBackground(design._id, imageBuffer, mimeType);

    res.json({
      message: 'Re-indexing process started in background.',
      data: design
    });
  } catch (error) {
    console.error('Regenerate AI error:', error.message);
    res.status(500).json({ message: 'Failed to trigger AI embedding generation.' });
  }
};

// DELETE /api/designs/:id - Admin Protected
const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findByIdAndDelete(req.params.id);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }

    // Delete local image if applicable
    if (design.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', design.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Design deleted successfully.' });
  } catch (error) {
    console.error('deleteDesign error:', error.message);
    res.status(500).json({ message: 'Error deleting design' });
  }
};

// POST /api/search/image - AI Similarity Search (Public)
const searchImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No search image provided.' });
    }

    const { category } = req.body; // optional category filter

    // 1. Generate embedding for uploaded image
    const { embedding } = await embeddingService.generateImageEmbedding(req.file.buffer, req.file.mimetype);

    // 2. Fetch all ready & active designs
    let query = { active: true, aiStatus: 'Ready' };
    if (category && category !== 'All') {
      query.category = category;
    }

    const candidates = await Design.find(query);

    // 3. Compute similarity scores
    const results = candidates.map(design => {
      const score = embeddingService.calculateCosineSimilarity(embedding, design.embedding);
      return {
        _id: design._id,
        name: design.name,
        code: design.code,
        category: design.category,
        description: design.description,
        imageUrl: design.imageUrl,
        thumbnailUrl: design.thumbnailUrl,
        price: design.price,
        tags: design.tags,
        similarity: parseFloat((score * 100).toFixed(1)) // similarity percentage (e.g. 84.5)
      };
    });

    // 4. Sort by highest similarity
    results.sort((a, b) => b.similarity - a.similarity);

    // 5. Categorize results honestly
    // Thresholds:
    // - Strong Match (Exact/Near Match): Similarity >= 88.0%
    // - Similar Match (Similar Designs): Similarity >= 72.0%
    const maxSimilarity = results.length > 0 ? results[0].similarity : 0;
    
    let exactMatch = null;
    let similarDesigns = [];
    let recommendedDesigns = [];
    let noMatch = false;

    if (maxSimilarity >= 72.0) {
      if (results[0].similarity >= 88.0) {
        exactMatch = results[0];
        similarDesigns = results.slice(1).filter(r => r.similarity >= 72.0);
      } else {
        // Highest match is only semi-similar
        similarDesigns = results.filter(r => r.similarity >= 72.0);
      }
    } else {
      // If highest similarity is below 72%, we declare honest no match found
      noMatch = true;
    }

    // Recommendation logic: Recommend active designs
    // Fetch a couple of newest/random designs as recommended fallbacks
    const recommendations = await Design.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('-embedding');

    recommendedDesigns = recommendations.filter(r => {
      // Exclude exact match if it exists
      if (exactMatch && exactMatch._id.toString() === r._id.toString()) return false;
      return true;
    });

    res.json({
      noMatch,
      exactMatch,
      similarDesigns,
      recommendedDesigns: recommendedDesigns.slice(0, 4)
    });
  } catch (error) {
    console.error('searchImage error:', error.message);
    res.status(500).json({ message: 'Error processing AI image search: ' + error.message });
  }
};

// POST /api/search/reindex - Rebuild all embeddings (Admin Protected)
const reindexAll = async (req, res) => {
  try {
    const designs = await Design.find();
    console.log(`Starting bulk embedding regeneration for ${designs.length} designs...`);
    
    let successCount = 0;
    let failCount = 0;

    for (const design of designs) {
      try {
        let imageBuffer;
        let mimeType = 'image/png';

        if (design.imageUrl.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, '..', design.imageUrl);
          if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
          }
          imageBuffer = fs.readFileSync(filePath);
          mimeType = path.extname(design.imageUrl) === '.png' ? 'image/png' : 'image/jpeg';
        } else {
          // Cloudinary URL download
          const response = await axios.get(design.imageUrl, { responseType: 'arraybuffer' });
          imageBuffer = Buffer.from(response.data);
          mimeType = response.headers['content-type'] || 'image/jpeg';
        }

        const { embedding } = await embeddingService.generateImageEmbedding(imageBuffer, mimeType);
        
        design.embedding = embedding;
        design.aiStatus = 'Ready';
        await design.save();
        successCount++;
      } catch (err) {
        console.error(`Failed to re-index design code ${design.code}:`, err.message);
        design.aiStatus = 'Failed';
        await design.save();
        failCount++;
      }
    }

    res.json({
      message: `Re-indexing complete.`,
      success: successCount,
      failed: failCount
    });
  } catch (error) {
    console.error('reindexAll error:', error.message);
    res.status(500).json({ message: 'Error rebuilding design embeddings: ' + error.message });
  }
};

module.exports = {
  getDesigns,
  getDesignsAdmin,
  getDesignById,
  createDesign,
  updateDesign,
  regenerateAI,
  deleteDesign,
  searchImage,
  reindexAll
};
