#!/usr/bin/env node

/**
 * Pre-Deployment Check Script for Render.com
 * Verifies everything is ready before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Render.com Pre-Deployment Check\n');

const checks = [];

// Check 1: GitHub repository
console.log('📋 Checking repository status...');
try {
  if (fs.existsSync('.git')) {
    checks.push({ name: 'Git repository', status: '✅', message: 'Repository initialized' });
  } else {
    checks.push({ name: 'Git repository', status: '❌', message: 'Not a git repository' });
  }
} catch (error) {
  checks.push({ name: 'Git repository', status: '❌', message: 'Error checking git status' });
}

// Check 2: Required files
console.log('📁 Checking required files...');
const requiredFiles = [
  'backend/package.json',
  'frontend/package.json',
  'backend/src/main.ts',
  'frontend/next.config.ts',
  'backend/prisma/schema.prisma'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checks.push({ name: `File: ${file}`, status: '✅', message: 'Found' });
  } else {
    checks.push({ name: `File: ${file}`, status: '❌', message: 'Missing' });
  }
});

// Check 3: Package.json scripts
console.log('📦 Checking package.json scripts...');
try {
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  
  if (backendPkg.scripts && backendPkg.scripts.build) {
    checks.push({ name: 'Backend build script', status: '✅', message: 'Found' });
  } else {
    checks.push({ name: 'Backend build script', status: '❌', message: 'Missing build script' });
  }
  
  if (frontendPkg.scripts && frontendPkg.scripts.build) {
    checks.push({ name: 'Frontend build script', status: '✅', message: 'Found' });
  } else {
    checks.push({ name: 'Frontend build script', status: '❌', message: 'Missing build script' });
  }
} catch (error) {
  checks.push({ name: 'Package.json check', status: '❌', message: 'Error reading package.json files' });
}

// Check 4: Environment variables example
console.log('🔧 Checking environment configuration...');
if (fs.existsSync('scripts/generate-env-vars.js')) {
  checks.push({ name: 'Environment generator', status: '✅', message: 'Ready to generate env vars' });
} else {
  checks.push({ name: 'Environment generator', status: '❌', message: 'Missing env generator script' });
}

// Check 5: Database connection checker
if (fs.existsSync('scripts/check-database-connection.js')) {
  checks.push({ name: 'Database checker', status: '✅', message: 'Ready to test database' });
} else {
  checks.push({ name: 'Database checker', status: '❌', message: 'Missing database checker' });
}

// Display results
console.log('\n📊 Pre-Deployment Check Results:');
console.log('================================');
checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.message}`);
});

// Count results
const passed = checks.filter(c => c.status === '✅').length;
const failed = checks.filter(c => c.status === '❌').length;

console.log(`\n📈 Summary: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n🎉 All checks passed! You\'re ready to deploy to Render.com');
  console.log('\nNext steps:');
  console.log('1. Run: node scripts/generate-env-vars.js');
  console.log('2. Test database: node scripts/check-database-connection.js "your-db-url"');
  console.log('3. Follow: STEP_BY_STEP_RENDER_DEPLOY.md');
} else {
  console.log('\n⚠️  Some checks failed. Please fix the issues above before deploying.');
  console.log('\nCommon fixes:');
  console.log('- Ensure you\'re in the project root directory');
  console.log('- Check that all files are committed to git');
  console.log('- Verify package.json files have build scripts');
}

console.log('\n📚 Documentation:');
console.log('- Step-by-step guide: STEP_BY_STEP_RENDER_DEPLOY.md');
console.log('- Quick checklist: DEPLOYMENT_CHECKLIST.md');
console.log('- Full guide: RENDER_DEPLOYMENT.md');