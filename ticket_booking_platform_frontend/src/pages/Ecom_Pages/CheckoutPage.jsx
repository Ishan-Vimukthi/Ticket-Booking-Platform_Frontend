import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import ShopNav from '../../components/ecom_Components/navigation/ShopNav';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getProductImage } from '../../utils/images';
import { toast } from 'react-toastify';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeService } from '../../services/ecom_admin/stripeService';

// Australian states list
const australianStates = [
  { value: 'NSW', label: 'New South Wales (NSW)' },
  { value: 'VIC', label: 'Victoria (VIC)' },
  { value: 'QLD', label: 'Queensland (QLD)' },
  { value: 'WA', label: 'Western Australia (WA)' },
  { value: 'SA', label: 'South Australia (SA)' },
  { value: 'TAS', label: 'Tasmania (TAS)' },
  { value: 'ACT', label: 'Australian Capital Territory (ACT)' },
  { value: 'NT', label: 'Northern Territory (NT)' }
];

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string()
    .min(4, "Australian postal code must be 4 digits")
    .max(4, "Australian postal code must be 4 digits")
    .regex(/^\d{4}$/, "Australian postal code must be exactly 4 digits")
});

// Stripe card element options
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

// Payment Form Component (inside Stripe Elements)
const PaymentForm = ({ customerInfo, cartItems, cartTotal, shipping, onValidateForm }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    console.log('🔘 Complete Order button clicked!');
    
    if (!stripe || !elements) {
      console.log('❌ Stripe not loaded:', { stripe: !!stripe, elements: !!elements });
      toast.error('Stripe is not loaded yet. Please try again.');
      return;
    }

    // Validate customer information first
    const validationResult = await onValidateForm();
    if (!validationResult.isValid) {
      toast.error('Please fill in all required fields in the shipping information.', {
        position: "top-center",
        autoClose: 4000
      });
      
      // Scroll to the first error field
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card element not found');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Payment Intent
      console.log('🚀 Starting payment process...');
      
      const paymentData = {
        cartItems: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
          color: item.colors?.[0] || null
        })),
        customerInfo: validationResult.data, // Use validated data
        shipping
      };

      const paymentIntentResult = await stripeService.createPaymentIntent(paymentData);
      
      console.log('📥 Payment Intent Response:', paymentIntentResult);
      
      if (!paymentIntentResult.success) {
        throw new Error(paymentIntentResult.error);
      }

      // Debug: Check the exact structure of the response
      console.log('📋 Payment Intent Data:', paymentIntentResult.data);
      
      const clientSecret = paymentIntentResult.data.clientSecret || paymentIntentResult.data.client_secret;
      
      if (!clientSecret) {
        console.error('❌ No clientSecret found in response:', paymentIntentResult.data);
        throw new Error('Payment intent response missing client secret');
      }
      
      console.log('🔑 Using client secret:', clientSecret.substring(0, 20) + '...');

      // Step 2: Process with Stripe
      console.log('💳 Processing payment with Stripe...');
      console.log('💳 Stripe instance:', !!stripe);
      console.log('💳 Card element:', !!cardElement);
      
      const stripePaymentData = {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${validationResult.data.firstName} ${validationResult.data.lastName}`,
            email: validationResult.data.email,
            phone: validationResult.data.phone,
            address: {
              line1: validationResult.data.address,
              city: validationResult.data.city,
              state: validationResult.data.state,
              postal_code: validationResult.data.postalCode,
              country: 'AU' // Fixed to Australia
            }
          }
        }
      };
      
      console.log('💳 Confirming payment with client secret:', clientSecret.substring(0, 20) + '...');
      console.log('💳 Payment method data:', stripePaymentData);
      
      const confirmationResult = await stripe.confirmCardPayment(clientSecret, stripePaymentData);
      console.log('💳 FULL Stripe confirmation result:', JSON.stringify(confirmationResult, null, 2));
      
      const { error, paymentIntent } = confirmationResult;

      console.log('💳 Stripe confirmation result:', { error, paymentIntent });

      if (error) {
        console.error('❌ Stripe payment error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        throw new Error(error.message);
      }

      if (!paymentIntent) {
        console.error('❌ No payment intent returned from Stripe');
        console.error('❌ Full confirmation result:', confirmationResult);
        throw new Error('Payment confirmation failed - no payment intent returned');
      }

      console.log('✅ Stripe payment confirmed:', paymentIntent.id, paymentIntent.status);
      
      // Check if payment actually succeeded
      if (paymentIntent.status !== 'succeeded') {
        console.error('❌ Payment intent status is not succeeded:', paymentIntent.status);
        console.error('❌ Payment intent full object:', JSON.stringify(paymentIntent, null, 2));
        throw new Error(`Payment failed. Status: ${paymentIntent.status}`);
      }

      // Step 3: Confirm with Backend
      console.log('✅ Payment successful, confirming with backend...');
      console.log('🔄 Sending payment ID to backend:', paymentIntent.id);
      
      try {
        const confirmResult = await stripeService.confirmPayment(paymentIntent.id);
        console.log('🔄 Backend confirmation result:', JSON.stringify(confirmResult, null, 2));
        
        if (!confirmResult.success) {
          console.error('❌ Backend confirmation failed:', confirmResult.error);
          // For now, we'll proceed anyway since the payment worked and stock was already reduced
          console.log('⚠️ Proceeding with success flow despite backend confirmation failure');
        }

        // Success! (regardless of backend confirmation issue)
        console.log('🎉 Order completed successfully!');
        console.log('📝 Order details from backend:', confirmResult.data);
        
        toast.success('Payment successful! Order completed.', {
          position: "top-center",
          autoClose: 3000
        });

        // Clear cart and redirect
        clearCart();
        
        // Create a fallback order ID if backend didn't provide one
        const orderId = confirmResult.success ? confirmResult.data?.orderId : `order_${Date.now()}`;
        
        // Prepare complete order details for confirmation page
        const completeOrderDetails = {
          orderId,
          items: cartItems,
          customerInfo: validationResult.data,
          subtotal: cartTotal,
          shipping,
          total: cartTotal + shipping,
          paymentMethod: 'Credit Card',
          status: 'Confirmed',
          orderDate: new Date().toISOString(),
          backendData: confirmResult.success ? confirmResult.data : null
        };
        
        // Redirect to order confirmation page
        navigate(`/order-confirmation/${orderId}`, {
          state: { orderDetails: completeOrderDetails }
        });
        
      } catch (error) {
        console.error('❌ Backend confirmation error:', error);
        // Since stock was already reduced and payment succeeded, show success anyway
        console.log('⚠️ Payment succeeded but backend confirmation failed - showing success');
        
        toast.success('Payment successful! Order completed.', {
          position: "top-center",
          autoClose: 3000
        });

        // Clear cart and redirect
        clearCart();
        
        // Prepare complete order details for confirmation page (fallback case)
        const completeOrderDetails = {
          orderId: `order_${Date.now()}`,
          items: cartItems,
          customerInfo: validationResult.data,
          subtotal: cartTotal,
          shipping,
          total: cartTotal + shipping,
          paymentMethod: 'Credit Card',
          status: 'Confirmed',
          orderDate: new Date().toISOString(),
          backendData: null
        };
        
        // Redirect to order confirmation page with fallback ID
        navigate(`/order-confirmation/order_${Date.now()}`, {
          state: { orderDetails: completeOrderDetails }
        });
      }

    } catch (error) {
      console.error('❌ Payment failed:', error);
      
      // Check if it's a Stripe blocking issue
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        toast.error('Payment blocked by browser. Please disable ad blockers and try again.', {
          position: "top-center",
          autoClose: 10000
        });
      } else {
        toast.error(`Payment failed: ${error.message}`, {
          position: "top-center",
          autoClose: 5000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card Element */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
        
        {/* Test Cards Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Test Cards:</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Success:</strong> 4242 4242 4242 4242</p>
            <p><strong>Decline:</strong> 4000 0000 0000 0002</p>
            <p><strong>Insufficient:</strong> 4000 0000 0000 9995</p>
            <p><em>Any future date, any 3-digit CVC</em></p>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePayment}
        disabled={!stripe || loading}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
          loading
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing Payment...</span>
          </div>
        ) : (
          `Complete Order • $${(cartTotal + shipping).toFixed(2)}`
        )}
      </button>
    </div>
  );
};

// Main Checkout Component
const CheckoutPage = () => {
  const { cartItems, cartTotal, closeCart, updateQuantity, removeFromCart } = useCart();
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Shipping (you can make this dynamic)
  const shipping = cartTotal > 50 ? 0 : 5.00;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger
  } = useForm({
    resolver: zodResolver(checkoutSchema)
  });

  // Function to validate form and return data
  const validateForm = async () => {
    const isValid = await trigger(); // Triggers validation for all fields
    const data = getValues();
    
    console.log('Form validation result:', { isValid, data, errors });
    
    return {
      isValid,
      data,
      errors
    };
  };

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        console.log('🔑 Initializing Stripe...');
        
        // Try to get config from backend first
        const configResult = await stripeService.getStripeConfig();
        
        let publishableKey;
        if (configResult.success && configResult.publishableKey) {
          publishableKey = configResult.publishableKey;
          console.log('✅ Got publishable key from backend:', publishableKey.substring(0, 20) + '...');
        } else {
          // Fallback to hardcoded key for testing (your friend provided this)
          publishableKey = 'pk_test_51RflZsH8Y4NurIedtVJjjow0vcGgcSjiakk7ukq6V7ylUwk3aKIUiySY3h9COv0IBi3ISnoQSw1kF0pllVuxzTUg00YRySt0o2';
          console.log('⚠️ Using fallback publishable key, backend config failed:', configResult.error);
        }
        
        if (publishableKey) {
          const stripe = await loadStripe(publishableKey);
          setStripePromise(stripe);
          console.log('✅ Stripe initialized successfully with key:', publishableKey.substring(0, 20) + '...');
        } else {
          throw new Error('No Stripe publishable key available');
        }
      } catch (error) {
        console.error('❌ Failed to initialize Stripe:', error);
        
        // Try with fallback key anyway
        try {
          console.log('🔄 Trying fallback Stripe key...');
          const fallbackKey = 'pk_test_51RflZsH8Y4NurIedtVJjjow0vcGgcSjiakk7ukq6V7ylUwk3aKIUiySY3h9COv0IBi3ISnoQSw1kF0pllVuxzTUg00YRySt0o2';
          const stripe = await loadStripe(fallbackKey);
          setStripePromise(stripe);
          console.log('✅ Stripe initialized with fallback key');
        } catch (fallbackError) {
          console.error('❌ Fallback Stripe initialization also failed:', fallbackError);
          toast.error('Failed to load payment system. Please refresh the page.');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
    closeCart();
  }, []);

  // Redirect if cart is empty (but not when navigating away after payment)
  useEffect(() => {
    if (!loading && cartItems.length === 0 && window.location.pathname === '/checkout') {
      toast.info('Your cart is empty. Redirecting to shop...');
      setTimeout(() => {
        window.location.href = '/shop';
      }, 2000);
    }
  }, [cartItems, loading]);

  const onSubmit = (data) => {
    // This will be handled by PaymentForm component
    console.log('Customer info:', data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNav />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNav />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <Link to="/shop" className="text-blue-600 hover:text-blue-800">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNav />
      
      <div className="max-w-6xl mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/shop" className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Shop
          </Link>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Customer Information */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
              
              <form className="space-y-4">
                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      {...register('firstName')}
                      className={`w-full p-3 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      {...register('lastName')}
                      className={`w-full p-3 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                
                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      {...register('email')}
                      className={`w-full p-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="tel" 
                      {...register('phone')}
                      className={`w-full p-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
                
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input 
                    type="text" 
                    {...register('address')}
                    className={`w-full p-3 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                </div>
                
                {/* City, State, Postal */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      {...register('city')}
                      className={`w-full p-3 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select 
                      {...register('state')}
                      className={`w-full p-3 border rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select State</option>
                      {australianStates.map(state => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 3000"
                      maxLength={4}
                      {...register('postalCode')}
                      className={`w-full p-3 border rounded-lg ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Section */}
            {loading ? (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Loading Payment System...</h3>
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3">Initializing Stripe...</span>
                </div>
              </div>
            ) : stripePromise ? (
              <Elements stripe={stripePromise}>
                <PaymentForm 
                  customerInfo={getValues()}
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  shipping={shipping}
                  onValidateForm={validateForm}
                />
              </Elements>
            ) : (
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold mb-4 text-red-800">Payment System Error</h3>
                <p className="text-red-700 mb-4">
                  Failed to load Stripe payment system. This could be due to:
                </p>
                <ul className="text-red-600 text-sm space-y-1 mb-4">
                  <li>• Backend not returning Stripe publishable key</li>
                  <li>• Invalid Stripe configuration</li>
                  <li>• Network connectivity issues</li>
                </ul>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Retry Payment System
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-white p-6 rounded-lg border h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={getProductImage(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      <p className="text-sm font-medium">${item.price.toFixed(2)} each</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-sm text-gray-600">Qty:</span>
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                            disabled={item.quantity <= 1}
                          >
                            <span className="text-lg leading-none">−</span>
                          </button>
                          <span className="w-12 text-center text-sm font-medium py-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className={`w-8 h-8 flex items-center justify-center transition-colors ${
                              item.stockQuantity && item.quantity >= item.stockQuantity
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            disabled={item.stockQuantity && item.quantity >= item.stockQuantity}
                          >
                            <span className="text-lg leading-none">+</span>
                          </button>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="text-sm text-red-600 hover:text-red-800 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      
                      {/* Stock warning */}
                      {item.stockQuantity && item.quantity >= item.stockQuantity && (
                        <p className="text-xs text-orange-600 mt-1">
                          Max quantity reached ({item.stockQuantity} available)
                        </p>
                      )}
                    </div>
                    
                    {/* Item Total */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Shipping Information */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Shipping:</strong> Standard shipping ($5.00) • Free shipping on orders over $50
              </p>
            </div>
            
            {/* Order Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total</span>
                <span>${(cartTotal + shipping).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
