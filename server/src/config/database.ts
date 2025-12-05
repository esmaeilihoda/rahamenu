import mongoose from 'mongoose';
import { env } from './env';

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

class DatabaseConnection {
  private retryCount = 0;

  async connect(): Promise<void> {
    try {
      await mongoose.connect(env.MONGODB_URI || 'mongodb://localhost:27017/menu-bloom');
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📦 Database: ${mongoose.connection.name}`);
      
      this.setupEventHandlers();
      this.retryCount = 0;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      await this.handleConnectionError();
    }
  }

  private async handleConnectionError(): Promise<void> {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      const delay = RETRY_INTERVAL * Math.pow(2, this.retryCount - 1); // Exponential backoff
      
      console.log(`⏳ Retrying connection in ${delay / 1000}s (Attempt ${this.retryCount}/${MAX_RETRIES})...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      await this.connect();
    } else {
      console.error('💥 Max retry attempts reached. Exiting...');
      process.exit(1);
    }
  }

  private setupEventHandlers(): void {
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to database');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed gracefully');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
    }
  }
}

const db = new DatabaseConnection();

export default db;
