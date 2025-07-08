 import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI (masked):', mongoUri.replace(/\/\/.*@/, '//***:***@'));

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // 30secs
      socketTimeoutMS: 45000, // 45secs
      maxPoolSize: 10,
      connectTimeoutMS: 30000,
    });

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`🗃️  Database: ${conn.connection.name}`);

    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 Mongoose disconnected from MongoDB');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🟢 Mongoose reconnected to MongoDB');
    });
 
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔴 Mongoose connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Please check:');
    console.error('1. MongoDB Atlas cluster is running');
    console.error('2. IP address is whitelisted (0.0.0.0/0)');
    console.error('3. Database user credentials are correct');
    console.error('4. Connection string is properly formatted');
    process.exit(1);
  }
};

export default connectDB;