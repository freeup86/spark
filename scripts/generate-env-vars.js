#!/usr/bin/env node

/**
 * Environment Variables Generator for Render.com
 * This script helps generate the required environment variables for deployment
 */

const crypto = require('crypto');

console.log('🔧 Generating Environment Variables for Render.com Deployment\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('📋 BACKEND SERVICE ENVIRONMENT VARIABLES:');
console.log('=========================================');
console.log('NODE_ENV=production');
console.log('DATABASE_URL=[REPLACE_WITH_YOUR_EXISTING_DATABASE_URL]');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('PORT=3000');
console.log('FRONTEND_URL=[REPLACE_WITH_YOUR_FRONTEND_URL]');
console.log('');

console.log('📋 FRONTEND SERVICE ENVIRONMENT VARIABLES:');
console.log('==========================================');
console.log('NODE_ENV=production');
console.log('NEXT_PUBLIC_API_URL=[REPLACE_WITH_YOUR_BACKEND_URL]');
console.log('PORT=3001');
console.log('');

console.log('📝 INSTRUCTIONS:');
console.log('================');
console.log('1. Copy the environment variables above');
console.log('2. In Render dashboard, go to your service settings');
console.log('3. Add each environment variable in the "Environment" section');
console.log('4. Replace the placeholder values with your actual URLs');
console.log('5. Use your existing PostgreSQL database URL');
console.log('');

console.log('🔗 EXAMPLE URLS:');
console.log('================');
console.log('Backend URL: https://spark-backend.onrender.com');
console.log('Frontend URL: https://spark-frontend.onrender.com');
console.log('');

console.log('🗄️  EXTERNAL DATABASE SETUP:');
console.log('=============================');
console.log('Your DATABASE_URL should be in this format:');
console.log('postgresql://username:password@host:port/database?sslmode=require');
console.log('');
console.log('Examples:');
console.log('- Aiven: postgresql://user:pass@host:port/db?sslmode=require');
console.log('- Neon: postgresql://user:pass@host:port/db?sslmode=require');
console.log('- Supabase: postgresql://user:pass@host:port/db?sslmode=require');
console.log('- Railway: postgresql://user:pass@host:port/db?sslmode=require');
console.log('- Local: postgresql://user:pass@localhost:5432/db');
console.log('');

console.log('🔒 SECURITY CONSIDERATIONS:');
console.log('===========================');
console.log('1. Ensure your database accepts connections from Render IPs');
console.log('2. Use SSL connections (sslmode=require in the URL)');
console.log('3. Create a dedicated database user for the app');
console.log('4. Whitelist Render IP ranges or use 0.0.0.0/0 (less secure)');
console.log('');

console.log('✅ Environment variables generated successfully!');
console.log('💡 Keep your JWT secret secure and never commit it to version control.');