const SizeSelector = ({ sizes, selectedSize, onSelect }) => (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Size</h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelect(size)}
            className={`px-4 py-2 border rounded ${
              selectedSize === size ? "bg-black text-white border-black" : "border-gray-300"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
  export default SizeSelector;