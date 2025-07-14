import { useCart } from '../../../contexts/CartContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getProductImage } from '../../../utils/images';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);

  const handleAddToCart = () => {
    if (product.quantity <= 0) {
      toast.error('Sorry, this item is out of stock', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size first', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }
    // Add only 1 item to cart with selected size
    const cartItem = {
      ...product,
      size: selectedSize,
      cartQuantity: 1  // Explicitly set cart quantity to 1
    };
    
    addToCart(cartItem);
    toast.success('Added to cart!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      className: "!top-16",
      toastClassName: "!mt-4"
    });
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-gray-50">
          <img 
            src={getProductImage(product.image)} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            
            {/* Compact Stock Indicator */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                product.quantity > 10 ? 'bg-green-500' 
                : product.quantity > 5 ? 'bg-yellow-500' 
                : product.quantity > 0 ? 'bg-orange-500' 
                : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-500">
                {product.quantity > 0 ? `${product.quantity}` : '0'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Size Selection */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {product.sizes?.slice(0, 4).map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-8 h-8 text-xs border rounded-lg transition-all ${
                  selectedSize === size 
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
            {product.sizes?.length > 4 && (
              <span className="w-8 h-8 text-xs text-gray-400 flex items-center justify-center">
                +{product.sizes.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          disabled={product.quantity <= 0}
          className={`w-full h-10 text-sm font-medium rounded-lg transition-all ${
            product.quantity <= 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'
          }`}
        >
          {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

ProductCard.defaultProps = {
  product: {
    name: "Electronica Tee",
    price: 18.99,
    image: "tshirt1.jpg",
    sizes: ["S", "M", "L", "XL"],
    quantity: 15
  }
};

export default ProductCard;