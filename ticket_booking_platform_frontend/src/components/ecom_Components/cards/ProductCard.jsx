import { useCart } from '../../../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Product Image */}
      <div className="aspect-square overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
        />
      </div>

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

        {/* Price */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">
              LKR {product.price.toLocaleString()}
            </span>
          </div>
          
          {/* Add to Cart Button */}
          <button 
          onClick={() => addToCart(product)}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200">
          Add to Cart
        </button>
        </div>
      </div>
    </div>
  );
};

// Default product data (for storybook/demo purposes)
ProductCard.defaultProps = {
  product: {
    name: "Knitted Oversize Sweatpant",
    price: 3960.00,
    image: "/images/tshirt1.jpg",
    color: "Gray"
  }
};

export default ProductCard;