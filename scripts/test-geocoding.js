#!/usr/bin/env node

/**
 * Script de test du geocoding pour Maplyo
 * Usage: node scripts/test-geocoding.js [url] [token]
 */

const https = require('https');

const BASE_URL = process.argv[2] || 'http://localhost:3001';
const TOKEN = process.argv[3] || 'your-jwt-token';

async function testGeocodingAPI() {
  console.log('🧪 Testing Geocoding API...');
  console.log('🌐 Server:', BASE_URL);
  
  const testAddresses = [
    'Paris, France',
    '1600 Amphitheatre Parkway, Mountain View, CA',
    'London, UK',
    'Tokyo, Japan',
    'Invalid Address XYZ123'
  ];

  console.log('\n📍 Testing addresses:', testAddresses);
  console.log('=' * 50);

  for (const address of testAddresses) {
    console.log(`\n🏠 Testing: "${address}"`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${BASE_URL}/api/geocode`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      });
      
      const duration = Date.now() - startTime;
      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Success (${duration}ms):`, {
          lat: result.latitude,
          lng: result.longitude,
          formatted: result.formattedAddress
        });
      } else {
        console.log(`❌ Failed (${duration}ms):`, result.error);
      }
      
    } catch (error) {
      console.log(`💥 Error:`, error.message);
    }
    
    // Pause entre les requêtes pour éviter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testSystemDiagnostic() {
  console.log('\n🔍 Testing System Diagnostic...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/system/diagnostic`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    if (response.ok) {
      const diagnostic = await response.json();
      
      console.log('\n📊 System Status:');
      console.log('- Environment:', diagnostic.server.environment);
      console.log('- Uptime:', Math.round(diagnostic.server.uptime), 'seconds');
      console.log('- Memory:', Math.round(diagnostic.server.memory.used / 1024 / 1024), 'MB');
      
      console.log('\n🗃️ Database:');
      console.log('- Exists:', diagnostic.database.exists);
      console.log('- Size:', Math.round(diagnostic.database.size / 1024), 'KB');
      
      console.log('\n🌍 Geocoding:');
      console.log('- Provider:', diagnostic.geocoding.provider);
      console.log('- Success Rate:', 
        diagnostic.geocoding.stats.total > 0 
          ? `${Math.round(diagnostic.geocoding.stats.success / diagnostic.geocoding.stats.total * 100)}%`
          : 'No data'
      );
      
      if (diagnostic.geocoding.lastTest) {
        console.log('- Last Test:', diagnostic.geocoding.lastTest.success ? 'SUCCESS' : 'FAILED');
        if (diagnostic.geocoding.lastTest.duration) {
          console.log('- Test Duration:', diagnostic.geocoding.lastTest.duration, 'ms');
        }
      }
      
      console.log('\n🌐 Network:');
      if (diagnostic.network.lastTest) {
        console.log('- Connectivity:', diagnostic.network.lastTest.success ? 'OK' : 'FAILED');
        if (diagnostic.network.lastTest.duration) {
          console.log('- Response Time:', diagnostic.network.lastTest.duration, 'ms');
        }
      }
      
    } else {
      console.log('❌ Diagnostic failed:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.log('💥 Diagnostic error:', error.message);
  }
}

async function main() {
  console.log('🚀 Maplyo Geocoding Test Suite');
  console.log('================================');
  
  if (!TOKEN || TOKEN === 'your-jwt-token') {
    console.log('⚠️ Warning: Using default token. Please provide a valid JWT token.');
    console.log('Usage: node scripts/test-geocoding.js [url] [jwt-token]');
    console.log('');
  }
  
  try {
    await testSystemDiagnostic();
    await testGeocodingAPI();
    
    console.log('\n✅ Test suite completed');
    console.log('\n💡 Tips for production:');
    console.log('- Monitor geocoding success rate in logs');
    console.log('- Check network connectivity regularly');
    console.log('- Consider upgrading to Starter plan for better performance');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Polyfill fetch for older Node versions
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

main();
