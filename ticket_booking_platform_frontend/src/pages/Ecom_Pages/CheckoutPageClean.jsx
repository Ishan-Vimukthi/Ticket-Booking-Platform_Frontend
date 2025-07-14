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

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(1, "Country is required")
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
const PaymentForm = ({ customerInfo, cartItems, cartTotal, shipping, tax, onValidateForm }) => {
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
        shipping,
        tax
      };

      const paymentIntentResult = await stripeService.createPaymentIntent(paymentData);
      
      if (!paymentIntentResult.success) {
        throw new Error(paymentIntentResult.error);
      }

      const { clientSecret } = paymentIntentResult.data;

      // Step 2: Process with Stripe
      console.log('💳 Processing payment with Stripe...');
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
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
              country: validationResult.data.country
            }
          }
        }
      });

      if (error) {
        console.error('❌ Stripe payment error:', error);
        throw new Error(error.message);
      }

      // Step 3: Confirm with Backend
      console.log('✅ Payment successful, confirming with backend...');
      
      const confirmResult = await stripeService.confirmPayment(paymentIntent.id);
      
      if (!confirmResult.success) {
        throw new Error(confirmResult.error);
      }

      // Success!
      console.log('🎉 Order completed successfully!');
      
      toast.success('Payment successful! Order completed.', {
        position: "top-center",
        autoClose: 3000
      });

      // Clear cart and redirect
      clearCart();
      
      // Redirect to order confirmation page
      navigate(`/order-confirmation/${confirmResult.data.orderId}`, {
        state: { orderDetails: confirmResult.data }
      });

    } catch (error) {
      console.error('❌ Payment failed:', error);
      toast.error(`Payment failed: ${error.message}`, {
        position: "top-center",
        autoClose: 5000
      });
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
          `Complete Order • $${(cartTotal + shipping + tax).toFixed(2)}`
        )}
      </button>
    </div>
  );
};

// Main Checkout Component
const CheckoutPage = () => {
  const { cartItems, cartTotal, closeCart } = useCart();
  const [stripePromise, setStripePromise] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Shipping and tax (you can make these dynamic)
  const shipping = cartTotal > 50 ? 0 : 10.00;
  const tax = cartTotal * 0.08; // 8% tax

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
        const configResult = await stripeService.getStripeConfig();
        
        if (configResult.success) {
          const stripe = await loadStripe(configResult.publishableKey);
          setStripePromise(stripe);
          console.log('✅ Stripe initialized successfully');
        } else {
          throw new Error(configResult.error);
        }
      } catch (error) {
        console.error('❌ Failed to initialize Stripe:', error);
        toast.error('Failed to load payment system. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
    closeCart();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && cartItems.length === 0) {
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
                    <input 
                      type="text" 
                      {...register('state')}
                      className={`w-full p-3 border rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input 
                      type="text" 
                      {...register('postalCode')}
                      className={`w-full p-3 border rounded-lg ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
                  </div>
                </div>
                
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select 
                    {...register('country')}
                    className={`w-full p-3 border rounded-lg ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Country</option>
                    <option value="AU">Australia</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                  </select>
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                </div>
              </form>
            </div>

            {/* Payment Section */}
            {stripePromise && (
              <Elements stripe={stripePromise}>
                <PaymentForm 
                  customerInfo={getValues()}
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  shipping={shipping}
                  tax={tax}
                  onValidateForm={validateForm}
                />
              </Elements>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-white p-6 rounded-lg border h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={getProductImage(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
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
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total</span>
                <span>${(cartTotal + shipping + tax).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
