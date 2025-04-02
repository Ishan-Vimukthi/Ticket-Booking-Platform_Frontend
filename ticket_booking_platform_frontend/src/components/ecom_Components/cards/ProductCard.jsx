import { useCart } from '../../../contexts/CartContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);

  const handleAddToCart = () => {
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
    addToCart({ ...product, size: selectedSize });
    toast.success('Added to cart!', {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    className:"!top-16",
    toastClassName:"!mt-4"
  });
  };


  return (
    
      <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <Link to={`/product/${product.id}`} className="block group">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
          />
        </div>
        </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        {/* Color Variant */}
        <div className="flex items-center mb-2">
          <span className="text-sm text-gray-500">Color:</span>
          <span className="ml-2 text-sm font-medium text-gray-700">
            {product.color || 'Gray'}
          </span>
        </div>

        {/* Size Selection */}
        <div className="mb-3">
          <span className="text-sm text-gray-500">Size:</span>
          <div className="flex space-x-2 mt-1">
            {product.sizes?.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1 text-sm border rounded-md ${
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

        {/* Price */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">
              LKR {product.price.toLocaleString()}
            </span>
          </div>
          
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.defaultProps = {
  product: {
    name: "Knitted Oversize Sweatpant",
    price: 3960.00,
    image: "/images/tshirt1.jpg",
    color: "Gray",
    sizes: ["S", "M", "L", "XL"] // Add default sizes
  }
};

export default ProductCard;