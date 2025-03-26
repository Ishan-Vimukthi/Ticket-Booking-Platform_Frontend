const ProductCard = ({ product }) => {
    return (
      <div className="border rounded-lg shadow-lg p-4 w-64 bg-white hover:shadow-xl transition-shadow duration-300">
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md" />
        <h3 className="text-lg font-semibold mt-3 text-gray-800">{product.name}</h3>
        <p className="text-gray-500">${product.price}</p>
        <button className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all">
          Add to Cart
        </button>
      </div>
    );
  };
  const product = {
    name: "Classic T-Shirt",
    price: 19.99,
    image: "/images/tshirt1.jpg",
  };
  
  export default ProductCard;
  