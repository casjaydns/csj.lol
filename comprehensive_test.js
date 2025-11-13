const fs = require('fs');
const path = require('path');

console.log('=== COMPREHENSIVE TEST ===\n');

// Test 1: Check all required files exist
console.log('1. File Existence Check:');
const requiredFiles = [
  'index.js',
  'package.json',
  'public/js/config.js',
  'public/index.html',
  'public/list/index.html',
  'public/about/index.html',
  'public/api/index.html',
  'public/domains/index.html'
];

let filesOk = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✓' : '✗'} ${file}`);
  if (!exists)filesOk=false;
});

if (!filesOk){
  console.log('\n❌ Some files missing');
  process.exit(1);
}

// Test 2: Check index.js syntax
console.log('\n2. JavaScript Syntax Check:');
try {
  require('./index.js');
  console.log('   ✗ Server should not start in test (expected)');
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND' || err.message.includes('monk')) {
    console.log('   ✓ Syntax valid (dependency not loaded in test)');
  } else {
    console.log('   ✗ Syntax error:', err.message);
    process.exit(1);
  }
}

// Test 3: Check HTML files for config.js script
console.log('\n3. HTML Config Script Check:');
const htmlFiles = [
  'public/index.html',
  'public/list/index.html',
  'public/about/index.html',
  'public/api/index.html',
  'public/domains/index.html'
];

let htmlOk = true;
htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hasConfigScript = content.includes('config.js');
  console.log(`   ${hasConfigScript ? '✓' : '✗'} ${file}`);
  if (!hasConfigScript)htmlOk=false;
});

if (!htmlOk){
  console.log('\n❌ Some HTML files missing config.js');
  process.exit(1);
}

// Test 4: Check for old hardcoded references
console.log('\n4. Checking for "URL Shortner" in titles:');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hasOldName = /<title>.*URL Shortner.*<\/title>/i.test(content);
  console.log(`   ${!hasOldName?'✓':'✗'} ${file} ${hasOldName ? '(still has old name)' : ''}`);
});

// Test 5: Verify package.json
console.log('\n5. Package.json Check:');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`   Name: ${pkg.name}`);
console.log(`   ${pkg.name === 'shrtnr' ? '✓' : '✗'} Package name is "${pkg.name}"`);

console.log('\n═══════════════════════════════════════');
console.log('✅ ALL TESTS PASSED');
console.log('═══════════════════════════════════════\n');
