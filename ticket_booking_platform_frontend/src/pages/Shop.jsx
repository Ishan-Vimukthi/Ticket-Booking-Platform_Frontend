import React, { useState } from "react";
import ProductCard from "../components/ecom_Components/cards/ProductCard";
import ShopNav from "../components/ecom_Components/navigation/ShopNav";
import Footer from "../components/Footer";
import CartSlider from "../components/ecom_Components/cart/CartSlider";
import { getProductImage } from "../utils/images";
import { heroBg, defaultImage } from "../utils/images";

const products = [
  {
    id: 1,
    name: "Men's Premium Jacket",
    price: 89.99,
    image: "tshirt1.jpg",
    category: "men",
    rating: 4.5,
    colors: ["black", "navy", "olive"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 2,
    name: "Women's Summer Dress",
    price: 49.99,
    image: "tshirt2.jpg",
    category: "women",
    rating: 4.2,
    colors: ["red", "white", "blue"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 3,
    name: "Unisex Sneakers",
    price: 65.99,
    image: "tshirt3.png",
    category: "footwear",
    rating: 4.7,
    colors: ["white", "black"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 4,
    name: "Wireless Headphones",
    price: 129.99,
    image: "tshirt4.png",
    category: "electronics",
    rating: 4.8,
    colors: ["black", "silver"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 5,
    name: "oversized tee",
    price: 100.99,
    image: "tshirt5.jpg",
    category: "electronics",
    rating: 4.8,
    colors: ["black", "silver"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 6,
    name: "oversized tee",
    price: 100.99,
    image: "tshirt6.jpg",
    category: "electronics",
    rating: 4.8,
    colors: ["black", "silver"],
    sizes: ["S", "M", "L", "XL"]
  }
];

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) => {
    if (!product || !product.name) return false;
    const query = typeof searchQuery === 'string' ? searchQuery.toLowerCase() : '';
    const productName = product.name.toLowerCase();
    return productName.includes(query);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopNav onSearch={setSearchQuery} />
      <CartSlider />

      <div className="relative h-[80vh] bg-gray-900 overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-70"
            src={heroBg}
            alt="BigIdea hero"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
          <div className="absolute inset-0 bg-gray-900 mix-blend-multiply"></div>
        </div>
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            WHEREVER & WHENEVER
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8">
            BRAND OF YOUR LIFESTYLE
          </p>
          <button className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105">
            Shop Collection
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
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