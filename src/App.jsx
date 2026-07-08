import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Storefront from './components/Storefront';
import Login from './components/Login';
import UserPortal from './components/UserPortal';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import { supabase } from './lib/supabase';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

function App() {
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('isAdmin') === 'true' ? 'admin' : 'store'); // 'store', 'login', 'portal', 'admin'
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('customer');

  useEffect(() => {
    const fetchRole = async (currentSession) => {
      if (!currentSession) return;
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentSession.user.id)
        .single();
      
      if (data && data.role) {
        setUserRole(data.role);
        if (data.role === 'admin') {
          setCurrentView('admin');
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        setIsLoggedIn(true);
        fetchRole(session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsLoggedIn(true);
        fetchRole(session);
      } else {
        setIsLoggedIn(false);
        setUserRole('customer');
        if (currentView === 'portal') setCurrentView('store');
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]);

  // Navigation handler
  const handleNavigate = (view) => {
    if (view === 'admin' && localStorage.getItem('isAdmin') !== 'true' && currentView !== 'admin_login') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบผู้ดูแล');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    // currentView will be updated by fetchRole if the user is an admin
    if (userRole !== 'admin') {
      setCurrentView('portal');
    }
  };

  const handleAdminLogin = () => {
    setCurrentView('admin'); // Force redirect to admin dashboard
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('isAdmin');
    setIsLoggedIn(false);
    setCurrentView('store');
  };

  // Session Timeout Logic (30 mins for users, 15 mins for admins)
  useEffect(() => {
    let timeoutId;
    const isAdminMode = currentView === 'admin' || localStorage.getItem('isAdmin') === 'true';

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (session || isAdminMode) {
        const timeoutDuration = isAdminMode ? 15 * 60 * 1000 : 30 * 60 * 1000;
        const message = isAdminMode 
          ? 'เซสชันผู้ดูแลระบบของคุณหมดอายุเนื่องจากไม่มีการใช้งานเป็นเวลา 15 นาที กรุณาเข้าสู่ระบบใหม่'
          : 'เซสชันของคุณหมดอายุเนื่องจากไม่มีการใช้งานเป็นเวลา 30 นาที กรุณาเข้าสู่ระบบใหม่';

        timeoutId = setTimeout(() => {
          handleLogout();
          alert(message);
        }, timeoutDuration);
      }
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [session, currentView]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Show Navbar on all views except Admin (Admin has its own layout) */}
        {currentView !== 'admin' && (
          <>
            <Navbar 
              currentView={currentView} 
              onNavigate={handleNavigate} 
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
            <CartDrawer onNavigate={handleNavigate} />
          </>
        )}

      <main className="flex-grow flex flex-col">
        {currentView === 'store' && <Storefront onNavigate={handleNavigate} />}
        {currentView === 'login' && <Login onLogin={handleLogin} onNavigate={handleNavigate} />}
        {currentView === 'admin_login' && <AdminLogin onLogin={handleAdminLogin} onNavigate={handleNavigate} />}
        {currentView === 'portal' && <UserPortal onNavigate={handleNavigate} />}
        {currentView === 'admin' && <AdminDashboard onNavigate={handleNavigate} />}
      </main>

      {/* Footer / Admin Entrance */}
      {currentView !== 'admin' && currentView !== 'admin_login' && (
        <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">ร้าน PK เครื่องมือช่าง</h3>
                <p className="text-gray-400 text-sm mb-2">บริหารงานโดย นายวรศักดิ์ ปัญญารักษ์</p>
                <p className="text-gray-400 text-sm mb-2">เลขประจำตัวผู้เสียภาษีอากร: 1103700513329</p>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-4">ติดต่อเรา</h3>
                <p className="text-gray-400 text-sm mb-2">ที่อยู่: 23 หมู่ 7 ตำบลค้อวัง อำเภอค้อวัง จังหวัดยโสธร</p>
                <p className="text-gray-400 text-sm mb-2">โทรศัพท์: 093-429-5184</p>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">© 2026 PK เครื่องมือช่าง สงวนลิขสิทธิ์</p>
              <button 
                onClick={() => handleNavigate('admin_login')}
                className="text-gray-500 hover:text-primary-500 text-sm font-medium transition-colors"
              >
                เข้าสู่ระบบสำหรับผู้ดูแล (Admin Login)
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
    </CartProvider>
  );
}

export default App;
