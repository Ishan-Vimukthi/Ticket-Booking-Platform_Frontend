import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  productCode: string;
  description: string;
  images: string[];
}

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-lg max-w-4xl w-full mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-semibold">Product Details</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="Close product details"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Image carousel */}
            <div className="relative h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden">
              {product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />

                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={goToNextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 p-2 rounded-full"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>

                      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                        {product.images.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full ${currentImageIndex === idx ? 'bg-indigo-600' : 'bg-gray-300'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No images available
                </div>
              )}
            </div>

            {/* Product details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{product.name}</h2>
                <p className="text-gray-600">Product Code: {product.productCode}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1">{product.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductDetailModal;
