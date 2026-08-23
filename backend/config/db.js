const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/3d-cnc';

  try {
    console.log(`\nConnecting to MongoDB...`);

    const options = {
      serverSelectionTimeoutMS: 8000 // fail reasonably fast if unreachable
    };

    const conn = await mongoose.connect(dbUri, options);

    console.log('================================================');
    console.log(`✅ MongoDB CONNECTED successfully`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log('================================================\n');

    return true;
  } catch (error) {
    console.error('================================================');
    console.error(`❌ MongoDB CONNECTION FAILED`);
    console.error(`   Reason: ${error.message}`);
    console.error('================================================\n');

    // Only fall back to an in-memory DB in local development.
    // In production, we want the server to fail loudly instead of silently
    // running on throwaway data.
    if ((process.env.NODE_ENV || 'development') === 'production') {
      process.exit(1);
    }

    console.warn('Attempting to launch a temporary in-memory MongoDB (development fallback only)...\n');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();

      await mongoose.connect(inMemoryUri);

      console.log('================================================');
      console.log(`✅ MongoDB CONNECTED (in-memory fallback)`);
      console.log(`   NOTE: this data will NOT persist. Fix MONGODB_URI in .env`);
      console.log('================================================\n');

      return true;
    } catch (fallbackError) {
      console.error(`Failed to launch in-memory MongoDB fallback: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
