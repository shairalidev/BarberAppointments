const axios = require('axios');

// Test script to verify API endpoints
const API_URL = 'https://ates-barberos.com/api';

async function testEndpoints() {
  console.log('🧪 Testing API endpoints...\n');

  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      url: `${API_URL}/health`
    },
    {
      name: 'Public Services',
      method: 'GET',
      url: `${API_URL}/services/public`
    },
    {
      name: 'Public Barbers',
      method: 'GET',
      url: `${API_URL}/barbers/public`
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...\n`);
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED`);
      console.log(`   Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
      }
      console.log('');
    }
  }
}

// Test availability endpoint with sample data
async function testAvailability() {
  console.log('🧪 Testing availability endpoint...\n');
  
  try {
    // First get barbers to use a real barber ID
    const barbersResponse = await axios.get(`${API_URL}/barbers/public`);
    const barbers = barbersResponse.data;
    
    if (barbers.length === 0) {
      console.log('❌ No barbers found - cannot test availability');
      return;
    }
    
    const barberId = barbers[0]._id;
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Testing availability for barber ${barberId} on ${today}...`);
    
    const response = await axios.get(`${API_URL}/appointments/availability`, {
      params: {
        barberId,
        date: today,
        duration: 30
      },
      timeout: 10000
    });
    
    console.log('✅ Availability check successful');
    console.log(`   Available times: ${response.data.availableTimes?.length || 0}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
  } catch (error) {
    console.log('❌ Availability check failed');
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    console.log('');
  }
}

async function runTests() {
  await testEndpoints();
  await testAvailability();
  console.log('🏁 Tests completed');
}

runTests().catch(console.error);