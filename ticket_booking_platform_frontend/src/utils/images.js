import tshirt1 from '../../public/images/products/tshirt1.jpg';
import tshirt2 from '../../public/images/products/tshirt2.jpg';
import tshirt3 from '../../public/images/products/tshirt3.png';
import tshirt4 from '../../public/images/products/tshirt4.png';
import tshirt5 from '../../public/images/products/tshirt5.jpg';
import tshirt6 from '../../public/images/products/tshirt6.jpg';
import tshirt7 from '../../public/images/products/tshirt7.jpg';
import tshirt8 from '../../public/images/products/tshirt8.png';
import tshirt9 from '../../public/images/products/tshirt9.png';
import defaultImage from '../../public/images/products/default.jpg';
import heroBg from '../../public/images/hero-bg.png';

export const productImages = {
  'tshirt1.jpg': tshirt1,
  'tshirt2.jpg': tshirt2,
  'tshirt3.png': tshirt3,
  'tshirt4.png': tshirt4,
  'tshirt5.jpg': tshirt5,
  'tshirt6.jpg': tshirt6,
  'tshirt7.jpg': tshirt7,
  'tshirt8.png': tshirt8,
  'tshirt9.png': tshirt9,
  'default.jpg': defaultImage
};

export const getProductImage = (imageName) => {
  if (!imageName) return defaultImage;
  return productImages[imageName] || defaultImage;
};

export { heroBg, defaultImage };