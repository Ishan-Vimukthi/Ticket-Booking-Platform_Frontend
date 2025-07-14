// Note: In Vite, images in public/ directory are served statically
// We use direct paths instead of imports for public assets

export const productImages = {
  'tshirt1.jpg': '/images/products/tshirt1.jpg',
  'tshirt2.jpg': '/images/products/tshirt2.jpg',
  'tshirt3.png': '/images/products/tshirt3.png',
  'tshirt4.png': '/images/products/tshirt4.png',
  'tshirt5.jpg': '/images/products/tshirt5.jpg',
  'tshirt6.jpg': '/images/products/tshirt6.jpg',
  'tshirt7.jpg': '/images/products/tshirt7.jpg',
  'tshirt8.png': '/images/products/tshirt8.png',
  'tshirt9.png': '/images/products/tshirt9.png',
  'default.jpg': '/images/products/default.jpg'
};

export const getProductImage = (imageName) => {
  if (!imageName) return '/images/products/default.jpg';
  
  // Check if it's already a full URL from backend
  if (imageName.startsWith('http://localhost:3000/uploads/ecom/')) {
    return imageName;
  }
  
  // Check if it's a backend upload path
  if (imageName.startsWith('/uploads/ecom/') || imageName.includes('uploads/ecom/')) {
    // Extract filename and construct full URL
    const filename = imageName.split('/').pop();
    return `http://localhost:3000/uploads/ecom/${filename}`;
  }
  
  // Check if it's any other absolute path
  if (imageName.startsWith('http') || imageName.startsWith('/')) {
    return imageName;
  }
  
  // For backwards compatibility with static images
  return productImages[imageName] || '/images/products/default.jpg';
};

export const heroBg = '/images/hero-bg.png';
export const defaultImage = '/images/products/default.jpg';