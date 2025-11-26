#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks that Sequelize is not present and Mongoose is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment configuration...\n');

let errors = [];
let warnings = [];

// Check package.json
console.log('📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps.sequelize) {
    errors.push('❌ Sequelize found in package.json dependencies');
  } else {
    console.log('   ✅ No Sequelize in package.json');
  }
  
  if (deps.mysql2) {
    errors.push('❌ mysql2 found in package.json dependencies');
  } else {
    console.log('   ✅ No mysql2 in package.json');
  }
  
  if (deps.mongoose) {
    console.log('   ✅ Mongoose is present');
  } else {
    errors.push('❌ Mongoose not found in package.json');
  }
} catch (error) {
  errors.push(`❌ Error reading package.json: ${error.message}`);
}

// Check database config
console.log('\n🗄️  Checking database configuration...');
try {
  const dbConfig = fs.readFileSync(path.join(__dirname, '../config/database.js'), 'utf8');
  
  if (dbConfig.includes('sequelize') || dbConfig.includes('Sequelize')) {
    errors.push('❌ Sequelize found in config/database.js');
  } else {
    console.log('   ✅ database.js uses Mongoose');
  }
  
  if (dbConfig.includes('mongoose') || dbConfig.includes('Mongoose')) {
    console.log('   ✅ Mongoose import found');
  } else {
    warnings.push('⚠️  Mongoose not found in database.js');
  }
} catch (error) {
  errors.push(`❌ Error reading config/database.js: ${error.message}`);
}

// Check for node_modules (if present)
console.log('\n📁 Checking node_modules...');
const nodeModulesPath = path.join(__dirname, '../node_modules');
if (fs.existsSync(nodeModulesPath)) {
  const sequelizePath = path.join(nodeModulesPath, 'sequelize');
  const mysql2Path = path.join(nodeModulesPath, 'mysql2');
  
  if (fs.existsSync(sequelizePath)) {
    errors.push('❌ Sequelize found in node_modules - run: rm -rf node_modules && npm install');
  } else {
    console.log('   ✅ No Sequelize in node_modules');
  }
  
  if (fs.existsSync(mysql2Path)) {
    errors.push('❌ mysql2 found in node_modules - run: rm -rf node_modules && npm install');
  } else {
    console.log('   ✅ No mysql2 in node_modules');
  }
  
  const mongoosePath = path.join(nodeModulesPath, 'mongoose');
  if (fs.existsSync(mongoosePath)) {
    console.log('   ✅ Mongoose found in node_modules');
  } else {
    warnings.push('⚠️  Mongoose not found in node_modules - run: npm install');
  }
} else {
  console.log('   ℹ️  node_modules not found (will be installed during deployment)');
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors.length > 0) {
  console.log('\n❌ DEPLOYMENT VERIFICATION FAILED\n');
  errors.forEach(err => console.log(`   ${err}`));
  console.log('\n⚠️  Please fix these issues before deploying!\n');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n⚠️  DEPLOYMENT VERIFICATION PASSED WITH WARNINGS\n');
  warnings.forEach(warn => console.log(`   ${warn}`));
  console.log('\n✅ Ready to deploy, but review warnings above.\n');
  process.exit(0);
} else {
  console.log('\n✅ DEPLOYMENT VERIFICATION PASSED\n');
  console.log('   All checks passed! Ready to deploy.\n');
  process.exit(0);
}

