require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PNG } = require('pngjs');

const Admin = require('../models/Admin');
const Design = require('../models/Design');
const embeddingService = require('../services/embeddingService');

// Make sure upload directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Generate beautiful, geometric patterns dynamically as PNGs
const generatePatternPNG = (type, index) => {
  const png = new PNG({ width: 224, height: 224 }); // standard CLIP input size
  const w = png.width;
  const h = png.height;
  const data = png.data;
  
  // Custom theme colors (soft slate background, royal blue / light blue patterns)
  const bgR = 245, bgG = 247, bgB = 250;
  const primaryR = 30, primaryG = 64, primaryB = 175; // Royal Blue
  const secondaryR = 59, secondaryG = 130, secondaryB = 246; // Accent Blue
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (w * y + x) << 2;
      
      // 1. Set background
      data[idx] = bgR;
      data[idx+1] = bgG;
      data[idx+2] = bgB;
      data[idx+3] = 255;
      
      // 2. Add an elegant border
      if (x < 8 || x > w - 8 || y < 8 || y > h - 8) {
        data[idx] = primaryR;
        data[idx+1] = primaryG;
        data[idx+2] = primaryB;
        continue;
      }
      
      // 3. Draw pattern based on category type and index
      let isPatternPixel = false;
      let drawPrimaryColor = true;

      if (type === 'WP') {
        if (index % 3 === 0) {
          isPatternPixel = (x % 24 < 3) || (y % 24 < 3);
          drawPrimaryColor = (x % 48 < 24);
        } else if (index % 3 === 1) {
          isPatternPixel = (y % 16 < 6);
          drawPrimaryColor = true;
        } else {
          isPatternPixel = (Math.abs((x + y) % 32) < 4) || (Math.abs((x - y) % 32) < 4);
          drawPrimaryColor = false;
        }
      } else if (type === 'TD') {
        const cx = w / 2;
        const cy = h / 2;
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.sqrt(dx * dx + dy * dy);

        if (index % 3 === 0) {
          isPatternPixel = (Math.round(r) % 24 < 3) && r < 90;
          drawPrimaryColor = true;
        } else if (index % 3 === 1) {
          const angle = Math.atan2(dy, dx);
          isPatternPixel = (Math.abs(Math.sin(angle * 6)) > 0.85) && r < 95;
          drawPrimaryColor = false;
        } else {
          isPatternPixel = (Math.abs(dx) < 6 && r < 80) || (Math.abs(dy) < 6 && r < 80) || (Math.abs(dx) > 30 && Math.abs(dx) < 35 && y > cy);
          drawPrimaryColor = true;
        }
      } else if (type === 'CC') {
        const wave = Math.sin(x / 12 + index) * 35 + h / 2;
        isPatternPixel = Math.abs(y - wave) < 5;
        drawPrimaryColor = (index % 2 === 0);

        if (index % 3 === 0) {
          const wave2 = Math.cos(x / 16) * 30 + h / 2;
          isPatternPixel = isPatternPixel || Math.abs(y - wave2) < 4;
        }
      } else if (type === 'WC') {
        if (index % 3 === 0) {
          const d = Math.min(x - 8, w - 8 - x, y - 8, h - 8 - y);
          isPatternPixel = (d % 20 < 4);
          drawPrimaryColor = (index % 2 === 0);
        } else if (index % 3 === 1) {
          const waveX = Math.sin(x / 10) * 5;
          isPatternPixel = (Math.round(y + waveX) % 30 < 6);
          drawPrimaryColor = false;
        } else {
          isPatternPixel = (Math.abs((x % 40) - (y % 40)) < 4) || (Math.abs(((w - x) % 40) - (y % 40)) < 4);
          drawPrimaryColor = true;
        }
      }

      if (isPatternPixel) {
        data[idx] = drawPrimaryColor ? primaryR : secondaryR;
        data[idx+1] = drawPrimaryColor ? primaryG : secondaryG;
        data[idx+2] = drawPrimaryColor ? primaryB : secondaryB;
      }
    }
  }

  return PNG.sync.write(png);
};

const categories = [
  { name: '2D Wall Panels', type: 'WP', prefix: 'WP', tags: ['wall', 'panel', 'interior', 'mdf', 'acrylic', 'geometric', 'grid', 'modern'] },
  { name: 'Temple Designs', type: 'TD', prefix: 'TD', tags: ['temple', 'mandir', 'pooja', 'traditional', 'sacred', 'arch', 'floral', 'wood'] },
  { name: 'Custom CNC', type: 'CC', prefix: 'CC', tags: ['custom', 'wave', 'carving', 'abstract', 'wall-art', 'modern', 'fluid', 'wood'] },
  { name: 'Wooden Crafts', type: 'WC', prefix: 'WC', tags: ['crafts', 'gift', 'wooden', 'box', 'frame', 'lattice', 'decor', 'classic'] }
];

const seedDatabase = async (shouldExit = true) => {
  try {
    // Connect if not already connected
    if (mongoose.connection.readyState === 0) {
      console.log('Connecting to MongoDB for seeding...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/3d-cnc');
      console.log('Connected.');
    }

    console.log('Clearing database collections...');
    await Admin.deleteMany({});
    await Design.deleteMany({});
    console.log('Collections cleared.');

    // Create Default Admin User
    const adminUsername = 'admin';
    const adminPassword = 'admin3Dcnc123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    
    await Admin.create({
      username: adminUsername,
      passwordHash
    });
    console.log('\n==================================================');
    console.log('ADMIN USER CREATED SUCCESSFULY:');
    console.log(`Username: ${adminUsername}`);
    console.log(`Password: ${adminPassword}`);
    console.log('==================================================\n');

    // Initialize CLIP Model
    console.log('Preloading CLIP model for database seeding embedding generation...');
    await embeddingService.getPipeline();

    // Generate 48 seed designs (12 per category)
    console.log('Generating seed designs and visual PNG placeholders...');

    for (const cat of categories) {
      console.log(`\nGenerating category: ${cat.name}`);
      for (let i = 1; i <= 12; i++) {
        const codeNum = i.toString().padStart(3, '0');
        const code = `${cat.prefix}${codeNum}`;
        const name = `${cat.name.slice(3) || cat.name} Design - Style ${i}`;
        const description = `Premium precision-crafted design for ${cat.name.toLowerCase()}. Ideal for wood carving, MDF partitions, and acrylic panel styling. Code: ${code}. You Imagine It, We Made It.`;
        
        // Generate dynamic PNG
        const pngBuffer = generatePatternPNG(cat.type, i);
        const filename = `${code.toLowerCase()}_placeholder.png`;
        const relativePath = `/uploads/${filename}`;
        const absolutePath = path.join(uploadsDir, filename);

        // Save PNG to uploads folder
        fs.writeFileSync(absolutePath, pngBuffer);

        // Generate embedding
        console.log(`[${code}] Extracting embedding for visual pattern...`);
        const { embedding } = await embeddingService.generateImageEmbedding(pngBuffer, 'image/png');

        // Compile tags
        const styleTags = [...cat.tags, `style-${i}`, code.toLowerCase(), `carving-${i}`];

        // Create Mongoose record
        await Design.create({
          name,
          code,
          category: cat.name,
          description,
          imageUrl: relativePath,
          thumbnailUrl: relativePath,
          price: 1500 + (i * 200),
          tags: styleTags,
          embedding: embedding,
          embeddingModel: 'Xenova/clip-vit-base-patch32',
          embeddingVersion: '1.0',
          active: true,
          aiStatus: 'Ready'
        });
      }
    }

    console.log('\nSeeding completed successfully!');
    console.log('48 designs successfully seeded with real CLIP image embeddings.');
    
    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during database seed operation:', error);
    if (shouldExit) {
      process.exit(1);
    }
    throw error;
  }
};

const checkAndSeedDatabase = async () => {
  try {
    const count = await Design.countDocuments();
    if (count === 0) {
      console.log('\nDatabase is empty. Triggering automatic database seeding...');
      await seedDatabase(false);
      console.log('Automatic database seeding finished.\n');
    } else {
      console.log(`\nDatabase has ${count} designs indexed. Skipping auto-seeding.\n`);
    }
  } catch (err) {
    console.error('Failed to execute check-and-seed operation:', err.message);
  }
};

// If run directly: node seed/seed.js
if (require.main === module) {
  seedDatabase(true);
}

module.exports = {
  seedDatabase,
  checkAndSeedDatabase
};
