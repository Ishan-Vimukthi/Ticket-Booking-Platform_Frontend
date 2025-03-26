import React, { useState } from "react";
import ProductCard from "../components/ecom_components/cards/ProductCard";
import ShopNav from "../components/ecom_components/navigation/ShopNav";

const products = [
  {
    id: 1,
    name: "Men's Premium Jacket",
    price: 89.99,
    image: "/images/tshirt1.jpg",
    category: "men",
    rating: 4.5,
    colors: ["black", "navy", "olive"],
  },
  {
    id: 2,
    name: "Women's Summer Dress",
    price: 49.99,
    image: "https://via.placeholder.com/300",
    category: "women",
    rating: 4.2,
    colors: ["red", "white", "blue"],
  },
  // Add 6-8 more products
  {
    id: 3,
    name: "Unisex Sneakers",
    price: 65.99,
    image: "https://via.placeholder.com/300",
    category: "footwear",
    rating: 4.7,
    colors: ["white", "black"],
  },
  {
    id: 4,
    name: "Wireless Headphones",
    price: 129.99,
    image: "https://via.placeholder.com/300",
    category: "electronics",
    rating: 4.8,
    colors: ["black", "silver"],
  },
];

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation with search */}
      <ShopNav onSearch={setSearchQuery} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
          <p className="text-gray-600 mt-2">
            {filteredProducts.length} products available
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className="transform hover:-translate-y-1 transition-all duration-200"
            />
          ))}
        </div>

        {/* Empty State */}
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
    </div>
  );
};

export default Shop;