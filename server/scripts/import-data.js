const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Use Atlas connection from environment
const ATLAS_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!ATLAS_URI) {
  console.error('❌ MONGODB_URI or DATABASE_URL not found in .env file');
  process.exit(1);
}

async function importData() {
  try {
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;
    const exportDir = path.join(__dirname, '..', 'data-export');

    if (!fs.existsSync(exportDir)) {
      console.error('❌ No data-export folder found. Run export-data.js first!');
      process.exit(1);
    }

    const files = fs.readdirSync(exportDir).filter(f => f.endsWith('.json'));
    console.log(`\n📦 Importing ${files.length} collections...\n`);

    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const filePath = path.join(exportDir, file);
      const documents = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (documents.length === 0) {
        console.log(`⊘ ${collectionName}: empty, skipped`);
        continue;
      }

      const collection = db.collection(collectionName);
      
      // Clear existing data
      await collection.deleteMany({});
      
      // Convert string _id and other ObjectId fields to proper ObjectIds
      const { ObjectId } = require('mongodb');
      const processedDocs = documents.map(doc => {
        const processed = { ...doc };
        
        // Convert _id if it's a string
        if (processed._id && typeof processed._id === 'string') {
          processed._id = new ObjectId(processed._id);
        }
        
        // Convert other common ObjectId fields
        const objectIdFields = ['restaurantId', 'userId', 'menuItemId', 'tableId', 'orderId', 'ownerId'];
        objectIdFields.forEach(field => {
          if (processed[field] && typeof processed[field] === 'string') {
            try {
              processed[field] = new ObjectId(processed[field]);
            } catch (e) {
              // Keep as string if it's not a valid ObjectId
            }
          }
        });
        
        return processed;
      });
      
      // Insert new data
      await collection.insertMany(processedDocs);
      
      console.log(`✓ ${collectionName}: ${documents.length} documents imported`);
    }

    console.log('\n✅ Import complete!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importData();
