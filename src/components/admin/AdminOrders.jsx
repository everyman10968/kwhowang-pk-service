import React, { useState, useEffect } from 'react';
import { Eye, Search, Package, MapPin, Edit, CheckCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [ordersRes, profilesRes, addressesRes] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id, quantity, unit_price,
              products (name, image_url)
            )
          `)
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, phone'),
        supabase.from('addresses').select('id, address_line, district, amphoe, province, zipcode')
      ]);

      if (ordersRes.data) {
        const processedOrders = ordersRes.data.map(order => {
          const profile = (profilesRes.data || []).find(p => p.id === order.user_id) || {};
          const address = (addressesRes.data || []).find(a => a.id === order.shipping_address_id) || {};
          return {
            ...order,
            profiles: profile,
            addresses: address
          };
        });
        setOrders(processedOrders);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.tracking_number || '');
    setOrderStatus(order.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: orderStatus,
          tracking_number: trackingNumber
        })
        .eq('id', selectedOrder.id);
        
      if (error) throw error;
      
      handleCloseModal();
      fetchOrders();
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอัปเดต: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-medium">รอชำระเงิน</span>;
      case 'paid': return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">ชำระเงินแล้ว</span>;
      case 'shipped': return <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-medium">กำลังจัดส่ง</span>;
      case 'completed': return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">สำเร็จ</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-medium">ยกเลิก</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchTerm) || 
    (o.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">จัดการคำสั่งซื้อ</h2>
          <p className="text-sm text-gray-500 mt-1">ติดตามสถานะ อัปเดตการจัดส่ง และดูรายละเอียดคำสั่งซื้อ</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="ค้นหาชื่อลูกค้า หรือรหัสออเดอร์..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-medium">รหัสคำสั่งซื้อ</th>
              <th className="p-4 font-medium">วันที่</th>
              <th className="p-4 font-medium">ลูกค้า</th>
              <th className="p-4 font-medium">ยอดรวม</th>
              <th className="p-4 font-medium">สถานะ</th>
              <th className="p-4 font-medium text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">ไม่พบข้อมูลคำสั่งซื้อ</td></tr>
            ) : filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-900">ORD-{order.id.toString().padStart(5, '0')}</td>
                <td className="p-4 text-gray-500">{new Date(order.created_at).toLocaleString('th-TH')}</td>
                <td className="p-4">
                  <p className="font-medium text-gray-900">{order.profiles?.full_name || 'ลูกค้าทั่วไป'}</p>
                  <p className="text-xs text-gray-500">{order.profiles?.phone}</p>
                </td>
                <td className="p-4 font-medium text-primary-600">฿{order.total_amount.toLocaleString()}</td>
                <td className="p-4">{getStatusBadge(order.status)}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleOpenModal(order)}
                    className="inline-flex items-center gap-1 bg-white border border-gray-200 hover:border-primary-300 text-gray-600 hover:text-primary-600 px-3 py-1.5 rounded-lg font-medium transition-colors text-xs shadow-sm"
                  >
                    <Eye size={14} /> รายละเอียด
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-dark/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">รายละเอียดคำสั่งซื้อ</h3>
                <p className="text-sm text-gray-500 mt-1">รหัส: ORD-{selectedOrder.id.toString().padStart(5, '0')}</p>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Info */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold">
                    <MapPin size={18} className="text-primary-500" /> ข้อมูลจัดส่ง
                  </div>
                  <p className="font-medium text-gray-900">{selectedOrder.profiles?.full_name}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedOrder.profiles?.phone}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedOrder.addresses?.address_line} ต.{selectedOrder.addresses?.district} อ.{selectedOrder.addresses?.amphoe} จ.{selectedOrder.addresses?.province} {selectedOrder.addresses?.zipcode}
                  </p>
                </div>
                
                {/* Payment Slip Viewer */}
                {selectedOrder.payment_slip_url && (
                  <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm md:col-span-2 flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-full sm:w-1/3">
                      <div className="flex items-center gap-2 mb-3 text-blue-700 font-bold">
                        หลักฐานการโอนเงิน
                      </div>
                      <a href={selectedOrder.payment_slip_url} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors">
                        <img src={selectedOrder.payment_slip_url} alt="Payment Slip" className="w-full h-auto object-cover max-h-48" />
                      </a>
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm text-gray-600">ลูกค้าได้แนบสลิปชำระเงินมาแล้ว กรุณาตรวจสอบยอดเงินในบัญชีว่าตรงกับยอด <span className="font-bold text-primary-600 text-lg">฿{selectedOrder.total_amount.toLocaleString()}</span> หรือไม่</p>
                      
                      {selectedOrder.status === 'pending' && (
                        <button
                          onClick={async () => {
                            setUpdating(true);
                            try {
                              const { error } = await supabase.from('orders')
                                .update({ status: 'paid', payment_status: 'paid' })
                                .eq('id', selectedOrder.id);
                              if (error) throw error;
                              setOrderStatus('paid');
                              alert('ยืนยันยอดเงินสำเร็จ! สถานะออเดอร์ถูกเปลี่ยนเป็น "เตรียมจัดส่ง"');
                              handleCloseModal();
                              fetchOrders();
                            } catch (error) {
                              alert('เกิดข้อผิดพลาด: ' + error.message);
                            } finally {
                              setUpdating(false);
                            }
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
                        >
                          อนุมัติยอดเงิน (Approve Payment)
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Order Status Update */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold">
                    <Edit size={18} className="text-blue-500" /> อัปเดตสถานะ
                  </div>
                  <form onSubmit={handleUpdateOrder} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">สถานะคำสั่งซื้อ</label>
                      <select 
                        value={orderStatus} 
                        onChange={(e) => setOrderStatus(e.target.value)}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      >
                        <option value="pending">รอชำระเงิน</option>
                        <option value="paid">ชำระเงินแล้ว (เตรียมจัดส่ง)</option>
                        <option value="shipped">กำลังจัดส่ง</option>
                        <option value="completed">สำเร็จ (รับสินค้าแล้ว)</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">เลขพัสดุ (Tracking Number)</label>
                      <input 
                        type="text" 
                        value={trackingNumber} 
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="เช่น TH123456789"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={updating}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> บันทึกการเปลี่ยนแปลง
                    </button>
                  </form>
                </div>
              </div>

              {/* Order Items */}
              <h4 className="font-bold text-gray-900 mb-3">รายการสินค้า</h4>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <th className="p-3 font-medium">สินค้า</th>
                      <th className="p-3 font-medium text-center">ราคา/ชิ้น</th>
                      <th className="p-3 font-medium text-center">จำนวน</th>
                      <th className="p-3 font-medium text-right">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {selectedOrder.order_items?.map(item => (
                      <tr key={item.id}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                              {item.products?.image_url ? (
                                <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-gray-400 m-auto mt-2.5" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{item.products?.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-gray-600">฿{item.unit_price.toLocaleString()}</td>
                        <td className="p-3 text-center text-gray-900 font-medium">x{item.quantity}</td>
                        <td className="p-3 text-right text-primary-600 font-bold">฿{(item.unit_price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-100">
                    <tr>
                      <td colSpan="3" className="p-4 text-right font-bold text-gray-700">ยอดชำระสุทธิ:</td>
                      <td className="p-4 text-right font-bold text-primary-600 text-lg">฿{selectedOrder.total_amount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
