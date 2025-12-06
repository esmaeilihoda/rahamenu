const mongoose = require('mongoose');
require('dotenv').config();

const ATLAS_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function checkMenu() {
  try {
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to Atlas\n');

    const db = mongoose.connection.db;
    
    // Check menu items
    const items = await db.collection('menuitems').find({}).toArray();
    console.log(`=== MENU ITEMS (${items.length}) ===`);
    items.forEach(item => {
      console.log(`  Name: ${item.name}`);
      console.log(`  RestaurantId: ${item.restaurantId}\n`);
    });

    // Check tables
    const tables = await db.collection('tables').find({}).toArray();
    console.log(`=== TABLES (${tables.length}) ===`);
    tables.forEach(t => {
      console.log(`  Name: ${t.name}`);
      console.log(`  RestaurantId: ${t.restaurantId}\n`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMenu();
