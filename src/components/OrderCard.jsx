import React, { useState } from 'react';
import { Package, Truck, CheckCircle2, Upload, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

const OrderCard = ({ order, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${order.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('payment_slips')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('payment_slips')
        .getPublicUrl(filePath);

      const slipUrl = publicUrlData.publicUrl;

      // 3. Update Order record
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_slip_url: slipUrl,
          payment_status: 'checking' // Optional: changing status to 'checking'
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      alert('แนบสลิปชำระเงินเรียบร้อยแล้ว กรุณารอแอดมินตรวจสอบ');
      setFile(null);
      if (onUpdate) onUpdate();

    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการอัปโหลด: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Determine active step
  // pending -> step 1
  // checking (custom status from our UI) -> step 2
  // paid / shipped -> step 3
  // completed -> step 4
  const getStepNumber = () => {
    if (order.status === 'completed') return 4;
    if (order.status === 'shipped') return 3;
    if (order.status === 'paid' || order.payment_status === 'checking' || order.payment_slip_url) return 2;
    return 1;
  };

  const currentStep = getStepNumber();
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:border-primary-200 transition-colors">
      {/* Header */}
      <div 
        className="p-5 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <span className="text-sm font-bold text-gray-900">ออเดอร์ #ORD-{order.id.toString().padStart(5, '0')}</span>
          <span className="block text-xs text-gray-500 mt-1">วันที่สั่งซื้อ: {new Date(order.created_at).toLocaleDateString('th-TH')}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-xs text-gray-500">ยอดสุทธิ</span>
            <span className="text-lg font-bold text-primary-600">฿{order.total_amount.toLocaleString()}</span>
          </div>
          {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-5 border-t border-gray-100">
          
          {/* Timeline */}
          {!isCancelled ? (
            <div className="mb-8">
              <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 z-0 rounded-full"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 z-0 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep - 1) * 33.33}%` }}
                ></div>

                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <CreditCard size={16} />
                  </div>
                  <span className={`text-xs mt-2 font-bold ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>รอชำระเงิน</span>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className={`text-xs mt-2 font-bold ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>ตรวจสอบยอด</span>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <Truck size={16} />
                  </div>
                  <span className={`text-xs mt-2 font-bold ${currentStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>กำลังจัดส่ง</span>
                </div>

                {/* Step 4 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 4 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <Package size={16} />
                  </div>
                  <span className={`text-xs mt-2 font-bold ${currentStep >= 4 ? 'text-primary-600' : 'text-gray-400'}`}>สำเร็จ</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-center border border-red-100">
              ออเดอร์นี้ถูกยกเลิกแล้ว
            </div>
          )}

          {/* Payment Section (Only show if Step 1) */}
          {currentStep === 1 && !isCancelled && (
            <div className="mb-6 bg-orange-50 border border-orange-100 rounded-xl p-5">
              <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                <CreditCard size={18} /> กรุณาชำระเงินเพื่อดำเนินการต่อ
              </h4>
              <div className="bg-white p-4 rounded-lg mb-4 text-sm border border-orange-100 shadow-sm">
                <p className="font-bold text-gray-900 mb-1">ธนาคารกสิกรไทย</p>
                <p className="text-gray-600">เลขที่บัญชี: <span className="font-bold text-primary-600 text-lg ml-2">123-4-56789-0</span></p>
                <p className="text-gray-600">ชื่อบัญชี: บจก. พีเค เครื่องมือช่าง</p>
                <p className="text-gray-600 mt-2 font-bold">ยอดที่ต้องชำระ: ฿{order.total_amount.toLocaleString()}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <button 
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full sm:w-auto shrink-0 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-full font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isUploading ? 'กำลังอัปโหลด...' : <><Upload size={18} /> แจ้งชำระเงิน</>}
                </button>
              </div>
            </div>
          )}

          {/* Step 2 Waiting for confirmation */}
          {currentStep === 2 && !isCancelled && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100 flex items-center gap-3">
              <CheckCircle2 size={24} />
              <div>
                ได้รับหลักฐานการโอนเงินแล้ว กำลังรอแอดมินตรวจสอบยอดเงิน
                {order.payment_slip_url && (
                  <a href={order.payment_slip_url} target="_blank" rel="noreferrer" className="block text-sm font-normal underline mt-1 text-blue-500">ดูสลิปที่แนบ</a>
                )}
              </div>
            </div>
          )}

          {/* Tracking Number */}
          {order.tracking_number && (
            <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-xl border border-green-200">
              <span className="font-bold block mb-1">หมายเลขพัสดุ (Tracking Number)</span>
              <span className="text-xl font-bold tracking-wider">{order.tracking_number}</span>
            </div>
          )}

          {/* Order Items */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 mb-2">รายการสินค้า</h4>
            {order.order_items?.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="w-16 h-16 rounded-lg bg-white flex-shrink-0 overflow-hidden border border-gray-200">
                  {item.products?.image_url ? (
                    <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400 m-auto mt-4" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">{item.products?.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">จำนวน: {item.quantity} ชิ้น</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary-600">฿{(item.unit_price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      )}
    </div>
  );
};

export default OrderCard;
