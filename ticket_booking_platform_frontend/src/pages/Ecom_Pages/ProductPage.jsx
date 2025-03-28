import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CartContext } from "../../contexts/CartContext";
import ColorSelector from "../../components/ecom_Components/porduct_components/ColorSelector";
import SizeSelector from "../../components/ecom_Components/porduct_components/SizeSelector";
import ShopNav from "../../components/ecom_Components/navigation/ShopNav";

const ProductPage = () => {
  const { id } = useParams(); // Get product ID from URL
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("White");
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  // Fetch product data (mock for now)
  useEffect(() => {
    // Replace with actual API call: fetch(`/api/products/${id}`)
    const mockProduct = {
      id: 1,
      name: "Acid Wash Jagger",
      price: 5100,
      colors: ["White", "Black", "Blue"],
      sizes: ["S", "M", "L", "XL"],
      description: "STEP UP YOUR COMFORT GAME...", // Full description from your reference
      inStock: true,
      image: "/images/tshirt1.jpg",
    };
    setProduct(mockProduct);
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <ShopNav/>
      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Image */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto object-cover"
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
            {/* Color Selector */}
            <ColorSelector
              colors={product.colors}
              selectedColor={selectedColor}
              onSelect={setSelectedColor}
            />

            {/* Size Selector */}
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSelect={setSelectedSize}
            />

            {/* Quantity */}
            <div className="flex items-center space-x-4 mt-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => addToCart({ ...product, selectedColor, selectedSize, quantity })}
              className="w-full bg-black text-white py-3 mt-6 hover:bg-gray-800 transition"
            >
              ADD TO CART
            </button>
          </div>

          {/* Product Description */}
          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>

          {/* Shipping Info */}
          <div className="text-sm text-gray-600 space-y-2">
            <p>Standard shipping (Estimated 3-5 days)</p>
            <p>Payment is 100% secure</p>
            <p>30 days to change your mind!</p>
            <p>Made in Sri Lanka</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;