const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to local MongoDB
const LOCAL_URI = 'mongodb://localhost:27017/menubloom';

async function exportData() {
  try {
    await mongoose.connect(LOCAL_URI);
    console.log('✅ Connected to local MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const exportDir = path.join(__dirname, '..', 'data-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    console.log(`\n📦 Exporting ${collections.length} collections...\n`);

    for (const collInfo of collections) {
      const collectionName = collInfo.name;
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      
      const filePath = path.join(exportDir, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
      
      console.log(`✓ ${collectionName}: ${documents.length} documents`);
    }

    console.log(`\n✅ Export complete! Files saved to: ${exportDir}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportData();
