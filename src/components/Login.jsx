import React from 'react';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

const Login = ({ onLogin, onNavigate }) => {
  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <button 
          onClick={() => onNavigate('store')}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> กลับหน้าหลัก
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">ยินดีต้อนรับกลับมา</h2>
            <p className="text-gray-500">เข้าสู่ระบบเพื่อจัดการออเดอร์และคิวงานของคุณ</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
              <div className="relative">
                <input 
                  type="email" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" 
                  placeholder="your@email.com" 
                  required
                />
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">ลืมรหัสผ่าน?</a>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" 
                  placeholder="••••••••" 
                  required
                />
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-dark hover:bg-gray-800 text-white py-4 rounded-xl font-bold text-lg transition-colors mt-2"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <span className="h-px w-full bg-gray-200"></span>
            <span className="text-sm text-gray-400">หรือ</span>
            <span className="h-px w-full bg-gray-200"></span>
          </div>

          <button className="mt-6 w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.78 15.68 17.58V20.35H19.24C21.32 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.24 20.35L15.68 17.58C14.72 18.22 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.88 14.13H2.21V16.97C4.01 20.55 7.7 23 12 23Z" fill="#34A853"/>
              <path d="M5.88 14.13C5.66 13.47 5.54 12.76 5.54 12C5.54 11.24 5.66 10.53 5.88 9.87V7.03H2.21C1.47 8.5 1.05 10.2 1.05 12C1.05 13.8 1.47 15.5 2.21 16.97L5.88 14.13Z" fill="#FBBC05"/>
              <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.31 3.91C17.45 2.18 14.97 1.15 12 1.15C7.7 1.15 4.01 3.45 2.21 7.03L5.88 9.87C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335"/>
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>
          
          <p className="mt-8 text-center text-sm text-gray-500">
            ยังไม่มีบัญชี? <a href="#" className="font-bold text-primary-600 hover:text-primary-700">สมัครสมาชิกที่นี่</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
