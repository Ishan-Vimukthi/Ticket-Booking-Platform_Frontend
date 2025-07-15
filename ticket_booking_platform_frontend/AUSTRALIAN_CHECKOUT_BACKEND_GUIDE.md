# Backend Update Guide: Australian Checkout System

## Overview
The frontend checkout system has been updated to focus exclusively on Australian customers with:
- Removed country field (fixed to Australia)
- Australian state dropdown selection
- 4-digit postal code validation
- Updated customer data structure

## Required Backend Changes

### 1. Customer Schema Updates

Update your customer/order schemas to handle the new Australian address format:

```javascript
// Updated Customer Address Schema
const addressSchema = {
  street: { type: String, required: true },      // e.g., "123 Collins Street"
  city: { type: String, required: true },        // e.g., "Melbourne"
  state: { type: String, required: true },       // e.g., "VIC" (Australian state codes)
  postalCode: { type: String, required: true },  // e.g., "3000" (4-digit Australian postcode)
  country: { type: String, default: 'AU' }       // Fixed to Australia
};

const customerSchema = {
  firstName: { type: String, required: true, maxLength: 50 },
  lastName: { type: String, required: true, maxLength: 50 },
  email: { type: String, required: true, validate: emailValidator },
  phone: { type: String, required: true, minLength: 10, maxLength: 15 },
  address: addressSchema,
  // ... other fields
};
```

### 2. Australian State Validation

Add validation for Australian states in your backend:

```javascript
const AUSTRALIAN_STATES = [
  'NSW', // New South Wales
  'VIC', // Victoria
  'QLD', // Queensland
  'WA',  // Western Australia
  'SA',  // South Australia
  'TAS', // Tasmania
  'ACT', // Australian Capital Territory
  'NT'   // Northern Territory
];

// Validation function
const validateAustralianState = (state) => {
  return AUSTRALIAN_STATES.includes(state);
};
```

### 3. Postal Code Validation

Update postal code validation for Australian format:

```javascript
// Australian postal code validation (4 digits)
const validateAustralianPostalCode = (postalCode) => {
  const australianPostalRegex = /^\d{4}$/;
  return australianPostalRegex.test(postalCode);
};
```

### 4. Payment Intent API Updates

Update your payment/checkout endpoints to handle the new customer data structure:

```javascript
// Example: POST /api/ecom/payments/create-intent
app.post('/api/ecom/payments/create-intent', async (req, res) => {
  try {
    const { cartItems, customerInfo, shipping } = req.body;
    
    // Validate customer info with new Australian schema
    const validationResult = validateAustralianCustomer(customerInfo);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid customer information',
        details: validationResult.errors
      });
    }
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateTotalAmount(cartItems, shipping), // No tax included
      currency: 'usd', // Keep existing currency settings
      metadata: {
        customerEmail: customerInfo.email,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        shippingCity: customerInfo.city,
        shippingState: customerInfo.state,
        shippingPostalCode: customerInfo.postalCode
      }
    });
    
    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Payment processing failed'
    });
  }
});
```

### 5. Customer Creation/Update Endpoints

Update customer management endpoints:

```javascript
// Example: POST /api/ecom/customers
app.post('/api/ecom/customers', async (req, res) => {
  try {
    const customerData = req.body;
    
    // Validate Australian address
    if (!validateAustralianState(customerData.address.state)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Australian state'
      });
    }
    
    if (!validateAustralianPostalCode(customerData.address.postalCode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Australian postal code (must be 4 digits)'
      });
    }
    
    // Set country to Australia
    customerData.address.country = 'AU';
    
    // Create customer
    const customer = await Customer.create(customerData);
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 6. Order Processing Updates

Update order creation to handle Australian address format:

```javascript
// Example order creation with Australian address
const createOrder = async (orderData) => {
  const order = {
    customerId: orderData.customerId,
    items: orderData.items,
    shippingAddress: {
      street: orderData.customerInfo.address,
      city: orderData.customerInfo.city,
      state: orderData.customerInfo.state,
      postalCode: orderData.customerInfo.postalCode,
      country: 'AU'
    },
    billingAddress: {
      // Same as shipping for Australian customers
      street: orderData.customerInfo.address,
      city: orderData.customerInfo.city,
      state: orderData.customerInfo.state,
      postalCode: orderData.customerInfo.postalCode,
      country: 'AU'
    },
    total: orderData.total,
    currency: 'USD', // Keep existing currency settings
    status: 'pending'
  };
  
  return await Order.create(order);
};
```

### 7. Database Migration (if needed)

If you have existing customers with the old address format, create a migration:

```javascript
// Migration script example
const migrateCustomerAddresses = async () => {
  const customers = await Customer.find({});
  
  for (const customer of customers) {
    if (typeof customer.address === 'string') {
      // Parse old string address format
      const addressParts = customer.address.split(', ');
      
      customer.address = {
        street: addressParts[0] || '',
        city: addressParts[1] || '',
        state: addressParts[2] || 'NSW', // Default to NSW
        postalCode: addressParts[3] || '2000', // Default postcode
        country: 'AU'
      };
      
      await customer.save();
    }
  }
};
```

### 8. API Response Format

Ensure your customer API responses match the new format:

```javascript
// GET /api/ecom/customers response format
{
  "success": true,
  "data": [
    {
      "_id": "customer_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+61234567890",
      "address": {
        "street": "123 Collins Street",
        "city": "Melbourne",
        "state": "VIC",
        "postalCode": "3000",
        "country": "AU"
      },
      "totalOrders": 15,
      "totalSpent": 899.75,
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### 9. Environment Variables

Update your environment variables if needed:

```bash
# .env
# Keep existing currency settings - no changes needed
DEFAULT_COUNTRY=AU
SHIPPING_ZONES=AU_DOMESTIC
```

### 10. Testing

Test the updated endpoints with the new customer data format:

```javascript
// Test data for Australian customer
const testCustomerData = {
  firstName: "Sarah",
  lastName: "Wilson",
  email: "sarah@example.com",
  phone: "+61398765432",
  address: {
    street: "789 Bourke Street",
    city: "Melbourne",
    state: "VIC",
    postalCode: "3000",
    country: "AU"
  }
};
```

## Summary of Changes

1. ✅ **Frontend Updated**: Australian states dropdown, 4-digit postal validation, removed country field
2. 🔄 **Backend Needed**: Update schemas, validation, API endpoints
3. 🔄 **Database**: Migrate existing customer addresses if needed
4. ✅ **Payment**: Keep existing currency settings (no changes needed)
5. 🔄 **Testing**: Test with new Australian address format

The frontend is now ready and will send customer data in the new Australian format. Update your backend accordingly to handle this new structure.
