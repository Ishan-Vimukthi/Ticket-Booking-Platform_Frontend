import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  productCode: string;
  description: string;
  images: string[];
}

interface Stock {
  _id: string;
  product: Product;
  batchNumber: string;
  quantity: number;
  size: string;
  price: number;
  lowStockAlert: number;
  lastRestocked: string;
  supplier: string;
}

interface OrderItem {
  _id: string;
  stock: Stock;
  quantity: number;
}

interface ProductModalProps {
  isOpen: boolean;
  products: OrderItem[];
  currentProductIndex: number;
  currentImageIndex: number;
  onClose: () => void;
  goToNextProduct: (e: React.MouseEvent) => void;
  goToPrevProduct: (e: React.MouseEvent) => void;
  goToNextImage: (e: React.MouseEvent) => void;
  goToPrevImage: (e: React.MouseEvent) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  products,
  currentProductIndex,
  currentImageIndex,
  onClose,
  goToNextProduct,
  goToPrevProduct,
  goToNextImage,
  goToPrevImage
}) => {
  return (
    <AnimatePresence>
      {isOpen && products.length > 0 && (
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
              <h3 className="text-xl font-semibold">
                Order Products ({currentProductIndex + 1}/{products.length})
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full"
                aria-label="Close product details"
              >
                <X size={20} />
              </button>
            </div>

            {products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Image carousel */}
                <div className="relative h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden">
                  {products[currentProductIndex]?.stock.product.images.length > 0 ? (
                    <>
                      <img
                        src={products[currentProductIndex].stock.product.images[currentImageIndex]}
                        alt={products[currentProductIndex].stock.product.name}
                        className="w-full h-full object-contain"
                      />

                      {products[currentProductIndex].stock.product.images.length > 1 && (
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
                            {products[currentProductIndex].stock.product.images.map((_, idx) => (
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
                    <h2 className="text-2xl font-bold">{products[currentProductIndex]?.stock.product.name}</h2>
                    <p className="text-gray-600">Product Code: {products[currentProductIndex]?.stock.product.productCode}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="mt-1">${(products[currentProductIndex]?.stock.price / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="mt-1">{products[currentProductIndex]?.quantity}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1">{products[currentProductIndex]?.stock.product.description}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Batch Number</p>
                    <p className="mt-1">{products[currentProductIndex]?.stock.batchNumber}</p>
                  </div>
                </div>
              </div>
            )}

            {products.length > 1 && (
              <div className="flex justify-between items-center p-4 border-t">
                <button
                  onClick={goToPrevProduct}
                  className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Previous Item
                </button>
                <div className="text-sm text-gray-500">
                  {currentProductIndex + 1} of {products.length}
                </div>
                <button
                  onClick={goToNextProduct}
                  className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Next Item
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
