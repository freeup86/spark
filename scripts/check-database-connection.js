#!/usr/bin/env node

/**
 * Database Connection Checker for External PostgreSQL
 * This script helps verify your database connection before deploying to Render
 */

let Client;
try {
  Client = require('pg').Client;
} catch (error) {
  console.log('❌ pg package not found!');
  console.log('Install it with: npm install pg');
  process.exit(1);
}

async function checkDatabaseConnection() {
  console.log('🔍 Checking External Database Connection...\n');

  // Get database URL from command line argument or environment
  const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('❌ No database URL provided!');
    console.log('\nUsage:');
    console.log('  node scripts/check-database-connection.js "postgresql://user:pass@host:port/db"');
    console.log('  or set DATABASE_URL environment variable');
    process.exit(1);
  }

  console.log('🔗 Testing connection to:', databaseUrl.replace(/:[^:@]*@/, ':****@'));

  // Parse URL to check SSL mode
  const hasSSL = databaseUrl.includes('sslmode=require') || databaseUrl.includes('sslmode=prefer');
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: hasSSL ? { 
      rejectUnauthorized: false
    } : false
  });

  try {
    // Test connection
    console.log('⏳ Connecting to database...');
    await client.connect();
    console.log('✅ Database connection successful!');

    // Test basic query
    console.log('⏳ Testing basic query...');
    const result = await client.query('SELECT version()');
    console.log('✅ Query successful!');
    console.log('📊 PostgreSQL Version:', result.rows[0].version.split(' ')[1]);

    // Check if Spark tables exist
    console.log('⏳ Checking for existing Spark tables...');
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'Idea', 'Comment', 'Collaboration', 'Notification')
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Found existing Spark tables:');
      tableCheck.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('ℹ️  No Spark tables found (this is normal for first deployment)');
    }

    // Check database permissions
    console.log('⏳ Checking database permissions...');
    try {
      await client.query('CREATE TABLE _temp_test (id INTEGER)');
      await client.query('DROP TABLE _temp_test');
      console.log('✅ Database has CREATE/DROP permissions');
    } catch (permError) {
      console.log('⚠️  Limited database permissions:', permError.message);
    }

  } catch (error) {
    console.log('❌ Database connection failed!');
    console.log('Error:', error.message);
    
    // Provide helpful suggestions
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Check if the database URL is correct');
    console.log('2. Verify the database server is running');
    console.log('3. Ensure your IP is whitelisted (if required)');
    console.log('4. Check if SSL is required (add ?sslmode=require to URL)');
    console.log('5. Verify username and password are correct');
    
    if (error.code === 'ENOTFOUND') {
      console.log('6. DNS resolution failed - check the hostname');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('6. Connection refused - check port and firewall settings');
    } else if (error.code === '28P01') {
      console.log('6. Authentication failed - check username and password');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log('\n🎉 Database connection check completed successfully!');
  console.log('💡 Your database is ready for Render deployment.');
}

// Run the check
checkDatabaseConnection().catch(console.error);