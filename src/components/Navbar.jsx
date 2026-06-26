import React, { useState } from 'react';
import { Menu, ShoppingCart, User, X, Wrench, Search } from 'lucide-react';

const Navbar = ({ currentView, onNavigate, isLoggedIn, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onNavigate('store')}
          >
            <div className="bg-primary-500 p-1.5 rounded-lg text-white">
              <Wrench size={24} />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">พีเค <span className="text-primary-500">เครื่องมือช่าง</span></span>
          </div>

          {/* Desktop Search (Hidden on Mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า หรือบริการ..." 
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <button className="text-gray-600 hover:text-primary-500 transition-colors relative">
              <ShoppingCart size={24} />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                2
              </span>
            </button>
            
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onNavigate('portal')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-500"
                >
                  <User size={20} />
                  บัญชีของฉัน
                </button>
                <button 
                  onClick={onLogout}
                  className="text-sm font-medium text-gray-500 hover:text-red-500"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className="bg-dark hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                เข้าสู่ระบบ / สมัครสมาชิก
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            <button className="text-gray-600 relative">
              <ShoppingCart size={24} />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">2</span>
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="ค้นหาสินค้า หรือบริการ..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => { onNavigate('store'); setIsMobileMenuOpen(false); }}
                className={`py-3 px-4 rounded-xl text-center font-medium ${currentView === 'store' ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-700'}`}
              >
                หน้าร้าน
              </button>
              {isLoggedIn ? (
                <button 
                  onClick={() => { onNavigate('portal'); setIsMobileMenuOpen(false); }}
                  className={`py-3 px-4 rounded-xl text-center font-medium ${currentView === 'portal' ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-700'}`}
                >
                  บัญชีของฉัน
                </button>
              ) : (
                <button 
                  onClick={() => { onNavigate('login'); setIsMobileMenuOpen(false); }}
                  className="py-3 px-4 rounded-xl text-center font-medium bg-dark text-white"
                >
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
            
            {isLoggedIn && (
              <button 
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="w-full py-3 px-4 rounded-xl text-center font-medium border border-gray-200 text-red-500"
              >
                ออกจากระบบ
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
