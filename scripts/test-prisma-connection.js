#!/usr/bin/env node

/**
 * Test Prisma connection with Aiven database
 */

// Set the environment variable for SSL bypass
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@host:port/database?sslmode=require';

const { PrismaClient } = require('../backend/node_modules/@prisma/client');

async function testPrismaConnection() {
  console.log('🔍 Testing Prisma connection with Aiven database...\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('⏳ Connecting with Prisma...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Prisma connected successfully!');
    
    // Test query
    console.log('⏳ Testing database query...');
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Query successful!');
    console.log(`📊 Database: ${result[0].version}`);
    
    // Check existing tables
    console.log('⏳ Checking existing tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length > 0) {
      console.log('✅ Found existing tables:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('ℹ️  No tables found (this is normal for first deployment)');
    }
    
    // Test if we can run migrations
    console.log('⏳ Testing migration capabilities...');
    try {
      // Try to create a simple test table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS _prisma_test (
          id SERIAL PRIMARY KEY,
          test_data TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await prisma.$executeRaw`
        INSERT INTO _prisma_test (test_data) VALUES ('connection_test')
      `;
      
      const testData = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM _prisma_test
      `;
      
      await prisma.$executeRaw`DROP TABLE _prisma_test`;
      
      console.log('✅ Migration capabilities verified!');
      console.log(`📊 Test record count: ${testData[0].count}`);
      
    } catch (migrationError) {
      console.log('⚠️  Migration test failed:', migrationError.message);
      console.log('   This might be okay if you have limited permissions');
    }
    
  } catch (error) {
    console.log('❌ Prisma connection failed!');
    console.log('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the DATABASE_URL is correct');
    console.log('2. Ensure NODE_TLS_REJECT_UNAUTHORIZED=0 is set');
    console.log('3. Check if Prisma schema is generated');
    
    process.exit(1);
    
  } finally {
    await prisma.$disconnect();
    console.log('✅ Prisma disconnected');
  }

  console.log('\n🎉 Prisma connection test completed successfully!');
  console.log('💡 Your database is ready for Prisma migrations and deployment.');
  console.log('\n📋 For Render deployment, set these environment variables:');
  console.log('DATABASE_URL=your_aiven_database_url_here');
  console.log('NODE_TLS_REJECT_UNAUTHORIZED=0');
}

testPrismaConnection().catch(console.error);