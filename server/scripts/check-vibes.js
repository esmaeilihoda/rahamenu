const mongoose = require('mongoose');
require('dotenv').config();

const ATLAS_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function checkData() {
  try {
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to Atlas\n');

    const db = mongoose.connection.db;
    
    // Check restaurants
    const restaurants = await db.collection('restaurants').find({}).toArray();
    console.log('=== RESTAURANTS ===');
    restaurants.forEach(r => {
      console.log(`  ID: ${r._id}`);
      console.log(`  Name: ${r.name}`);
      console.log(`  Slug: ${r.slug}\n`);
    });

    // Check vibes
    const vibes = await db.collection('vibes').find({}).toArray();
    console.log('=== VIBES ===');
    console.log(`Total vibes: ${vibes.length}`);
    vibes.forEach(v => {
      console.log(`  ID: ${v._id}`);
      console.log(`  RestaurantId: ${v.restaurantId}`);
      console.log(`  Key: ${v.key}`);
      console.log(`  Label: ${v.label}`);
      console.log(`  Emoji: ${v.emoji}`);
      console.log(`  Active: ${v.active}\n`);
    });

    // Check menu items
    const items = await db.collection('menuitems').find({}).limit(3).toArray();
    console.log('=== MENU ITEMS (first 3) ===');
    console.log(`Total menu items: ${await db.collection('menuitems').countDocuments()}`);
    items.forEach(item => {
      console.log(`  ID: ${item._id}`);
      console.log(`  RestaurantId: ${item.restaurantId}`);
      console.log(`  Name: ${item.name}`);
      console.log(`  Category: ${item.category}\n`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();
