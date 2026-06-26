import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Storefront from './components/Storefront';
import Login from './components/Login';
import UserPortal from './components/UserPortal';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [currentView, setCurrentView] = useState('store'); // 'store', 'login', 'portal', 'admin'
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Navigation handler
  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView('portal');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('store');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Show Navbar on all views except Admin (Admin has its own layout) */}
      {currentView !== 'admin' && (
        <Navbar 
          currentView={currentView} 
          onNavigate={handleNavigate} 
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-grow flex flex-col">
        {currentView === 'store' && <Storefront onNavigate={handleNavigate} />}
        {currentView === 'login' && <Login onLogin={handleLogin} onNavigate={handleNavigate} />}
        {currentView === 'portal' && <UserPortal onNavigate={handleNavigate} />}
        {currentView === 'admin' && <AdminDashboard onNavigate={handleNavigate} />}
      </main>

      {/* Dev Tool: View Switcher Floating Button (For Prototype Demo Purposes) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200">
        <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider text-center">Demo Menu</p>
        <div className="flex gap-2">
          <button onClick={() => handleNavigate('store')} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${currentView === 'store' ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Store</button>
          <button onClick={() => handleNavigate('login')} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${currentView === 'login' ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Login</button>
          <button onClick={() => handleNavigate('portal')} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${currentView === 'portal' ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Portal</button>
          <button onClick={() => handleNavigate('admin')} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${currentView === 'admin' ? 'bg-dark text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Admin</button>
        </div>
      </div>
    </div>
  );
}

export default App;
