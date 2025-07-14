// Simple test to run in browser console
// Go to http://localhost:5173 and open DevTools console, then paste this:

console.log('🧪 Starting E-commerce Flow Test...');

// Step 1: Clear storage
localStorage.clear();
console.log('✅ Storage cleared');

// Step 2: Test backend connectivity
const testBackend = async () => {
  try {
    console.log('🔄 Testing backend connectivity...');
    const response = await fetch('http://localhost:3000/api/ecom/products');
    const data = await response.json();
    console.log('✅ Backend is running:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

// Step 3: Test authentication
const testAuth = async () => {
  try {
    console.log('🔄 Testing authentication...');
    const response = await fetch('http://localhost:3000/api/ecom/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    console.log('🔑 Auth response:', data);

    if (data.token) {
      localStorage.setItem('ecom_token', data.token);
      console.log('✅ Token saved');
      return data.token;
    } else {
      console.error('❌ No token in response');
      return null;
    }
  } catch (error) {
    console.error('❌ Auth failed:', error);
    return null;
  }
};

// Step 4: Test product creation
const testProductCreation = async (token) => {
  try {
    console.log('🔄 Testing product creation...');
    
    const formData = new FormData();
    formData.append('name', 'Test Product Browser');
    formData.append('description', 'Created from browser console test');
    formData.append('category', '68739303f8b354a3f2094ea3');

    const response = await fetch('http://localhost:3000/api/ecom/products', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await response.json();
    console.log('📦 Product creation response:', data);
    return response.ok;
  } catch (error) {
    console.error('❌ Product creation failed:', error);
    return false;
  }
};

// Step 5: Test product fetch
const testProductFetch = async () => {
  try {
    console.log('🔄 Testing product fetch...');
    const response = await fetch('http://localhost:3000/api/ecom/products');
    const data = await response.json();
    console.log('📋 Products response:', data);
    console.log('📊 Total products:', data.data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ Product fetch failed:', error);
    return null;
  }
};

// Run the complete test
const runCompleteTest = async () => {
  console.log('🚀 Starting complete e-commerce test...');
  
  const backendOk = await testBackend();
  if (!backendOk) {
    console.error('❌ Backend not available - stopping test');
    return;
  }
  
  const token = await testAuth();
  if (!token) {
    console.error('❌ Authentication failed - stopping test');
    return;
  }
  
  const productCreated = await testProductCreation(token);
  if (!productCreated) {
    console.error('❌ Product creation failed');
  }
  
  const products = await testProductFetch();
  
  console.log('🏁 Test completed!');
  console.log('Summary:');
  console.log('- Backend:', backendOk ? '✅' : '❌');
  console.log('- Auth:', token ? '✅' : '❌');
  console.log('- Product Creation:', productCreated ? '✅' : '❌');
  console.log('- Total Products:', products?.data?.length || 0);
};

// Auto-run the test
runCompleteTest();
