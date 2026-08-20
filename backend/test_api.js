const axios = require('axios');

async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('--- STARTING REST API INTEGRATION TESTS ---');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Get Designs Gallery (Public)
  try {
    console.log('\n[TEST 1] Fetching public designs list...');
    const res = await axios.get(`${baseUrl}/designs`);
    console.log(`Status: ${res.status}`);
    console.log(`Design items returned: ${res.data.length}`);
    if (res.status === 200 && res.data.length === 48) {
      console.log('Result: PASSED');
      testsPassed++;
    } else {
      console.log('Result: FAILED (Expected 48 designs)');
      testsFailed++;
    }
  } catch (err) {
    console.error('Result: FAILED with error:', err.message);
    testsFailed++;
  }

  // Test 2: Admin Login
  try {
    console.log('\n[TEST 2] Authenticating admin user (admin / admin3Dcnc123)...');
    const res = await axios.post(`${baseUrl}/auth/login`, {
      username: 'admin',
      password: 'admin3Dcnc123'
    });
    console.log(`Status: ${res.status}`);
    console.log(`Token received: ${res.data.token ? 'YES' : 'NO'}`);
    console.log(`Admin context username: ${res.data.admin?.username}`);
    if (res.status === 200 && res.data.token && res.data.admin?.username === 'admin') {
      console.log('Result: PASSED');
      testsPassed++;
    } else {
      console.log('Result: FAILED');
      testsFailed++;
    }
  } catch (err) {
    console.error('Result: FAILED with error:', err.message);
    testsFailed++;
  }

  // Test 3: Submit Contact Form
  try {
    console.log('\n[TEST 3] Submitting new contact inquiry...');
    const res = await axios.post(`${baseUrl}/contact`, {
      name: 'Ravi Kumar',
      phone: '9876543210',
      email: 'ravi.kumar@example.com',
      message: 'Need a custom wooden pooja door carved in G Mamidada. Dimensions 4ft x 8ft. Please revert.'
    });
    console.log(`Status: ${res.status}`);
    console.log(`Server message: ${res.data.message}`);
    if (res.status === 201 && res.data.message) {
      console.log('Result: PASSED');
      testsPassed++;
    } else {
      console.log('Result: FAILED');
      testsFailed++;
    }
  } catch (err) {
    console.error('Result: FAILED with error:', err.message);
    testsFailed++;
  }

  console.log('\n=======================================');
  console.log(`TEST EXECUTION SUMMARY:`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  console.log('=======================================');

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
