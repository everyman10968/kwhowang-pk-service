import React, { useState } from 'react';
import { X, ShoppingCart, Minus, Plus, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetailModal = ({ product, onClose }) => {
  const [mainImage, setMainImage] = useState(product.image_url);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  if (!product) return null;

  // Combine main image and gallery images for the thumbnail list
  const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean);

  const handleAddToCart = () => {
    // Add product to cart with the specified quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    // Show success feedback
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-dark/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Left: Image Gallery */}
        <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col">
          {/* Main Image */}
          <div className="w-full aspect-square rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm mb-4 flex items-center justify-center">
            <img 
              src={mainImage} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain p-4"
            />
          </div>
          
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${mainImage === img ? 'border-primary-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100 bg-white'}`}
                >
                  <img src={img} alt={`${product.name} - มุมมอง ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
          {product.categories && (
            <span className="text-primary-600 font-bold text-sm mb-2 block">{product.categories.name}</span>
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{product.name}</h2>
          
          <div className="text-3xl font-bold text-primary-600 mb-6">
            ฿{product.price.toLocaleString()}
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-sm text-gray-600 leading-relaxed whitespace-pre-line border border-gray-100">
            {product.description || 'ไม่มีรายละเอียดเพิ่มเติมสำหรับสินค้านี้'}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-700 font-medium">สถานะสินค้า:</span>
              {product.stock_quantity > 0 ? (
                <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                  มีสินค้า (เหลือ {product.stock_quantity} ชิ้น)
                </span>
              ) : (
                <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-sm">สินค้าหมด</span>
              )}
            </div>

            {product.stock_quantity > 0 && (
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between border-2 border-gray-200 rounded-xl px-4 py-3 sm:w-1/3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="font-bold text-lg w-12 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-lg transition-all ${
                    isAdded 
                      ? 'bg-green-500 text-white' 
                      : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30'
                  }`}
                >
                  {isAdded ? (
                    <><CheckCircle2 size={24} /> เพิ่มลงตะกร้าแล้ว</>
                  ) : (
                    <><ShoppingCart size={24} /> เพิ่มลงตะกร้า</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
