import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

const CartDrawer = ({ onNavigate }) => {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      // 1. Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
        closeCart();
        onNavigate('login');
        return;
      }

      // 2. Fetch user's default address
      const userId = session.user.id;
      const { data: address } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      let shippingAddressId = address?.id;

      if (!shippingAddressId) {
        // Fallback to any address
        const { data: anyAddress } = await supabase
          .from('addresses')
          .select('id')
          .eq('user_id', userId)
          .limit(1)
          .single();
          
        if (anyAddress) {
          shippingAddressId = anyAddress.id;
        } else {
          alert('กรุณาเพิ่มที่อยู่จัดส่งในหน้าบัญชีของคุณก่อนทำการสั่งซื้อ');
          closeCart();
          onNavigate('portal');
          return;
        }
      }

      // 3. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          total_amount: cartTotal,
          status: 'pending',
          payment_status: 'pending',
          shipping_address_id: shippingAddressId
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 4. Create Order Items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 5. Success
      alert('สั่งซื้อสินค้าสำเร็จ! กรุณารอการติดต่อกลับเพื่อชำระเงิน');
      clearCart();
      closeCart();
      onNavigate('portal');

    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + error.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-primary-500" /> ตะกร้าสินค้า
          </h2>
          <button 
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag size={64} className="text-gray-200" />
              <p className="font-medium text-gray-500">ไม่มีสินค้าในตะกร้า</p>
              <button 
                onClick={closeCart}
                className="text-primary-600 font-bold hover:underline"
              >
                เลือกซื้อสินค้าต่อ
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                    <img 
                      src={item.product.image_url} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 pr-4">{item.product.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors mt-0.5"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-primary-600 font-bold text-sm mb-auto">฿{item.product.price.toLocaleString()}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/80">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">ยอดรวมทั้งสิ้น</span>
              <span className="text-2xl font-bold text-gray-900">฿{cartTotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
            >
              {checkingOut ? 'กำลังดำเนินการ...' : (
                <>ยืนยันการสั่งซื้อ <ArrowRight size={20} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
