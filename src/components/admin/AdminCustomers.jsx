import React, { useState, useEffect } from 'react';
import { Search, User, Phone, MapPin, Calendar, FileText, Edit2, XCircle, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', role: 'customer' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const [profilesRes, addressesRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('addresses').select('id, user_id, address_line, district, amphoe, province, zipcode, is_default'),
        supabase.from('orders').select('id, user_id, total_amount')
      ]);

      if (profilesRes.data) {
        const processedCustomers = profilesRes.data.map(customer => {
          const customerAddresses = (addressesRes.data || []).filter(a => a.user_id === customer.id);
          const defaultAddress = customerAddresses.find(a => a.is_default) || customerAddresses[0];
          
          const customerOrders = (ordersRes.data || []).filter(o => o.user_id === customer.id);
          const totalOrders = customerOrders.length;
          const totalSpent = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
          
          return {
            ...customer,
            defaultAddress,
            totalOrders,
            totalSpent
          };
        });
        setCustomers(processedCustomers);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleEditClick = (customer) => {
    setEditForm({
      full_name: customer.full_name || '',
      phone: customer.phone || '',
      role: customer.role || 'customer'
    });
    setSelectedCustomer(customer);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name,
        phone: editForm.phone,
        role: editForm.role
      })
      .eq('id', selectedCustomer.id);
      
    if (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } else {
      await fetchCustomers();
      setSelectedCustomer(null);
    }
    setSaving(false);
  };

  const filteredCustomers = customers.filter(c => 
    (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone || '').includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="text-primary-500" /> จัดการลูกค้า
          </h2>
          <p className="text-sm text-gray-500 mt-1">รายชื่อลูกค้าทั้งหมดที่สมัครสมาชิกและบันทึกข้อมูลในระบบ</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ หรือเบอร์โทรศัพท์..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 font-medium">ลูกค้า / ติดต่อ</th>
              <th className="p-4 font-medium">ที่อยู่จัดส่งหลัก</th>
              <th className="p-4 font-medium text-center">ออเดอร์</th>
              <th className="p-4 font-medium text-right">ยอดซื้อสะสม</th>
              <th className="p-4 font-medium text-center">สิทธิ์</th>
              <th className="p-4 font-medium text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">ไม่พบข้อมูลลูกค้า</td></tr>
            ) : filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 align-top">
                  <div className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs">
                      {customer.full_name ? customer.full_name.charAt(0) : '?'}
                    </div>
                    {customer.full_name || 'ลูกค้าไม่มีชื่อ'}
                  </div>
                  <div className="text-gray-500 text-xs flex items-center gap-1.5 ml-10">
                    <Phone size={12} className="text-gray-400" /> {customer.phone || '-'}
                  </div>
                </td>
                <td className="p-4 align-top text-gray-500 max-w-xs">
                  {customer.defaultAddress ? (
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2 text-xs leading-relaxed" title={`${customer.defaultAddress.address_line} ${customer.defaultAddress.province}`}>
                        {customer.defaultAddress.address_line} ต.{customer.defaultAddress.district} อ.{customer.defaultAddress.amphoe} จ.{customer.defaultAddress.province} {customer.defaultAddress.zipcode}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">ไม่มีข้อมูลที่อยู่</span>
                  )}
                </td>
                <td className="p-4 align-top text-center">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold inline-block">
                    {customer.totalOrders}
                  </span>
                </td>
                <td className="p-4 align-top text-right font-bold text-primary-600">
                  ฿{customer.totalSpent.toLocaleString()}
                </td>
                <td className="p-4 align-top text-center">
                  {customer.role === 'admin' ? (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold inline-block">Admin</span>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium inline-block">Customer</span>
                  )}
                </td>
                <td className="p-4 align-top text-right">
                  <button 
                    onClick={() => handleEditClick(customer)}
                    className="text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm inline-flex items-center gap-1.5"
                  >
                    <Edit2 size={14} /> แก้ไข
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Customer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-primary-500" /> แก้ไขข้อมูลลูกค้า
              </h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSaveCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                  <input 
                    type="text" 
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                  <input 
                    type="tel" 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">สิทธิ์การใช้งาน (Role)</label>
                  <select 
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 font-medium"
                  >
                    <option value="customer">Customer (ลูกค้าทั่วไป)</option>
                    <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                  </select>
                </div>
                
                <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2"
                  >
                    {saving ? 'กำลังบันทึก...' : <><Save size={18} /> บันทึก</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
