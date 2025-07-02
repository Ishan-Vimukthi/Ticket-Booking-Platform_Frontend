import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import ShopNav from "../../components/ecom_Components/navigation/ShopNav";
import CartSlider from "../../components/ecom_Components/cart/CartSlider";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from "../../components/Footer";
import { getProductImage } from '../../utils/images';

// Import or define your products array (should match the one in Shop.js)
const products = [
  {
    id: 1,
    name: "Electronica Tee",
    price: 18.99,
    image: "tshirt1.jpg",
    category: "men",
    rating: 4.5,
    sizes: ["S", "M", "L", "XL"],
    description: "Premium quality t-shirt with unique electronic design"
  },
  {
    id: 2,
    name: "Classic Tee - White",
    price: 14.99,
    image: "tshirt2.jpg",
    category: "women",
    rating: 4.2,
    sizes: ["S", "M", "L", "XL"],
    description: "Classic white t-shirt for everyday wear"
  },
  {
    id: 3,
    name: "Moss Green - Earth",
    price: 16.50,
    image: "tshirt3.png",
    category: "unisex",
    rating: 4.7,
    sizes: ["S", "M", "L", "XL"],
    description: "Eco-friendly t-shirt in soothing moss green"
  },
  {
    id: 4,
    name: "Transmission Tee",
    price: 19.99,
    image: "tshirt4.png",
    category: "unisex",
    rating: 4.8,
    sizes: ["S", "M", "L", "XL"],
    description: "Graphic t-shirt with transmission-inspired design"
  },
  {
    id: 5,
    name: "Coast Tee",
    price: 15.75,
    image: "tshirt5.jpg",
    category: "unisex",
    rating: 4.3,
    sizes: ["S", "M", "L", "XL"],
    description: "Relaxed fit t-shirt perfect for coastal vibes"
  },
  {
    id: 6,
    name: "Culture Tree",
    price: 17.25,
    image: "tshirt6.jpg",
    category: "unisex",
    rating: 4.6,
    sizes: ["S", "M", "L", "XL"],
    description: "Cultural inspired design on comfortable fabric"
  },
  {
    id: 7,
    name: "Down Beat tee",
    price: 17.00,
    image: "tshirt7.jpg",
    category: "unisex",
    rating: 4.6,
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 8,
    name: "living in stereo",
    price: 20.00,
    image: "tshirt8.png",
    category: "unisex",
    rating: 4.6,
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 9,
    name: "Studio tee",
    price: 15.00,
    image: "tshirt9.png",
    category: "unisex",
    rating: 4.6,
    sizes: ["S", "M", "L", "XL"]
  }
];

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart, cartItems, setCartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Find the product with matching ID
    const foundProduct = products.find(p => p.id === parseInt(id));
    
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Handle case where product isn't found
      navigate('/shop'); // Redirect to shop page or show error
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size first', {
        position: "top-right",
        autoClose: 3000,
        style: { marginTop: '4rem' }
      });
      return;
    }
    addToCart({ ...product, size: selectedSize, quantity });
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
    
    const existingItemIndex = cartItems.findIndex(
      item => item.id === product.id && item.size === selectedSize
    );
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: quantity
      };
      setCartItems(updatedItems);
    } else {
      addToCart({ ...product, size: selectedSize, quantity });
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
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={getProductImage(product.image)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl">${product.price.toFixed(2)}</p>

            <div className="border-t border-b border-gray-200 py-4">
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
              <p>14 days to change your mind!</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;