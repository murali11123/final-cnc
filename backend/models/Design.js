const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['2D Wall Panels', 'Temple Designs', 'Custom CNC', 'Wooden Crafts'],
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: null
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },
  embedding: {
    type: [Number],
    default: []
  },
  embeddingModel: {
    type: String,
    default: 'Xenova/clip-vit-base-patch32'
  },
  embeddingVersion: {
    type: String,
    default: '1.0'
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  aiStatus: {
    type: String,
    enum: ['Ready', 'Processing', 'Failed'],
    default: 'Processing',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Design', designSchema);
