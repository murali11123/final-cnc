const PNG = require('pngjs').PNG;
const jpeg = require('jpeg-js');

// Module-level cache for model and processor (loaded once, reused for every request)
let processorCache = null;
let modelCache = null;

/**
 * Initializes and caches the Transformers.js processor and CLIPVisionModelWithProjection.
 */
async function getPipeline() {
  if (processorCache && modelCache) {
    return { processor: processorCache, model: modelCache };
  }

  console.log('Initializing CLIP vision model (Xenova/clip-vit-base-patch32) for the first time...');

  const transformers = require('@xenova/transformers');
  const AutoProcessor = transformers.AutoProcessor;
  const CLIPVisionModelWithProjection = transformers.CLIPVisionModelWithProjection;

  processorCache = await AutoProcessor.from_pretrained('Xenova/clip-vit-base-patch32');

  modelCache = await CLIPVisionModelWithProjection.from_pretrained('Xenova/clip-vit-base-patch32', {
    progress_callback: (info) => {
      if (info.status === 'progress') {
        console.log(`Loading CLIP Model: ${info.file} - ${Math.round(info.progress)}%`);
      }
    }
  });

  console.log('CLIP vision model and processor successfully loaded and cached in memory.');
  return { processor: processorCache, model: modelCache };
}

/**
 * Decodes PNG or JPEG image buffers into raw RGB data.
 */
function decodeImage(buffer, mimeType) {
  let width, height, data;

  if (mimeType === 'image/png') {
    const png = PNG.sync.read(buffer);
    width = png.width;
    height = png.height;
    data = png.data; // RGBA buffer
  } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    // FIX: the original code passed { useTimp: true }, which is not a real
    // jpeg-js option (typo for useTArray). useTArray: true makes jpeg-js
    // return a typed Uint8Array instead of a plain Array, which is faster.
    const raw = jpeg.decode(buffer, { useTArray: true });
    width = raw.width;
    height = raw.height;
    data = raw.data; // RGBA buffer
  } else {
    // Attempt decoding as JPEG first, then PNG as fallback
    try {
      const raw = jpeg.decode(buffer, { useTArray: true });
      width = raw.width;
      height = raw.height;
      data = raw.data;
    } catch (e) {
      try {
        const png = PNG.sync.read(buffer);
        width = png.width;
        height = png.height;
        data = png.data;
      } catch (err) {
        throw new Error('Unsupported image format. Please upload a valid PNG, JPG, or JPEG file.');
      }
    }
  }

  // Convert RGBA to RGB (3 channels) for model input compatibility
  const rgbData = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    rgbData[i * 3] = data[i * 4];       // R
    rgbData[i * 3 + 1] = data[i * 4 + 1]; // G
    rgbData[i * 3 + 2] = data[i * 4 + 2]; // B
  }

  return { rgbData, width, height };
}

/**
 * Generates an embedding vector for a given image file buffer.
 *
 * @param {Buffer} fileBuffer - File binary data
 * @param {string} mimeType - File mime-type
 * @returns {Promise<{embedding: number[], dimensions: number}>}
 */
async function generateImageEmbedding(fileBuffer, mimeType) {
  const { processor, model } = await getPipeline();
  const { RawImage } = require('@xenova/transformers');

  const { rgbData, width, height } = decodeImage(fileBuffer, mimeType);
  const rawImage = new RawImage(rgbData, width, height, 3);

  const imageInputs = await processor(rawImage);
  const output = await model(imageInputs);

  const embeddingArray = Array.from(output.image_embeds.data);
  const dimensions = embeddingArray.length;

  return {
    embedding: embeddingArray,
    dimensions
  };
}

/**
 * Calculates the cosine similarity score between two numeric vectors.
 * (Renamed fontA/fontB -> normA/normB for clarity; behavior unchanged.)
 */
function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  getPipeline,
  generateImageEmbedding,
  calculateCosineSimilarity
};
