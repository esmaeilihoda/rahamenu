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

    // Check users
    const users = await db.collection('users').find({}).toArray();
    console.log('=== USERS ===');
    users.forEach(u => {
      console.log(`  Email: ${u.email}`);
      console.log(`  Role: ${u.role}`);
      console.log(`  RestaurantId: ${u.restaurantId}\n`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();
