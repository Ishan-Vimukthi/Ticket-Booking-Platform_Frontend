import React, { useState, useRef } from "react";
import ProductCard from "../components/ecom_Components/cards/ProductCard";
import ShopNav from "../components/ecom_Components/navigation/ShopNav";
import Footer from "../components/Footer";
import CartSlider from "../components/ecom_Components/cart/CartSlider";
import { getProductImage } from "../utils/images";
import { heroBg, defaultImage } from "../utils/images";
import { ToastContainer } from "react-toastify";

const products = [
  {
    id: 1,
    name: "Electronica Tee",
    price: 18.99,
    image: "tshirt1.jpg",
    category: "men",
    rating: 4.5,
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 2,
    name: "Classic Tee - White",
    price: 14.99,
    image: "tshirt2.jpg",
    category: "women",
    rating: 4.2,
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 3,
    name: "Moss Green - Earth",
    price: 16.50,
    image: "tshirt3.png",
    category: "unisex",
    rating: 4.7,
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 4,
    name: "Transmission Tee",
    price: 19.99,
    image: "tshirt4.png",
    category: "unisex",
    rating: 4.8,
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 5,
    name: "Coast Tee",
    price: 15.75,
    image: "tshirt5.jpg",
    category: "unisex",
    rating: 4.3,
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 6,
    name: "Culture Tree",
    price: 17.25,
    image: "tshirt6.jpg",
    category: "unisex",
    rating: 4.6,
    sizes: ["S", "M", "L", "XL"]
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

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const productsSectionRef = useRef(null);

  const filteredProducts = products.filter((product) => {
    if (!product || !product.name) return false;
    const query = typeof searchQuery === 'string' ? searchQuery.toLowerCase() : '';
    const productName = product.name.toLowerCase();
    return productName.includes(query);
  });

  const handleShopCollectionClick = () => {
    productsSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNav onSearch={setSearchQuery} />
      <CartSlider />
      <ToastContainer/>

      <div className="relative h-[80vh] overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src={heroBg}
            alt="Music event background"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
        </div>
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-8">
            CURATED SOUNDSCAPES
          </h1>
          <button 
            onClick={handleShopCollectionClick}
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 mt-4"
          >
            Shop Collection
          </button>
        </div>
      </div>

      <main ref={productsSectionRef} className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
          <p className="text-gray-600 mt-2">
            {filteredProducts.length} products available
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className="transform hover:-translate-y-1 transition-all duration-200"
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-500">
              No products found
            </h3>
            <p className="text-gray-400 mt-2">
              Try searching for something else
            </p>
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
};

export default Shop;