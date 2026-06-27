import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, ShieldAlert } from 'lucide-react';
const AdminLogin = ({ onLogin, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    // Hardcoded simple password as requested
    setTimeout(() => {
      if (password === 'pk1234' || password === '123456') {
        localStorage.setItem('isAdmin', 'true');
        onLogin();
      } else {
        setErrorMsg('รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-gray-900 py-12">
      <div className="w-full max-w-md">
        <button 
          onClick={() => onNavigate('store')}
          className="flex items-center text-gray-400 hover:text-white mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> กลับหน้าร้านค้า
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary-500"></div>
          
          <div className="text-center mb-8 mt-2">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              PK Admin Portal
            </h2>
            <p className="text-gray-500 text-sm">
              เข้าสู่ระบบเฉพาะผู้ดูแลร้านค้าเท่านั้น
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">รหัสผ่าน Admin</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" 
                  placeholder="รหัสผ่าน (ลองใส่ 123456)" 
                  required
                />
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg transition-colors mt-4 disabled:opacity-70 shadow-lg"
            >
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
