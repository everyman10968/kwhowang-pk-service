import React, { useState } from 'react';
import { Package, Clock, FileText, Settings, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';

const UserPortal = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'services', 'quotes'

  const user = {
    name: "สมชาย ใจดี",
    email: "somchai@example.com",
    avatar: "https://ui-avatars.com/api/?name=Somchai+J&background=f97316&color=fff"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Profile */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col items-center text-center">
              <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full mb-4 ring-4 ring-primary-50" />
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500 mb-6">{user.email}</p>
              <button className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-colors border border-gray-200">
                แก้ไขข้อมูลส่วนตัว
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hidden md:block">
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Package size={20} />
                  <span>ประวัติการสั่งซื้อ</span>
                </div>
                {activeTab === 'orders' && <ChevronRight size={18} />}
              </button>
              <button 
                onClick={() => setActiveTab('services')}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${activeTab === 'services' ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Clock size={20} />
                  <span>ติดตามสถานะงานซ่อม</span>
                </div>
                {activeTab === 'services' && <ChevronRight size={18} />}
              </button>
              <button 
                onClick={() => setActiveTab('quotes')}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${activeTab === 'quotes' ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} />
                  <span>ใบเสนอราคาของฉัน</span>
                </div>
                {activeTab === 'quotes' && <ChevronRight size={18} />}
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
              งานซ่อม/ติดตั้ง
            </button>
            <button 
              onClick={() => setActiveTab('quotes')}
              className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'quotes' ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
            >
              ใบเสนอราคา
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">ประวัติการสั่งซื้อล่าสุด</h3>
                <div className="space-y-4">
                  {/* Order Item */}
                  <div className="border border-gray-100 rounded-2xl p-5 hover:border-primary-200 transition-colors">
                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-50">
                      <div>
                        <span className="text-sm font-bold text-gray-900">ออเดอร์ #ORD-2023-001</span>
                        <span className="block text-xs text-gray-500 mt-1">วันที่สั่งซื้อ: 15 ต.ค. 2023</span>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        จัดส่งแล้ว
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                         <img src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=100&h=100" alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900">สว่านไร้สาย 20V Max</h4>
                        <p className="text-sm text-gray-500 mt-1">จำนวน: 1 ชิ้น</p>
                        <p className="text-sm font-bold text-primary-600 mt-2">฿2,490</p>
                      </div>
                      <div className="flex items-end">
                        <button className="text-sm text-primary-600 font-medium hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg">
                          ซื้ออีกครั้ง
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Add an empty state example if needed */}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">ติดตามสถานะงานซ่อม/ติดตั้ง</h3>
                <div className="space-y-6">
                  {/* Service Job */}
                  <div className="border border-gray-100 rounded-2xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-sm font-bold text-gray-900">งานซ่อมบำรุง #SRV-0042</span>
                        <h4 className="text-lg font-bold text-gray-900 mt-1">ล้างแอร์ 3 เครื่อง</h4>
                        <span className="block text-sm text-gray-500 mt-1">นัดหมาย: พรุ่งนี้, 10:00 น.</span>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        รอช่างเข้าพื้นที่
                      </span>
                    </div>
                    
                    {/* Status Tracker */}
                    <div className="mt-6 pt-6 border-t border-gray-50">
                      <div className="relative">
                        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
                        <ul className="space-y-4 relative">
                          <li className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm border-2 border-white">
                              <CheckCircle2 size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">รับเรื่องแล้ว</p>
                              <p className="text-xs text-gray-500">18 ต.ค. 2023, 09:30 น.</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm border-2 border-white">
                              <span className="w-2 h-2 bg-white rounded-full"></span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">ยืนยันคิวช่าง</p>
                              <p className="text-xs text-gray-500">18 ต.ค. 2023, 11:00 น.</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm border-2 border-white">
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">ช่างกำลังเดินทาง</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quotes' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">ใบเสนอราคาของฉัน</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-sm text-gray-500">
                        <th className="pb-3 font-medium">เลขที่</th>
                        <th className="pb-3 font-medium">วันที่ขอ</th>
                        <th className="pb-3 font-medium">โปรเจกต์</th>
                        <th className="pb-3 font-medium">สถานะ</th>
                        <th className="pb-3 font-medium text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 font-medium text-gray-900">QT-2310-01</td>
                        <td className="py-4 text-gray-600">16 ต.ค. 2023</td>
                        <td className="py-4 text-gray-900">อุปกรณ์เซฟตี้สำหรับไซต์งาน</td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            อนุมัติแล้ว
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-primary-600 hover:text-primary-800 font-medium bg-primary-50 px-3 py-1.5 rounded-lg">ดูเอกสาร</button>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 font-medium text-gray-900">QT-2310-05</td>
                        <td className="py-4 text-gray-600">18 ต.ค. 2023</td>
                        <td className="py-4 text-gray-900">เดินระบบไฟอาคารพาณิชย์</td>
                        <td className="py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            กำลังตรวจสอบ
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-gray-400 hover:text-gray-600 font-medium px-3 py-1.5">รายละเอียด</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
