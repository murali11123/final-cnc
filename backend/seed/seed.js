require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const Design = require("../models/Design");
const embeddingService = require("../services/embeddingService");

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
} else {
  console.warn(
    "⚠️  Cloudinary env vars not found — seeded images will be saved locally to /uploads (not recommended for deployment).",
  );
}

const uploadsDir = path.join(__dirname, "..", "uploads");
const sourceDir = path.join(__dirname, "..", "source-images");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Folder name (inside source-images/) -> category value stored in MongoDB + short code prefix
const CATEGORY_MAP = {
  "2D Wall Panels": { category: "2D Wall Panels", prefix: "WP" },
  "Temple Designs": { category: "Temple Designs", prefix: "TD" },
  "Custom CNC": { category: "Custom CNC", prefix: "CC" },
  "Wooden Crafts": { category: "Wooden Crafts", prefix: "WC" },
};

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const mimeTypeForExt = (ext) => {
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
};

/**
 * Uploads a local image file to Cloudinary (if configured), or copies it into /uploads
 * as a fallback for local-only development. Returns { imageUrl, thumbnailUrl }.
 */
const uploadSeedImage = async (sourceFilePath, newFilename) => {
  if (isCloudinaryConfigured) {
    const result = await cloudinary.uploader.upload(sourceFilePath, {
      folder: "3d-cnc",
      public_id: path.parse(newFilename).name,
    });
    return {
      imageUrl: result.secure_url,
      thumbnailUrl:
        result.eager && result.eager[0]
          ? result.eager[0].secure_url
          : result.secure_url,
    };
  } else {
    const destPath = path.join(uploadsDir, newFilename);
    fs.copyFileSync(sourceFilePath, destPath);
    const relativePath = `/uploads/${newFilename}`;
    return { imageUrl: relativePath, thumbnailUrl: relativePath };
  }
};

/**
 * Imports every image found in source-images/<folderName>/ as a Design,
 * generating a real CLIP embedding for each one.
 */
const seedDatabase = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log("Connecting to MongoDB for seeding...");
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/3d-cnc",
      );
      console.log("✅ Connected.\n");
    }

    console.log(
      "Preloading CLIP model (this can take a minute on first run)...",
    );
    await embeddingService.getPipeline();
    console.log("CLIP model ready.\n");

    let totalImported = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (const folderName of Object.keys(CATEGORY_MAP)) {
      const { category, prefix } = CATEGORY_MAP[folderName];
      const folderPath = path.join(sourceDir, folderName);

      if (!fs.existsSync(folderPath)) {
        console.warn(
          `⚠️  Folder not found, skipping: source-images/${folderName}`,
        );
        continue;
      }

      const files = fs
        .readdirSync(folderPath)
        .filter((f) =>
          ALLOWED_EXTENSIONS.includes(path.extname(f).toLowerCase()),
        );

      console.log(`\n--- ${category}: ${files.length} image(s) found ---`);

      // Continue numbering from where we left off, in case this script is re-run
      const existingCount = await Design.countDocuments({ category });
      let counter = existingCount + 1;

      for (const filename of files) {
        const ext = path.extname(filename).toLowerCase();
        const mimeType = mimeTypeForExt(ext);
        const sourceFilePath = path.join(folderPath, filename);

        // Skip if a design already references this exact original filename (avoids re-importing on re-run)
        const alreadyImported = await Design.findOne({
          tags: `source:${filename}`,
        });
        if (alreadyImported) {
          totalSkipped++;
          continue;
        }

        try {
          const fileBuffer = fs.readFileSync(sourceFilePath);
          const newFilename = `${prefix.toLowerCase()}-${Date.now()}-${counter}${ext}`;
          const code = `${prefix}${String(counter).padStart(4, "0")}`;

          console.log(`[${code}] Uploading ${filename}...`);
          const { imageUrl, thumbnailUrl } = await uploadSeedImage(
            sourceFilePath,
            newFilename,
          );

          console.log(`[${code}] Generating embedding for ${filename}...`);
          const { embedding } = await embeddingService.generateImageEmbedding(
            fileBuffer,
            mimeType,
          );

          await Design.create({
            name: `${category} - ${code}`,
            code,
            category,
            imageUrl,
            thumbnailUrl,
            tags: [`source:${filename}`],
            embedding,
            embeddingModel: "Xenova/clip-vit-base-patch32",
            embeddingVersion: "1.0",
            active: true,
            aiStatus: "Ready",
          });

          totalImported++;
          counter++;
        } catch (err) {
          console.error(`❌ Failed to import ${filename}:`, err.message);
          totalFailed++;
        }
      }
    }

    console.log("\n================================================");
    console.log("SEEDING COMPLETE");
    console.log(`  Imported: ${totalImported}`);
    console.log(`  Skipped (already imported): ${totalSkipped}`);
    console.log(`  Failed: ${totalFailed}`);
    console.log("================================================\n");

    if (shouldExit) process.exit(0);
  } catch (error) {
    console.error("Error during database seed operation:", error);
    if (shouldExit) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase };
