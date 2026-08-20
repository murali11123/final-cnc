const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/3d-cnc';
    console.log(`Connecting to MongoDB at: ${dbUri}...`);
    
    // Attempt a connection with a fast timeout (3 seconds) to fail quickly if MongoDB is not running locally
    const options = {
      serverSelectionTimeoutMS: 3000
    };
    
    const conn = await mongoose.connect(dbUri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n[WARNING] Local MongoDB connection failed: ${error.message}`);
    console.warn(`Attempting to launch in-memory MongoDB server as fallback...\n`);
    
    try {
      // Require dynamically since this is a dev/local fallback
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      
      console.log(`In-Memory MongoDB Server running at: ${inMemoryUri}`);
      process.env.MONGODB_URI = inMemoryUri; // update environment variable
      
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`Failed to launch in-memory MongoDB fallback: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
