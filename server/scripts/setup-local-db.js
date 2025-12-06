#!/usr/bin/env node

/**
 * Setup local MongoDB database with seed data
 * Usage: node scripts/setup-local-db.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import models
const { Restaurant } = require('../dist/models/Restaurant.model');
const { User } = require('../dist/models/User.model');
const { MenuItem } = require('../dist/models/MenuItem.model');
const { Table } = require('../dist/models/Table.model');

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
    if (!dbUrl) {
      console.error('❌ Missing DATABASE_URL (preferred) or MONGODB_URI in server/.env');
      console.error('   Example: DATABASE_URL=mongodb://localhost:27017/menubloom');
      process.exit(1);
    }
    await mongoose.connect(dbUrl);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Restaurant.deleteMany({}),
      User.deleteMany({}),
      MenuItem.deleteMany({}),
      Table.deleteMany({}),
    ]);
    console.log('✅ Data cleared\n');

    // Create owner user first (needed for restaurant creation)
    console.log('👤 Creating owner user...');
    // Note: User model has a pre-save hook that hashes the password, so pass plain text
    
    const tempOwner = await User.create({
      email: 'owner@democafe.local',
      password: 'password123',
      name: 'مالک دمو',
      role: 'manager',
      restaurantId: null, // Will be set after restaurant creation
    });
    console.log(`✅ Owner user created: ${tempOwner.email} (ID: ${tempOwner._id})\n`);

    // Create demo restaurant
    console.log('🏪 Creating demo restaurant...');
    const restaurant = await Restaurant.create({
      name: 'کافه دمو',
      slug: 'demo-cafe',
      address: {
        street: 'خیابان ولیعصر',
        city: 'تهران',
        country: 'Iran',
        postalCode: '1234567890',
      },
      contact: {
        phone: '+98 21 1234 5678',
        email: 'info@democafe.local',
      },
      settings: {
        currency: 'IRR',
        timezone: 'Asia/Tehran',
        language: 'fa',
        taxRate: 9,
      },
      subscription: {
        plan: 'premium',
        status: 'active',
      },
      branding: {
        primaryColor: '#8B5CF6',
        logo: '/logo.png',
      },
      ownerId: tempOwner._id,
      isActive: true,
    });
    console.log(`✅ Restaurant created: ${restaurant.name} (ID: ${restaurant._id})\n`);

    // Update owner with restaurantId
    tempOwner.restaurantId = restaurant._id;
    await tempOwner.save();

    // Create additional demo users
    console.log('👤 Creating additional demo users...');

    const users = await User.create([
      {
        email: 'raha@menu.dev',
        password: 'password123',
        name: 'مدیر دمو',
        role: 'manager',
        restaurantId: restaurant._id,
      },
      {
        email: 'kitchen@democafe.local',
        password: 'password123',
        name: 'آشپز دمو',
        role: 'kitchen',
        restaurantId: restaurant._id,
      },
      {
        email: 'admin@menubloom.local',
        password: 'password123',
        name: 'ادمین سیستم',
        role: 'admin',
        restaurantId: restaurant._id,
      },
    ]);
    console.log(`✅ Created ${users.length + 1} users (including owner)\n`);

    // Create menu items
    console.log('☕ Creating menu items...');
    const menuItems = await MenuItem.create([
      {
        restaurantId: restaurant._id,
        name: 'اسپرسو',
        description: 'قهوه تلخ ایتالیایی',
        price: 45000,
        category: 'coffee',
        vibes: ['energy'],
        image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400',
        available: true,
      },
      {
        restaurantId: restaurant._id,
        name: 'کاپوچینو',
        description: 'قهوه با شیر و فوم',
        price: 65000,
        category: 'coffee',
        vibes: ['energy', 'relaxing'],
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
        available: true,
      },
      {
        restaurantId: restaurant._id,
        name: 'لاته',
        description: 'قهوه با شیر زیاد',
        price: 70000,
        category: 'coffee',
        vibes: ['relaxing'],
        image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400',
        available: true,
      },
      {
        restaurantId: restaurant._id,
        name: 'آیس لاته',
        description: 'لاته سرد',
        price: 75000,
        category: 'cold',
        vibes: ['cold', 'energy'],
        image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
        available: true,
      },
      {
        restaurantId: restaurant._id,
        name: 'کروسان',
        description: 'شیرینی فرانسوی',
        price: 55000,
        category: 'pastry',
        vibes: ['hungry'],
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
        available: true,
      },
    ]);
    console.log(`✅ Created ${menuItems.length} menu items\n`);

    // Create tables
    console.log('🪑 Creating tables...');
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      tables.push({
        restaurantId: restaurant._id,
        tableNumber: i,
        status: 'empty',
        qrCode: `demo-cafe-table-${i}`,
      });
    }
    const createdTables = await Table.create(tables);
    console.log(`✅ Created ${createdTables.length} tables\n`);

    // Summary
    console.log('📊 Setup Summary:');
    console.log('==================');
    console.log(`Restaurant: ${restaurant.name} (${restaurant.slug})`);
    console.log(`Users: ${users.length}`);
    console.log('  - manager@democafe.local (password: password123)');
    console.log('  - kitchen@democafe.local (password: password123)');
    console.log('  - admin@menubloom.local (password: password123)');
    console.log(`Menu Items: ${menuItems.length}`);
    console.log(`Tables: ${createdTables.length}`);
    console.log('\n✅ Database setup complete!\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
