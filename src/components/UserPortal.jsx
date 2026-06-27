import React, { useState, useEffect } from 'react';
import { Package, Clock, FileText, Settings, LogOut, ChevronRight, CheckCircle2, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import OrderCard from './OrderCard';

const UserPortal = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'services'
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userQuotations, setUserQuotations] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // 1. Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onNavigate('login');
        return;
      }
      
      const userId = session.user.id;

      // 2. Fetch Profile & Address separately due to schema FK pointing to auth.users
      const [profileRes, addressRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('addresses').select('*').eq('user_id', userId)
      ]);
        
      if (profileRes.data) {
        const userAddresses = addressRes.data || [];
        setUserProfile({
          ...profileRes.data,
          email: session.user.email,
          defaultAddress: userAddresses.find(a => a.is_default) || userAddresses[0]
        });
      }

      // 3. Fetch Orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id, quantity, unit_price,
            products (name, image_url)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (orders) setUserOrders(orders);

      // 4. Fetch Quotations/Services (Assuming phone or name matches if user_id is not strictly linked, or use user_id if we have it)
      // Since quotations only has name/phone and no user_id, we match by phone or name!
      // But wait, it's safer to match by phone if available
      if (profile?.phone) {
        const { data: quotes } = await supabase
          .from('quotations')
          .select('*')
          .eq('phone', profile.phone)
          .order('created_at', { ascending: false });
        if (quotes) setUserQuotations(quotes);
      } else {
        const { data: quotes } = await supabase
          .from('quotations')
          .select('*')
          .eq('name', profile?.full_name)
          .order('created_at', { ascending: false });
        if (quotes) setUserQuotations(quotes);
      }

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getOrderStatus = (status) => {
    switch(status) {
      case 'pending': return <span className="text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold">รอชำระเงิน</span>;
      case 'paid': return <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold">เตรียมจัดส่ง</span>;
      case 'shipped': return <span className="text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs font-bold">กำลังจัดส่ง</span>;
      case 'completed': return <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold">สำเร็จ</span>;
      case 'cancelled': return <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold">ยกเลิกแล้ว</span>;
      default: return <span className="text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const getQuoteStatus = (status) => {
    switch(status) {
      case 'pending': return <span className="text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold">รอดำเนินการ</span>;
      case 'contacted': return <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold">ติดต่อแล้ว</span>;
      case 'quoted': return <span className="text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs font-bold">เสนอราคาแล้ว</span>;
      case 'completed': return <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold">เสร็จสิ้น</span>;
      case 'cancelled': return <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">ยกเลิก</span>;
      default: return <span>{status}</span>;
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">กำลังโหลดข้อมูลบัญชี...</div>;
  }

  if (!userProfile) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Profile */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full mb-4 ring-4 ring-primary-50 bg-primary-100 text-primary-600 flex items-center justify-center text-3xl font-bold">
                {userProfile.full_name ? userProfile.full_name.charAt(0) : 'U'}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{userProfile.full_name || 'ผู้ใช้งานใหม่'}</h2>
              <p className="text-sm text-gray-500 mb-2">{userProfile.email}</p>
              <p className="text-sm text-gray-500 mb-6">{userProfile.phone || 'ยังไม่ได้เพิ่มเบอร์โทร'}</p>
              
              {userProfile.defaultAddress && (
                <div className="w-full text-left bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
                  <div className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1"><MapPin size={12}/> ที่อยู่จัดส่งหลัก</div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {userProfile.defaultAddress.address_line} ต.{userProfile.defaultAddress.district} อ.{userProfile.defaultAddress.amphoe} จ.{userProfile.defaultAddress.province} {userProfile.defaultAddress.zipcode}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hidden md:block">
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-gray-50 text-gray-700 font-medium'}`}
              >
                <div className="flex items-center gap-3">
                  <Package size={20} />
                  <span>ประวัติการสั่งซื้อ</span>
                </div>
                {activeTab === 'orders' && <ChevronRight size={18} />}
              </button>
              <button 
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${activeTab === 'services' ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-gray-50 text-gray-700 font-medium'}`}
              >
                <div className="flex items-center gap-3">
                  <Clock size={20} />
                  <span>งานบริการ/ใบเสนอราคา</span>
                </div>
                {activeTab === 'services' && <ChevronRight size={18} />}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Mobile Tabs */}
          <div className="md:hidden flex overflow-x-auto gap-2 pb-4 mb-4 hide-scrollbar">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
            >
              ประวัติการสั่งซื้อ
            </button>
            <button 
              onClick={() => setActiveTab('services')}
              className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'services' ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
            >
              งานบริการ/ใบเสนอราคา
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">ประวัติการสั่งซื้อของคุณ</h3>
                <div className="space-y-4">
                  {userOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Package size={48} className="mx-auto text-gray-300 mb-4" />
                      <p>คุณยังไม่มีประวัติการสั่งซื้อสินค้า</p>
                    </div>
                  ) : (
                    userOrders.map(order => (
                      <OrderCard key={order.id} order={order} onUpdate={fetchUserData} />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">งานบริการและใบเสนอราคา</h3>
                <div className="space-y-4">
                  {userQuotations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                      <p>คุณยังไม่มีประวัติการจองคิวช่างหรือขอใบเสนอราคา</p>
                    </div>
                  ) : (
                    userQuotations.map(quote => (
                      <div key={quote.id} className="border border-gray-100 rounded-2xl p-5 hover:border-primary-200 transition-colors bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center flex-shrink-0">
                            {quote.service_type === 'air_clean' ? <Clock size={24} /> : <FileText size={24} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">
                              {quote.service_type === 'air_clean' ? 'ล้างแอร์บ้าน' : 
                               quote.service_type === 'cctv' ? 'ติดตั้งกล้องวงจรปิด' : 'ขอใบเสนอราคาอื่นๆ'}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">{quote.details}</p>
                            <p className="text-xs text-gray-400 mt-2">วันที่ขอบริการ: {new Date(quote.created_at).toLocaleDateString('th-TH')}</p>
                          </div>
                        </div>
                        <div className="text-right w-full md:w-auto">
                          {getQuoteStatus(quote.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPortal;
