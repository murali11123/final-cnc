const fs = require("fs");
const path = require("path");
const Design = require("../models/Design");
const embeddingService = require("../services/embeddingService");
const cloudinary = require("cloudinary").v2;

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads an image buffer to Cloudinary (if configured) or saves it locally.
 */
const saveImageFile = async (file) => {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "3d-cnc" },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            imageUrl: result.secure_url,
            thumbnailUrl:
              result.eager && result.eager[0]
                ? result.eager[0].secure_url
                : result.secure_url,
          });
        },
      );
      uploadStream.end(file.buffer);
    });
  } else {
    const ext = path.extname(file.originalname) || ".png";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const relativePath = `/uploads/${filename}`;
    const absolutePath = path.join(__dirname, "..", "uploads", filename);

    fs.writeFileSync(absolutePath, file.buffer);
    return {
      imageUrl: relativePath,
      thumbnailUrl: relativePath,
    };
  }
};

/**
 * Runs embedding generation in the background AFTER the response has
 * already been sent. Failures here only mark the design as 'Failed' -
 * they can never crash the request/response cycle or cause a 502.
 */
const generateEmbeddingInBackground = async (
  designId,
  fileBuffer,
  mimeType,
) => {
  try {
    const { embedding } = await embeddingService.withTimeout(
      embeddingService.generateImageEmbedding(fileBuffer, mimeType),
      25000,
      "Embedding generation timed out",
    );

    await Design.findByIdAndUpdate(designId, {
      embedding,
      aiStatus: "Ready",
    });
    console.log(`Embedding ready for design ${designId}`);
  } catch (embErr) {
    console.error(`Embedding failed for ${designId}:`, embErr.message);
    await Design.findByIdAndUpdate(designId, { aiStatus: "Failed" }).catch(
      (e) =>
        console.error(
          `Failed to mark design ${designId} as Failed:`,
          e.message,
        ),
    );
  }
};

// GET /api/designs - Public gallery (active only). Supports ?category=&search=&sort=
const getDesigns = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { active: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "name") sortOption = { name: 1 };
    else if (sort === "priceAsc") sortOption = { price: 1 };
    else if (sort === "priceDesc") sortOption = { price: -1 };

    const designs = await Design.find(query)
      .sort(sortOption)
      .select("-embedding");
    res.json(designs);
  } catch (error) {
    console.error("getDesigns error:", error.message);
    res.status(500).json({ message: "Error retrieving designs" });
  }
};

// GET /api/designs/:id
const getDesignById = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id).select("-embedding");
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }
    res.json(design);
  } catch (error) {
    console.error("getDesignById error:", error.message);
    res.status(500).json({ message: "Error retrieving design" });
  }
};

// POST /api/designs/search/image - AI similarity search (Public)
const searchImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No search image provided." });
    }

    const { category } = req.body; // optional category filter

    const { embedding } = await embeddingService.withTimeout(
      embeddingService.generateImageEmbedding(
        req.file.buffer,
        req.file.mimetype,
      ),
      25000,
      "Image search timed out. Please try a smaller image or try again.",
    );

    let query = { active: true, aiStatus: "Ready" };
    if (category && category !== "All") {
      query.category = category;
    }

    const candidates = await Design.find(query);

    const results = candidates.map((design) => {
      const score = embeddingService.calculateCosineSimilarity(
        embedding,
        design.embedding,
      );
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
        similarity: parseFloat((score * 100).toFixed(1)),
      };
    });

    results.sort((a, b) => b.similarity - a.similarity);

    const maxSimilarity = results.length > 0 ? results[0].similarity : 0;

    let exactMatch = null;
    let similarDesigns = [];
    let noMatch = false;

    if (maxSimilarity >= 72.0) {
      if (results[0].similarity >= 88.0) {
        exactMatch = results[0];
        similarDesigns = results.slice(1).filter((r) => r.similarity >= 72.0);
      } else {
        similarDesigns = results.filter((r) => r.similarity >= 72.0);
      }
    } else {
      noMatch = true;
    }

    const recommendations = await Design.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("-embedding");

    const recommendedDesigns = recommendations
      .filter(
        (r) => !(exactMatch && exactMatch._id.toString() === r._id.toString()),
      )
      .slice(0, 4);

    res.json({
      noMatch,
      exactMatch,
      similarDesigns,
      recommendedDesigns,
    });
  } catch (error) {
    console.error("searchImage error:", error.message);
    res
      .status(500)
      .json({ message: "Error processing AI image search: " + error.message });
  }
};

// POST /api/designs - Add a single new design manually
const createDesign = async (req, res) => {
  try {
    const { name, code, category, description, price, tags } = req.body;

    if (!name || !code || !category) {
      return res
        .status(400)
        .json({ message: "Name, Unique Code, and Category are required." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "An image upload is required." });
    }

    const codeExists = await Design.findOne({ code });
    if (codeExists) {
      return res
        .status(400)
        .json({
          message: `Design code '${code}' already exists. Choose a unique code.`,
        });
    }

    const { imageUrl, thumbnailUrl } = await saveImageFile(req.file);
    const tagsArray = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      : [];

    const newDesign = new Design({
      name,
      code: code.toUpperCase(),
      category,
      description: description || "",
      price: price ? parseFloat(price) : null,
      tags: tagsArray,
      imageUrl,
      thumbnailUrl,
      aiStatus: "Processing",
    });

    const savedDesign = await newDesign.save();

    // Respond to the client immediately - do NOT make them wait on the
    // heavy CLIP model inference. This is what was causing 502s: a slow or
    // memory-hungry embedding call was blocking the request/response cycle.
    res
      .status(201)
      .json({ message: "Design created successfully.", data: savedDesign });

    // Generate the embedding in the background, after the response is sent.
    // Any failure here only updates aiStatus - it can never crash the process
    // mid-request or produce a 502 for this or any other request.
    generateEmbeddingInBackground(
      savedDesign._id,
      req.file.buffer,
      req.file.mimetype,
    );
  } catch (error) {
    console.error("createDesign error:", error.message);
    res.status(500).json({ message: error.message || "Error creating design" });
  }
};

// DELETE /api/designs/:id
const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findByIdAndDelete(req.params.id);
    if (!design) {
      return res.status(404).json({ message: "Design not found" });
    }

    if (design.imageUrl.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "..", design.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: "Design deleted successfully." });
  } catch (error) {
    console.error("deleteDesign error:", error.message);
    res.status(500).json({ message: "Error deleting design" });
  }
};

module.exports = {
  getDesigns,
  getDesignById,
  searchImage,
  createDesign,
  deleteDesign,
};
