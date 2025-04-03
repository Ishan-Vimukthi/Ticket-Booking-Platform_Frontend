import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import ShopNav from '../../components/ecom_Components/navigation/ShopNav';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getProductImage } from '../../utils/images';

const checkoutSchema = z.object({
  state: z.string().min(1, "State/Region is required"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  landmark: z.string().optional(),
  city: z.string().min(1, "City is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
  billingSameAsShipping: z.boolean(),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  saveInfo: z.boolean()
});

const australianStates = [
  "New South Wales",
  "Victoria",
  "Queensland", 
  "Western Australia",
  "South Australia",
  "Tasmania"
];

const CheckoutPage = () => {
  const { cartItems, cartTotal, closeCart } = useCart();
  
  useEffect(() => {
    closeCart();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      billingSameAsShipping: true,
      saveInfo: false,
    }
  });

  const billingSameAsShipping = watch('billingSameAsShipping');

  const onSubmit = (data) => {
    console.log('Form submitted:', data);
    // Process checkout here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNav />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Delivery Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              
              {/* State/Region */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">State / Region</label>
                <select 
                  {...register('state')}
                  className={`w-full p-2 border rounded ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select your state</option>
                  {australianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
              </div>
              
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    {...register('firstName')}
                    className={`w-full p-2 border rounded ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    {...register('lastName')}
                    className={`w-full p-2 border rounded ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                </div>
              </div>
              
              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  {...register('email')}
                  className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              
              {/* Address */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Address</label>
                <input 
                  type="text" 
                  placeholder="Street address"
                  {...register('address')}
                  className={`w-full p-2 border rounded mb-2 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                />
                <input 
                  type="text" 
                  placeholder="Landmark, suite, etc (Optional)"
                  {...register('landmark')}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
              </div>
              
              {/* City and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">City</label>
                  <input 
                    type="text" 
                    {...register('city')}
                    className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    {...register('phone')}
                    className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              
              {/* Billing Address */}
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Billing Address</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      {...register('billingSameAsShipping')}
                      value="true"
                      className="mr-2"
                      checked={billingSameAsShipping}
                    />
                    Same as shipping address
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      {...register('billingSameAsShipping')}
                      value="false"
                      className="mr-2"
                      checked={!billingSameAsShipping}
                    />
                    Use a different billing address
                  </label>
                </div>
                
                {!billingSameAsShipping && (
                  <div className="mt-4 space-y-4">
                    <input 
                      type="text" 
                      placeholder="Billing Address" 
                      {...register('billingAddress')}
                      className={`w-full p-2 border rounded ${errors.billingAddress ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.billingAddress && <p className="text-red-500 text-sm mt-1">{errors.billingAddress.message}</p>}
                    <input 
                      type="text" 
                      placeholder="Billing City" 
                      {...register('billingCity')}
                      className={`w-full p-2 border rounded ${errors.billingCity ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.billingCity && <p className="text-red-500 text-sm mt-1">{errors.billingCity.message}</p>}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="mb-6 border-b pb-4">
                <h3 className="text-lg font-medium mb-3">Your Items</h3>
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.size}`} className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={getProductImage(item.image)} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.size && `Size: ${item.size}`}
                          {item.quantity && ` • Qty: ${item.quantity}`}
                        </div>
                      </div>
                      <div className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Order Total */}
              <div className="border-b pb-4 mb-6">
                <div className="flex justify-between py-2">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Save Info */}
              <label className="flex items-center mb-6">
                <input 
                  type="checkbox" 
                  {...register('saveInfo')}
                  className="mr-2"
                />
                <span>Save this information for next time</span>
              </label>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="block w-full bg-black text-white text-center py-3 rounded font-medium hover:bg-gray-800 transition"
              >
                CONTINUE TO CHECKOUT
              </button>
              
              {/* Back to shop link */}
              <Link 
                to="/shop" 
                className="block text-center mt-4 text-gray-600 hover:text-black transition"
              >
                <span className="flex items-center justify-center">
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Continue Shopping
                </span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;