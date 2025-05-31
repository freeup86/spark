#!/usr/bin/env node

/**
 * Aiven PostgreSQL SSL Connection Tester
 * Specifically designed for Aiven's SSL certificate handling
 */

const { Client } = require('pg');

async function testAivenSSLConnection() {
  console.log('🔍 Testing Aiven PostgreSQL SSL Connection...\n');

  const baseUrl = process.env.DATABASE_URL_BASE || "postgres://user:password@host:port/database";
  
  const testConfigs = [
    {
      name: "Method 1: Aiven recommended SSL config",
      config: {
        connectionString: `${baseUrl}?sslmode=require`,
        ssl: {
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined,
          secureProtocol: 'TLSv1_2_method',
          ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384'
        }
      }
    },
    {
      name: "Method 2: Node.js TLS bypass",
      config: {
        connectionString: `${baseUrl}?sslmode=require`,
        ssl: {
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined,
          requestCert: false,
          agent: false
        }
      },
      env: { NODE_TLS_REJECT_UNAUTHORIZED: '0' }
    },
    {
      name: "Method 3: Connection string with SSL params",
      config: {
        connectionString: `${baseUrl}?sslmode=require&sslcert=&sslkey=&sslrootcert=`
      }
    },
    {
      name: "Method 4: SSL prefer mode",
      config: {
        connectionString: `${baseUrl}?sslmode=prefer`,
        ssl: false
      }
    },
    {
      name: "Method 5: Prisma-style SSL config",
      config: {
        connectionString: `${baseUrl}?sslmode=require&schema=public`,
        ssl: {
          rejectUnauthorized: false
        }
      }
    }
  ];

  for (const test of testConfigs) {
    console.log(`🧪 ${test.name}`);
    
    // Set environment variables if needed
    if (test.env) {
      Object.assign(process.env, test.env);
    }
    
    const client = new Client(test.config);

    try {
      console.log('⏳ Connecting...');
      await client.connect();
      console.log('✅ CONNECTION SUCCESSFUL!');
      
      // Test basic query
      const result = await client.query('SELECT version()');
      console.log('✅ Query successful!');
      console.log(`📊 PostgreSQL: ${result.rows[0].version.split(' ')[1]}`);
      
      // Test table creation permissions
      try {
        await client.query('CREATE TABLE IF NOT EXISTS _connection_test (id SERIAL PRIMARY KEY, test_data TEXT)');
        await client.query('INSERT INTO _connection_test (test_data) VALUES ($1)', ['test']);
        const testResult = await client.query('SELECT COUNT(*) FROM _connection_test');
        await client.query('DROP TABLE _connection_test');
        console.log('✅ Database permissions verified!');
      } catch (permError) {
        console.log('⚠️  Limited permissions (this is okay):', permError.message);
      }
      
      await client.end();
      
      console.log(`\n🎉 SUCCESS! Working configuration found:`);
      console.log(`Connection string: ${test.config.connectionString}`);
      if (test.config.ssl) {
        console.log(`SSL config: ${JSON.stringify(test.config.ssl, null, 2)}`);
      }
      if (test.env) {
        console.log(`Environment variables: ${JSON.stringify(test.env, null, 2)}`);
      }
      
      console.log(`\n📋 For Render deployment, use:`);
      console.log(`DATABASE_URL=${test.config.connectionString}`);
      
      return;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      
      // Detailed error analysis
      if (error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
        console.log('   → Self-signed certificate detected');
      } else if (error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
        console.log('   → Self-signed certificate in chain');
      } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        console.log('   → Unable to verify certificate signature');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('   → Connection refused - check IP whitelist');
      } else if (error.code === '28P01') {
        console.log('   → Authentication failed - check credentials');
      }
      
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    // Reset environment variables
    if (test.env) {
      Object.keys(test.env).forEach(key => {
        delete process.env[key];
      });
    }
    
    console.log('');
  }

  console.log('❌ All connection methods failed!');
  console.log('\n🔧 Additional troubleshooting:');
  console.log('1. Verify Aiven service is running in the console');
  console.log('2. Check if IP allowlist includes "Open to all" or your current IP');
  console.log('3. Try connecting with psql client directly:');
  console.log(`   psql "${baseUrl}?sslmode=require"`);
  console.log('4. Contact Aiven support if the issue persists');
}

testAivenSSLConnection().catch(console.error);