#!/usr/bin/env node

/**
 * Generate secure secrets for Menu Bloom environment variables
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a secure random string
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// Generate a UUID v4
function generateUUID() {
  return crypto.randomUUID();
}

console.log('🔐 Generating secure secrets for Menu Bloom...\n');

const secrets = {
  JWT_SECRET: generateSecret(64),
  JWT_REFRESH_SECRET: generateSecret(64),
  SESSION_SECRET: generateSecret(64),
  ZARRINPAL_MERCHANT_ID: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Placeholder - get from https://sandbox.zarinpal.com
};

console.log('Generated Secrets:');
console.log('==================\n');

Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('\n📋 Instructions:');
console.log('1. Copy the above values to your server/.env file');
console.log('2. Replace ZARRINPAL_MERCHANT_ID with your actual sandbox merchant ID');
console.log('3. Get sandbox merchant ID from: https://sandbox.zarinpal.com\n');

// Optionally write to a file
const envPath = path.join(__dirname, '..', '.env.secrets');
const envContent = Object.entries(secrets)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(envPath, envContent);
console.log(`✅ Secrets saved to: ${envPath}`);
console.log('⚠️  This file is in .gitignore - safe to commit .gitignore changes\n');
