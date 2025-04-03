import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import SizeSelector from "../../components/ecom_Components/porduct_components/SizeSelector";
import ShopNav from "../../components/ecom_Components/navigation/ShopNav";
import CartSlider from "../../components/ecom_Components/cart/CartSlider";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from "../../components/Footer";

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart, cartItems, setCartItems } = useCart(); // Added setCartItems from useCart
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const mockProduct = {
      id: 1,
      name: "Acid Wash Jagger",
      price: 5100,
      sizes: ["S", "M", "L", "XL"],
      description: "STEP UP YOUR COMFORT GAME...",
      inStock: true,
      image: "/images/tshirt1.jpg",
    };
    setProduct(mockProduct);
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size first', {
        position: "top-right",
        autoClose: 3000,
        style: { marginTop: '4rem' }
      });
      return;
    }
    addToCart({ ...product, selectedSize, quantity });
    toast.success('Added to cart!', {
      position: "top-right",
      autoClose: 2000,
      style: { marginTop: '4rem' }
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size first', {
        position: "top-right",
        autoClose: 3000,
        style: { marginTop: '4rem' }
      });
      return;
    }
    
    // Check if product with same ID and size already exists in cart
    const existingItemIndex = cartItems.findIndex(
      item => item.id === product.id && item.size === selectedSize
    );
    
    if (existingItemIndex >= 0) {
      // If item exists, update its quantity to the current selected quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: quantity
      };
      setCartItems(updatedItems);
    } else {
      // If item doesn't exist, add it with the selected quantity
      addToCart({ ...product, selectedSize, quantity });
    }
    
    navigate('/checkout');
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNav />
      <CartSlider />
      <ToastContainer />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Column: Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl">Rs {product.price.toLocaleString()}</p>
            <p className="text-gray-600">
              or a payment of Rs {(product.price / 3).toLocaleString()} with <br />
              <span className="font-semibold">return</span> or <span className="font-semibold">1000</span>
            </p>

            <div className="border-t border-b border-gray-200 py-4">
              {/* Size Selector */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center space-x-4 mt-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    -
                  </button>
                  <span className="px-4 py-1">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-black text-white py-3 hover:bg-gray-800 transition rounded-md font-medium"
                >
                  ADD TO CART
                </button>
                
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-blue-600 text-white py-3 hover:bg-blue-700 transition rounded-md font-medium"
                >
                  BUY NOW
                </button>
              </div>
            </div>

            <div className="prose max-w-none">
              <p>{product.description}</p>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>Standard shipping (Estimated 3-5 days)</p>
              <p>Payment is 100% secure</p>
              <p>30 days to change your mind!</p>
              <p>Made in Sri Lanka</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;