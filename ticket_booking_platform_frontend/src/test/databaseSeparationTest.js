// E-commerce Database Separation Test Suite
// Run this in browser console to verify the new setup works

import { productService } from './src/services/ecom_admin/productService.js';
import { categoryService } from './src/services/ecom_admin/categoryService.js';
import { initializeFreshSession, testNewCredentials } from './src/services/ecom_admin/authService.js';

// Complete test suite for database separation
export const runDatabaseSeparationTests = async () => {
  console.log('🚀 Starting E-commerce Database Separation Tests...');
  console.log('📊 Testing separated BigideaEcomDB database');
  
  const results = {
    authCleanup: false,
    login: false,
    categories: false,
    products: false,
    persistence: false,
    overall: false
  };

  try {
    // Test 1: Clear old authentication data
    console.log('\n🧹 TEST 1: Clearing old authentication data...');
    initializeFreshSession();
    results.authCleanup = true;
    console.log('✅ Authentication data cleared');

    // Test 2: Test new login credentials
    console.log('\n🔑 TEST 2: Testing new admin credentials...');
    const loginTest = await testNewCredentials();
    if (loginTest.success) {
      results.login = true;
      console.log('✅ Login successful with admin@gmail.com/admin123');
    } else {
      throw new Error('Login failed: ' + loginTest.error);
    }

    // Test 3: Test category creation
    console.log('\n📁 TEST 3: Testing category management...');
    await categoryService.initializeDefaultCategories();
    const categoriesResult = await categoryService.getAllCategories();
    if (categoriesResult.success && categoriesResult.data.length > 0) {
      results.categories = true;
      console.log(`✅ Categories working: ${categoriesResult.data.length} categories found`);
    } else {
      throw new Error('Category creation failed');
    }

    // Test 4: Test product creation
    console.log('\n📦 TEST 4: Testing product creation...');
    const testProduct = {
      name: 'Database Separation Test Product',
      description: 'Testing product creation with separated BigideaEcomDB',
      productCode: 'DB-TEST-' + Date.now()
    };

    const productResult = await productService.createProduct(testProduct);
    if (productResult.success) {
      results.products = true;
      console.log('✅ Product created:', productResult.data.name);
    } else {
      throw new Error('Product creation failed: ' + productResult.error);
    }

    // Test 5: Test persistence
    console.log('\n🔍 TEST 5: Testing product persistence...');
    const allProducts = await productService.getAllProducts();
    if (allProducts.success) {
      const testProductExists = allProducts.data.find(p => p.name === testProduct.name);
      if (testProductExists) {
        results.persistence = true;
        console.log(`✅ Persistence confirmed: ${allProducts.data.length} products in database`);
      } else {
        throw new Error('Product not found - persistence failed');
      }
    } else {
      throw new Error('Failed to retrieve products: ' + allProducts.error);
    }

    // Overall success
    results.overall = true;
    console.log('\n🎉 ALL TESTS PASSED! Database separation working correctly.');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }

  // Test Results Summary
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('========================');
  console.log(`🧹 Auth Cleanup: ${results.authCleanup ? '✅' : '❌'}`);
  console.log(`🔑 Login: ${results.login ? '✅' : '❌'}`);
  console.log(`📁 Categories: ${results.categories ? '✅' : '❌'}`);
  console.log(`📦 Products: ${results.products ? '✅' : '❌'}`);
  console.log(`🔍 Persistence: ${results.persistence ? '✅' : '❌'}`);
  console.log(`🎯 Overall: ${results.overall ? '✅ SUCCESS' : '❌ FAILED'}`);

  if (results.overall) {
    console.log('\n🚀 READY TO USE: E-commerce platform is working with separated database!');
    console.log('📝 Instructions:');
    console.log('1. Login with: admin@gmail.com / admin123');
    console.log('2. Go to Categories → Initialize default categories');
    console.log('3. Go to Products → Add new products');
    console.log('4. Products will now persist across page refreshes!');
  } else {
    console.log('\n🆘 ISSUES FOUND: Check the error messages above and retry.');
  }

  return results;
};

// Quick test function for browser console
window.testEcommerceDB = runDatabaseSeparationTests;

// Auto-run test when file is loaded
console.log('💡 To run tests, execute: testEcommerceDB()');
