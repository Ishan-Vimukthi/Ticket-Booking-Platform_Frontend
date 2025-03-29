const ColorSelector = ({ colors, selectedColor, onSelect }) => (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Color {selectedColor}</h3>
      <div className="flex space-x-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={`w-8 h-8 rounded-full border-2 ${
              selectedColor === color ? "border-black" : "border-transparent"
            }`}
            style={{ backgroundColor: color.toLowerCase() }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
  export default ColorSelector;