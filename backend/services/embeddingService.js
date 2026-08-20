const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;
const jpeg = require('jpeg-js');

// Module-level cache for model and processor
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

  // Load the preprocessor
  processorCache = await AutoProcessor.from_pretrained('Xenova/clip-vit-base-patch32');

  // Load only the vision model projection part
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
    const raw = jpeg.decode(buffer, { useTimp: true });
    width = raw.width;
    height = raw.height;
    data = raw.data; // RGBA buffer
  } else {
    // Attempt decoding as JPEG first, then PNG as fallback
    try {
      const raw = jpeg.decode(buffer, { useTimp: true });
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
 * Automatically saves the actual dimensions returned by the model.
 * 
 * @param {Buffer} fileBuffer - File binary data
 * @param {string} mimeType - File mime-type
 * @returns {Promise<{embedding: number[], dimensions: number}>}
 */
async function generateImageEmbedding(fileBuffer, mimeType) {
  const { processor, model } = await getPipeline();
  const { RawImage } = require('@xenova/transformers');
  
  // 1. Decode image to raw RGB bytes
  const { rgbData, width, height } = decodeImage(fileBuffer, mimeType);
  const rawImage = new RawImage(rgbData, width, height, 3);
  
  // 2. Run raw image through CLIP vision preprocessor
  console.log(`Processing image coordinates (${width}x${height}) for CLIP...`);
  const imageInputs = await processor(rawImage);
  
  // 3. Extract embedding vector using CLIP Vision model features
  console.log(`Extracting vision embeddings...`);
  const output = await model(imageInputs);
  
  // 4. Extract data array from tensor
  const embeddingArray = Array.from(output.image_embeds.data);
  const dimensions = embeddingArray.length;
  
  console.log(`Embedding generated successfully. Dimensions: ${dimensions}`);
  return {
    embedding: embeddingArray,
    dimensions
  };
}

/**
 * Calculates the cosine similarity score between two numeric vectors.
 */
function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }
  
  let dotProduct = 0.0;
  let fontA = 0.0;
  let fontB = 0.0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    fontA += vecA[i] * vecA[i];
    fontB += vecB[i] * vecB[i];
  }
  
  if (fontA === 0 || fontB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(fontA) * Math.sqrt(fontB));
}

module.exports = {
  getPipeline,
  generateImageEmbedding,
  calculateCosineSimilarity
};
