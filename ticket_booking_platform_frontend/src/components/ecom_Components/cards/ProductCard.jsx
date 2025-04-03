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
      className: "!top-16",
      toastClassName: "!mt-4"
    });
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <Link to={`/product/${product.id}`} className="block group">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img 
            src={getProductImage(product.image)} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">
          {product.name}
        </h3>
        
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

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          
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
    name: "Electronica Tee",
    price: 18.99,
    image: "tshirt1.jpg",
    sizes: ["S", "M", "L", "XL"]
  }
};

export default ProductCard;