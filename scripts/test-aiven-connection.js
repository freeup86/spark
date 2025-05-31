#!/usr/bin/env node

/**
 * Aiven Database Connection Tester
 * Tests different connection methods for Aiven
 */

let Client;
try {
  Client = require('pg').Client;
} catch (error) {
  console.log('❌ pg package not found!');
  console.log('Install it with: npm install pg');
  process.exit(1);
}

async function testAivenConnection() {
  const baseUrl = process.env.DATABASE_URL_BASE || "postgres://user:password@host:port/database";
  
  console.log('🔍 Testing Aiven Database Connection Methods...\n');

  const testMethods = [
    {
      name: "Method 1: SSL disabled (testing IP whitelist)",
      url: `${baseUrl}?sslmode=disable`,
      ssl: false
    },
    {
      name: "Method 2: SSL with rejectUnauthorized=false",
      url: `${baseUrl}?sslmode=require`,
      ssl: { 
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined
      }
    },
    {
      name: "Method 3: SSL prefer mode",
      url: `${baseUrl}?sslmode=prefer`,
      ssl: { 
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined
      }
    },
    {
      name: "Method 4: Force SSL bypass",
      url: `${baseUrl}?sslmode=require`,
      ssl: { 
        rejectUnauthorized: false,
        requestCert: false,
        agent: false,
        checkServerIdentity: () => undefined
      }
    }
  ];

  for (const method of testMethods) {
    console.log(`🧪 ${method.name}`);
    console.log(`🔗 URL: ${method.url.replace(/:[^:@]*@/, ':****@')}`);
    
    const client = new Client({
      connectionString: method.url,
      ssl: method.ssl
    });

    try {
      console.log('⏳ Connecting...');
      await client.connect();
      console.log('✅ CONNECTION SUCCESSFUL!');
      
      // Test basic query
      const result = await client.query('SELECT version()');
      console.log('✅ Query successful!');
      console.log(`📊 PostgreSQL: ${result.rows[0].version.split(' ')[1]}\n`);
      
      await client.end();
      
      console.log(`🎉 SUCCESS! Use this configuration for Render:`);
      console.log(`DATABASE_URL=${method.url}`);
      console.log(`SSL config: ${JSON.stringify(method.ssl)}\n`);
      return;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  console.log('❌ All connection methods failed!');
  console.log('\n🔧 Next steps:');
  console.log('1. Check if your IP is whitelisted in Aiven console');
  console.log('2. Go to Aiven console → Your service → Overview → "Allowed IP addresses"');
  console.log('3. Add your current IP or use 0.0.0.0/0 for testing');
  console.log('4. For Render deployment, add the Render IP ranges');
  
  console.log('\n📍 Your current IP might be:');
  try {
    const https = require('https');
    https.get('https://api.ipify.org', (res) => {
      res.on('data', (data) => {
        console.log(`   ${data.toString()}`);
      });
    });
  } catch (e) {
    console.log('   Unable to detect IP automatically');
  }
}

testAivenConnection().catch(console.error);