import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBag, Wrench, FileText, Users, Settings, LogOut, Menu, X, ArrowUpRight, ArrowDownRight, Bell, Package } from 'lucide-react';

const AdminDashboard = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { title: 'ยอดขายวันนี้', value: '฿45,200', trend: '+12.5%', isPositive: true, icon: <ShoppingBag size={24} className="text-primary-500" /> },
    { title: 'คำสั่งซื้อรอจัดส่ง', value: '18', trend: '-2.4%', isPositive: false, icon: <Package size={24} className="text-blue-500" /> },
    { title: 'คิวงานช่างวันนี้', value: '5', trend: '+1', isPositive: true, icon: <Wrench size={24} className="text-yellow-500" /> },
    { title: 'คำขอใบเสนอราคาใหม่', value: '3', trend: 'ใหม่', isPositive: true, icon: <FileText size={24} className="text-green-500" /> },
  ];

  const quotes = [
    { id: 'QT-2310-06', company: 'บจก. ก่อสร้างไทย', date: '20 ต.ค. 2023', items: 'สายไฟ VAF, หลอดไฟ LED', amount: 'รอประเมิน', status: 'new' },
    { id: 'QT-2310-05', company: 'สมชาย อพาร์ทเมนท์', date: '19 ต.ค. 2023', items: 'แอร์ 18000 BTU 5 เครื่อง', amount: '฿125,000', status: 'pending' },
    { id: 'QT-2310-04', company: 'บมจ. อสังหาพลัส', date: '18 ต.ค. 2023', items: 'กล้องวงจรปิด 16 จุด', amount: '฿45,800', status: 'approved' },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new': return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">ใหม่</span>;
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-medium">รออนุมัติ</span>;
      case 'approved': return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">อนุมัติแล้ว</span>;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-dark/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-dark text-gray-300 transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 p-1.5 rounded-lg text-white">
              <Wrench size={20} />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">PK Admin</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-primary-500 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">ภาพรวมระบบ</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition-colors">
            <ShoppingBag size={20} />
            <span className="font-medium">จัดการออเดอร์</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition-colors">
            <Wrench size={20} />
            <span className="font-medium">คิวงานช่าง</span>
          </button>
          <button 
            onClick={() => setActiveTab('quotes')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'quotes' ? 'bg-primary-500 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <FileText size={20} />
              <span className="font-medium">ใบเสนอราคา</span>
            </div>
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">3</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition-colors">
            <Users size={20} />
            <span className="font-medium">ลูกค้าทั้งหมด</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 hover:text-white transition-colors">
            <Settings size={20} />
            <span className="font-medium">ตั้งค่าระบบ</span>
          </button>
          <button 
            onClick={() => onNavigate('store')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors mt-2"
          >
            <LogOut size={20} />
            <span className="font-medium">กลับหน้าร้าน</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-gray-900">
              {activeTab === 'dashboard' ? 'ภาพรวมระบบ (Dashboard)' : 'จัดการใบเสนอราคา'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm border border-primary-200">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <div className={`flex items-center text-xs font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    {stat.trend} <span className="text-gray-400 ml-1 font-normal">เทียบกับเมื่อวาน</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Quotations Table Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">คำขอใบเสนอราคาล่าสุด</h2>
                <p className="text-sm text-gray-500 mt-1">รายการคำขอที่ต้องการการตรวจสอบและประเมินราคา</p>
              </div>
              <button className="bg-dark hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                ดูทั้งหมด
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="p-4 font-medium">รหัสคำขอ</th>
                    <th className="p-4 font-medium">บริษัท/ลูกค้า</th>
                    <th className="p-4 font-medium">วันที่</th>
                    <th className="p-4 font-medium">รายละเอียดเบื้องต้น</th>
                    <th className="p-4 font-medium">ยอดเงินประเมิน</th>
                    <th className="p-4 font-medium">สถานะ</th>
                    <th className="p-4 font-medium text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{quote.id}</td>
                      <td className="p-4 font-medium text-gray-700">{quote.company}</td>
                      <td className="p-4 text-gray-500">{quote.date}</td>
                      <td className="p-4 text-gray-600 truncate max-w-[200px]">{quote.items}</td>
                      <td className="p-4 font-medium text-gray-900">{quote.amount}</td>
                      <td className="p-4">{getStatusBadge(quote.status)}</td>
                      <td className="p-4 text-right">
                        {quote.status === 'new' ? (
                          <button className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-xs">
                            สร้างใบเสนอราคา
                          </button>
                        ) : (
                          <button className="text-primary-600 hover:text-primary-800 font-medium px-3 py-1.5 rounded-lg bg-primary-50 text-xs">
                            {quote.status === 'pending' ? 'อนุมัติ' : 'ดูรายละเอียด'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
