import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import ShopNav from "../../components/ecom_Components/navigation/ShopNav";
import CartSlider from "../../components/ecom_Components/cart/CartSlider";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from "../../components/Footer";
import { getProductImage } from '../../utils/images';
import { productService } from '../../services/ecom_admin/productService';

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('🔍 ProductPage: Fetching product with ID:', id);
        setLoading(true);
        
        // Get all products and find the one with matching ID
        const result = await productService.getAllProducts();
        
        if (result.success) {
          const foundProduct = result.data.find(p => p._id === id);
          
          if (foundProduct) {
            console.log('✅ ProductPage: Product found:', foundProduct);
            setProduct(foundProduct);
          } else {
            console.log('❌ ProductPage: Product not found with ID:', id);
            toast.error('Product not found');
            navigate('/shop');
          }
        } else {
          console.error('❌ ProductPage: Failed to fetch products:', result.error);
          toast.error('Failed to load product');
          navigate('/shop');
        }
      } catch (error) {
        console.error('❌ ProductPage: Error fetching product:', error);
        toast.error('Error loading product');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size first', {
        position: "top-center",
        autoClose: 3000,
        style: { marginTop: '4rem' }
      });
      return;
    }

    if (product.quantity <= 0) {
      toast.error('Sorry, this item is out of stock', {
        position: "top-center",
        autoClose: 3000,
        style: { marginTop: '4rem' }
      });
      return;
    }

    // Create cart item with proper structure
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/images/products/default.jpg',
      sizes: product.sizes || [],
      colors: product.colors || [],
      description: product.description,
      quantity: product.quantity, // Stock quantity for validation
      size: selectedSize,
      cartQuantity: quantity  // The amount to add to cart
    };
    
    addToCart(cartItem);
    
    toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`, {
      position: "top-right",
      autoClose: 2000,
      style: { marginTop: '4rem' }
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size first', {
        position: "top-center",
        autoClose: 3000,
        style: { marginTop: '4rem' }
      });
      return;
    }

    if (product.quantity <= 0) {
      toast.error('Sorry, this item is out of stock', {
        position: "top-center",
        autoClose: 3000,
        style: { marginTop: '4rem' }
      });
      return;
    }

    // Add to cart and navigate to checkout
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/images/products/default.jpg',
      sizes: product.sizes || [],
      colors: product.colors || [],
      description: product.description,
      quantity: product.quantity, // Stock quantity for validation
      size: selectedSize,
      cartQuantity: quantity  // Add selected quantity
    };
    
    addToCart(cartItem);
    
    toast.success('Added to cart! Redirecting to checkout...', {
      position: "top-right",
      autoClose: 1500,
      style: { marginTop: '4rem' }
    });
    
    // Navigate to checkout after short delay
    setTimeout(() => {
      navigate('/checkout');
    }, 1500);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    
    // Limit quantity to available stock
    if (product && newQuantity > product.quantity) {
      toast.warning(`Only ${product.quantity} items available in stock`, {
        position: "top-center",
        autoClose: 2000,
        style: { marginTop: '4rem' }
      });
      setQuantity(product.quantity);
      return;
    }
    
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNav />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopNav />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <button
              onClick={() => navigate('/shop')}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Back to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ShopNav />
      <CartSlider />
      <ToastContainer />
      
      <div className="max-w-6xl mx-auto px-4 py-8 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              <img
                src={getProductImage(product.images?.[0] || '/images/products/default.jpg')}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-light text-gray-900">{product.name}</h1>
              <div className="flex items-center space-x-3">
                <p className="text-2xl font-medium text-gray-900">${product.price?.toFixed(2) || '0.00'}</p>
                
                {/* Compact Stock Indicator */}
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    product.quantity > 10 ? 'bg-green-500' 
                    : product.quantity > 5 ? 'bg-yellow-500' 
                    : product.quantity > 0 ? 'bg-orange-500' 
                    : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                {product.description}
              </p>
            )}

            {/* Size Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border rounded-lg text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors (if available) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900">Colors</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.slice(0, 4).map((color) => (
                    <span
                      key={color}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {color}
                    </span>
                  ))}
                  {product.colors.length > 4 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                      +{product.colors.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900">Quantity</label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <span className="text-lg">−</span>
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className={`w-10 h-10 flex items-center justify-center transition-colors ${
                      product.quantity && quantity >= product.quantity
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'hover:bg-gray-50'
                    }`}
                    disabled={product.quantity && quantity >= product.quantity}
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
                {product.quantity && quantity >= product.quantity && (
                  <span className="text-xs text-orange-600">Max quantity reached</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
                className={`w-full h-12 rounded-lg font-medium transition-all ${
                  product.quantity <= 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'
                }`}
              >
                {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={product.quantity <= 0}
                className={`w-full h-12 rounded-lg font-medium transition-all ${
                  product.quantity <= 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
              >
                {product.quantity <= 0 ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <span>🚚</span>
                  <span>Free shipping over $50</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>↩️</span>
                  <span>14-day returns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🔒</span>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📦</span>
                  <span>3-5 day delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductPage;