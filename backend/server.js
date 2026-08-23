require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const designRoutes = require('./routes/designRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (logs success/failure clearly - see config/db.js)
connectDB();

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many image searches. Please wait a few minutes before trying again.' }
});

app.use('/api', generalLimiter);
app.use('/api/designs/search/image', searchLimiter);

// Routes
app.use('/api/designs', designRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack || err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
