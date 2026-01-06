/**
 * Dashboard Functionality Test Script
 * Run with: node test-dashboard.mjs
 * 
 * Prerequisites:
 * - Server running on localhost:3000
 * - Test user credentials in environment or hardcoded
 */

const BASE_URL = 'http://localhost:3000';

// Test configuration
const tests = {
  passed: 0,
  failed: 0,
  results: []
};

// Helper function to log test results
function logTest(name, passed, message = '') {
  const status = passed ? '✓' : '✗';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${status}\x1b[0m ${name}${message ? ': ' + message : ''}`);
  
  tests.results.push({ name, passed, message });
  if (passed) tests.passed++;
  else tests.failed++;
}

// Test 1: Home page loads
async function testHomePage() {
  try {
    const response = await fetch(`${BASE_URL}/`);
    const text = await response.text();
    const passed = response.ok && text.includes('Refittr');
    logTest('Home page loads', passed, passed ? 'OK' : `Status: ${response.status}`);
  } catch (error) {
    logTest('Home page loads', false, error.message);
  }
}

// Test 2: About page loads
async function testAboutPage() {
  try {
    const response = await fetch(`${BASE_URL}/about`);
    const text = await response.text();
    const passed = response.ok && text.includes('About Refittr');
    logTest('About page loads', passed, passed ? 'OK' : `Status: ${response.status}`);
  } catch (error) {
    logTest('About page loads', false, error.message);
  }
}

// Test 3: Login page loads
async function testLoginPage() {
  try {
    const response = await fetch(`${BASE_URL}/login`);
    const text = await response.text();
    const passed = response.ok && (text.includes('login') || text.includes('Login'));
    logTest('Login page loads', passed, passed ? 'OK' : `Status: ${response.status}`);
  } catch (error) {
    logTest('Login page loads', false, error.message);
  }
}

// Test 4: Dashboard redirects to login when not authenticated
async function testDashboardRedirect() {
  try {
    const response = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' });
    // Should either redirect or show login prompt
    const passed = response.status === 200 || response.status === 302 || response.status === 307;
    logTest('Dashboard handles unauthenticated access', passed, `Status: ${response.status}`);
  } catch (error) {
    logTest('Dashboard handles unauthenticated access', false, error.message);
  }
}

// Test 5: API Routes exist
async function testAPIRoutes() {
  const routes = [
    '/api/builders',
    '/api/schemas',
    '/api/rooms',
    '/api/developments',
    '/api/streets',
    '/api/dashboard/stats',
    '/api/dashboard/recent-activity'
  ];

  for (const route of routes) {
    try {
      const response = await fetch(`${BASE_URL}${route}`);
      // API should return 200 (success) or 401 (unauthorized, but exists)
      const passed = response.status === 200 || response.status === 401;
      logTest(`API route ${route}`, passed, `Status: ${response.status}`);
    } catch (error) {
      logTest(`API route ${route}`, false, error.message);
    }
  }
}

// Test 6: Mailing list API
async function testMailingListAPI() {
  try {
    const response = await fetch(`${BASE_URL}/api/mailing-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    
    // Should return 200 or 400 (if duplicate/validation error)
    const passed = response.status === 200 || response.status === 400;
    logTest('Mailing list API responds', passed, `Status: ${response.status}`);
  } catch (error) {
    logTest('Mailing list API responds', false, error.message);
  }
}

// Test 7: Dashboard sub-routes exist
async function testDashboardRoutes() {
  const routes = [
    '/dashboard/builders',
    '/dashboard/schemas',
    '/dashboard/rooms',
    '/dashboard/developments',
    '/dashboard/streets'
  ];

  for (const route of routes) {
    try {
      const response = await fetch(`${BASE_URL}${route}`, { redirect: 'manual' });
      // Should return 200 or redirect (302/307)
      const passed = response.status === 200 || response.status === 302 || response.status === 307;
      logTest(`Dashboard route ${route}`, passed, `Status: ${response.status}`);
    } catch (error) {
      logTest(`Dashboard route ${route}`, false, error.message);
    }
  }
}

// Test 8: Static assets load
async function testStaticAssets() {
  try {
    const response = await fetch(`${BASE_URL}/refittr-app-icon-512.png`);
    const passed = response.ok && response.headers.get('content-type')?.includes('image');
    logTest('Logo image loads', passed, passed ? 'OK' : `Status: ${response.status}`);
  } catch (error) {
    logTest('Logo image loads', false, error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('\n🧪 Starting Dashboard Functionality Tests...\n');
  console.log(`Testing: ${BASE_URL}\n`);

  console.log('📄 Page Load Tests:');
  await testHomePage();
  await testAboutPage();
  await testLoginPage();
  await testDashboardRedirect();
  
  console.log('\n🔌 API Endpoint Tests:');
  await testAPIRoutes();
  await testMailingListAPI();
  
  console.log('\n🗂️  Dashboard Route Tests:');
  await testDashboardRoutes();
  
  console.log('\n🖼️  Asset Tests:');
  await testStaticAssets();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Summary:`);
  console.log(`   Passed: ${tests.passed}`);
  console.log(`   Failed: ${tests.failed}`);
  console.log(`   Total:  ${tests.passed + tests.failed}`);
  console.log(`   Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(1)}%\n`);
  
  if (tests.failed > 0) {
    console.log('❌ Some tests failed. Check the output above for details.\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  }
}

// Check if server is running
async function checkServerRunning() {
  try {
    await fetch(BASE_URL);
    return true;
  } catch (error) {
    console.error('\n❌ Error: Server not running on', BASE_URL);
    console.error('   Please start the server with: npm run dev\n');
    process.exit(1);
  }
}

// Main execution
(async () => {
  await checkServerRunning();
  await runTests();
})();
