import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Wrench, FileText, Users, LogOut, Menu, ArrowUpRight, Package, Tags, Settings, Receipt } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminCustomers from './admin/AdminCustomers';
import AdminQuotations from './admin/AdminQuotations';
import AdminCategories from './admin/AdminCategories';
import AdminSettings from './admin/AdminSettings';
import AdminIssueQuotation from './admin/AdminIssueQuotation';

const AdminDashboard = ({ onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    pendingQuotes: 0
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    // 1. Total Sales (from completed/paid orders)
    const { data: salesData } = await supabase
      .from('orders')
      .select('total_amount')
      .in('status', ['paid', 'completed', 'shipped']);
    const totalSales = (salesData || []).reduce((sum, order) => sum + order.total_amount, 0);

    // 2. Pending Orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'paid']);

    // 3. Total Customers
    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // 4. Pending Quotations / Bookings
    const { count: pendingQuotes } = await supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .in('status', ['new', 'contacted']);

    setStats({
      totalSales,
      pendingOrders: pendingOrders || 0,
      totalCustomers: totalCustomers || 0,
      pendingQuotes: pendingQuotes || 0
    });
  };

  const statCards = [
    { title: 'ยอดขายรวมสะสม', value: `฿${stats.totalSales.toLocaleString()}`, trend: 'อัปเดตล่าสุด', isPositive: true, icon: <ShoppingBag size={24} className="text-primary-500" /> },
    { title: 'คำสั่งซื้อรอจัดการ', value: stats.pendingOrders.toString(), trend: 'ต้องดำเนินการ', isPositive: false, icon: <Package size={24} className="text-blue-500" /> },
    { title: 'คิวช่าง/ใบเสนอราคา', value: stats.pendingQuotes.toString(), trend: 'รอดำเนินการ', isPositive: false, icon: <FileText size={24} className="text-orange-500" /> },
    { title: 'ลูกค้าทั้งหมด', value: stats.totalCustomers.toString(), trend: 'สมาชิกระบบ', isPositive: true, icon: <Users size={24} className="text-green-500" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                    <div className={`flex items-center text-xs font-medium ${stat.isPositive ? 'text-green-600' : 'text-orange-500'}`}>
                      <ArrowUpRight size={14} className="mr-1" />
                      {stat.trend}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    {stat.icon}
                  </div>
                </div>
              ))}
            </div>
            {/* You can add recent orders table here as a quick view if wanted */}
          </div>
        );
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'customers':
        return <AdminCustomers />;
      case 'quotations':
        return <AdminQuotations />;
      case 'issue_quotation':
        return <AdminIssueQuotation key="pk" shopType="pk" />;
      case 'issue_quotation_888':
        return <AdminIssueQuotation key="888" shopType="888" />;
      case 'categories':
        return <AdminCategories />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <div>กำลังพัฒนา...</div>;
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
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-primary-500 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">ภาพรวมระบบ</span>
          </button>
          <button
            onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'products' ? 'bg-primary-500 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
          >
            <Package size={20} />
            <span className="font-medium">จัดการสินค้า</span>
          </button>
          <button
            onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'categories' ? 'bg-primary-500 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
          >
            <Tags size={20} />
            <span className="font-medium">จัดการหมวดหมู่</span>
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-primary-500 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
          >
            <ShoppingBag size={20} />
            <span className="font-medium">จัดการออเดอร์</span>
          </button>
          <button
            onClick={() => { setActiveTab('quotations'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'quotations' ? 'bg-primary-500 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
          >
            <FileText size={20} />
            <span className="font-medium flex-1 text-left">จัดการคิวช่าง</span>
            {stats.pendingQuotes > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{stats.pendingQuotes}</span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('issue_quotation'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'issue_quotation' ? 'bg-primary-500 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
          >
            <Receipt size={20} />
            <span className="font-medium">PK-ใบเสนอราคา</span>
          </button>
          <button
            onClick={() => { setActiveTab('issue_quotation_888'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'issue_quotation_888' ? 'bg-primary-500 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
          >
            <Receipt size={20} />
            <span className="font-medium">888-ใบเสนอราคา</span>
          </button>
          <button
            onClick={() => { setActiveTab('customers'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${activeTab === 'customers' ? 'bg-primary-500 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
          >
            <Users size={20} />
            <span className="font-medium">ลูกค้าทั้งหมด</span>
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mt-4 border-t border-gray-800 pt-4 ${activeTab === 'settings' ? 'bg-primary-500 text-white' : 'hover:bg-gray-800 hover:text-white'}`}
          >
            <Settings size={20} />
            <span className="font-medium">ตั้งค่าระบบ</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              localStorage.removeItem('isAdmin');
              onNavigate('store');
            }}
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
              {activeTab === 'dashboard' && 'ภาพรวมระบบ (Dashboard)'}
              {activeTab === 'products' && 'จัดการสต็อกสินค้า (Products)'}
              {activeTab === 'categories' && 'จัดการหมวดหมู่สินค้า (Categories)'}
              {activeTab === 'orders' && 'จัดการคำสั่งซื้อ (Orders)'}
              {activeTab === 'quotations' && 'จัดการคิวช่าง/ใบเสนอราคา (Bookings)'}
              {activeTab === 'issue_quotation' && 'PK-ใบเสนอราคามาตรฐาน (Quotations)'}
              {activeTab === 'issue_quotation_888' && '888-ใบเสนอราคามาตรฐาน (Quotations)'}
              {activeTab === 'customers' && 'รายชื่อลูกค้า (Customers)'}
              {activeTab === 'settings' && 'ตั้งค่าระบบ (Settings)'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">ผู้ดูแลระบบ</p>
              <p className="text-xs text-green-600">กำลังใช้งาน</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg border border-primary-200">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
