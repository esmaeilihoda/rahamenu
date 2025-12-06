const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const ATLAS_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Usage: node reset-password.js <email> <new-password>');
  console.error('Example: node reset-password.js raha@menu.cafe admin123');
  process.exit(1);
}

async function resetPassword() {
  try {
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to Atlas');

    const db = mongoose.connection.db;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const result = await db.collection('users').updateOne(
      { email: email },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Password updated for: ${email}`);
    console.log(`   New password: ${newPassword}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
