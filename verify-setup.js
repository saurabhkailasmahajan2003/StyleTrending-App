/**
 * Setup Verification Script
 * Run: node verify-setup.js
 * 
 * Checks all critical files and configurations
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Expo App Setup...\n');

let errors = [];
let warnings = [];

// Check critical files
const criticalFiles = [
  'babel.config.js',
  'metro.config.js',
  'App.js',
  'global.css',
  'app.json',
  'package.json',
  'tailwind.config.js',
];

console.log('📁 Checking critical files...');
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    errors.push(`Missing file: ${file}`);
  }
});

// Check assets
console.log('\n🖼️  Checking assets...');
const assetsDir = path.join(__dirname, 'assets');
if (fs.existsSync(assetsDir)) {
  const iconPath = path.join(assetsDir, 'icon.png');
  const splashPath = path.join(assetsDir, 'splash.png');
  
  if (fs.existsSync(iconPath)) {
    console.log('  ✅ assets/icon.png');
  } else {
    console.log('  ❌ assets/icon.png - MISSING');
    errors.push('Missing asset: assets/icon.png');
  }
  
  if (fs.existsSync(splashPath)) {
    console.log('  ✅ assets/splash.png');
  } else {
    console.log('  ❌ assets/splash.png - MISSING');
    errors.push('Missing asset: assets/splash.png');
  }
} else {
  console.log('  ❌ assets/ directory - MISSING');
  errors.push('Missing directory: assets/');
}

// Check .env
console.log('\n🔐 Checking environment variables...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('  ✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('EXPO_PUBLIC_API_URL')) {
    console.log('  ✅ EXPO_PUBLIC_API_URL is set');
  } else {
    console.log('  ⚠️  EXPO_PUBLIC_API_URL not found in .env');
    warnings.push('EXPO_PUBLIC_API_URL not set in .env');
  }
} else {
  console.log('  ⚠️  .env file missing (will use defaults)');
  warnings.push('.env file missing - using default API URL');
}

// Check babel.config.js
console.log('\n⚙️  Checking Babel configuration...');
const babelPath = path.join(__dirname, 'babel.config.js');
if (fs.existsSync(babelPath)) {
  const babelContent = fs.readFileSync(babelPath, 'utf8');
  
  // Check for nativewind/babel plugin (should NOT be there)
  if (babelContent.includes("'nativewind/babel'") || babelContent.includes('"nativewind/babel"')) {
    console.log('  ❌ nativewind/babel plugin found (should be removed)');
    errors.push('babel.config.js contains nativewind/babel plugin - remove it');
  } else {
    console.log('  ✅ No nativewind/babel plugin (correct)');
  }
  
  // Check for reanimated plugin (should be there)
  if (babelContent.includes('react-native-reanimated/plugin')) {
    console.log('  ✅ react-native-reanimated/plugin found');
  } else {
    console.log('  ⚠️  react-native-reanimated/plugin not found');
    warnings.push('react-native-reanimated/plugin missing from babel.config.js');
  }
}

// Check metro.config.js
console.log('\n🚇 Checking Metro configuration...');
const metroPath = path.join(__dirname, 'metro.config.js');
if (fs.existsSync(metroPath)) {
  const metroContent = fs.readFileSync(metroPath, 'utf8');
  if (metroContent.includes('withNativeWind')) {
    console.log('  ✅ NativeWind Metro config found');
  } else {
    console.log('  ⚠️  NativeWind Metro config not found');
    warnings.push('NativeWind not configured in metro.config.js');
  }
} else {
  console.log('  ❌ metro.config.js - MISSING');
  errors.push('Missing file: metro.config.js');
}

// Check App.js
console.log('\n📱 Checking App.js...');
const appPath = path.join(__dirname, 'App.js');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  if (appContent.includes("import 'react-native-gesture-handler'")) {
    console.log('  ✅ react-native-gesture-handler imported');
  } else {
    console.log('  ⚠️  react-native-gesture-handler not imported');
    warnings.push('react-native-gesture-handler should be imported first in App.js');
  }
  
  if (appContent.includes("import './global.css'")) {
    console.log('  ✅ global.css imported');
  } else {
    console.log('  ⚠️  global.css not imported');
    warnings.push('global.css should be imported in App.js');
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY');
console.log('='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All checks passed! Your app should start correctly.');
  console.log('\n🚀 Next step:');
  console.log('   npx expo start --clear');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log('\n❌ ERRORS (must fix):');
    errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (should fix):');
    warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
  }
  
  console.log('\n📖 See START_APP.md for detailed fix instructions');
  process.exit(errors.length > 0 ? 1 : 0);
}

