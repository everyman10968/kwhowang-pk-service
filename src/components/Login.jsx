import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CreateInput } from 'thai-address-autocomplete-react';

const InputThaiAddress = CreateInput();

const Login = ({ onLogin, onNavigate }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Form State (extended)
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [address, setAddress] = useState({
    district: '', amphoe: '', province: '', zipcode: ''
  });

  const handleChangeAddress = (scope) => (value) => {
    setAddress((oldAddr) => ({ ...oldAddr, [scope]: value }));
  };
  const handleSelectAddress = (newAddress) => {
    setAddress(newAddress);
  };

  const validatePassword = (pw) => {
    if (pw.length < 8) return "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
    if (!/[A-Z]/.test(pw)) return "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว";
    if (!/[a-z]/.test(pw)) return "รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว";
    if (!/[0-9]/.test(pw)) return "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว";
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onLogin();
    } catch (err) {
      setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!email || !password || !regPasswordConfirm || !fullName || !phone || !addressLine || !address.district || !address.amphoe || !address.province || !address.zipcode) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      setLoading(false);
      return;
    }
    if (password !== regPasswordConfirm) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }
    const pwError = validatePassword(password);
    if (pwError) {
      setErrorMsg(pwError);
      setLoading(false);
      return;
    }

    try {
      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;

      // Ensure user is created
      if (authData.user) {
        // 2. Insert Profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            full_name: fullName,
            phone: phone
          });
        if (profileError) throw profileError;

        // 3. Insert Address
        const { error: addressError } = await supabase
          .from('addresses')
          .insert({
            user_id: authData.user.id,
            address_line: addressLine,
            district: address.district,
            amphoe: address.amphoe,
            province: address.province,
            zipcode: address.zipcode.toString(),
            is_default: true
          });
        if (addressError) throw addressError;

        onLogin();
      }
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-gray-50 py-12">
      <div className={`w-full ${isRegistering ? 'max-w-3xl' : 'max-w-md'}`}>
        <button 
          onClick={() => onNavigate('store')}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> กลับหน้าหลัก
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isRegistering ? 'สมัครสมาชิกใหม่' : 'เข้าสู่ระบบ'}
            </h2>
            <p className="text-gray-500">
              {isRegistering ? 'กรอกข้อมูลเพื่อเริ่มต้นใช้งานระบบอย่างเต็มรูปแบบ' : 'เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อและประวัติของคุณ'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-3 bg-green-50 text-green-600 rounded-xl text-sm border border-green-100">
              {successMsg}
            </div>
          )}

          {!isRegistering ? (
            // ================= LOGIN FORM =================
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมลของคุณ</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" 
                    placeholder="your@email.com" 
                    required
                  />
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" 
                    placeholder="••••••••" 
                    required
                  />
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-dark hover:bg-gray-800 text-white py-4 rounded-xl font-bold text-lg transition-colors mt-2 disabled:opacity-70"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
              <div className="text-center mt-6">
                <p className="text-gray-500 text-sm">
                  ยังไม่มีบัญชีใช่หรือไม่?{' '}
                  <button 
                    type="button"
                    onClick={() => { setIsRegistering(true); setErrorMsg(''); }}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    สมัครสมาชิกที่นี่
                  </button>
                </p>
              </div>
            </form>
          ) : (
            // ================= REGISTER FORM =================
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Account Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 border-b pb-2">ข้อมูลบัญชี</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                    <div className="relative">
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                      <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน <span className="text-xs text-gray-400 font-normal">(8+ ตัวอักษร, พิมพ์ใหญ่, พิมพ์เล็ก, ตัวเลข)</span></label>
                    <div className="relative">
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                      <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
                    <div className="relative">
                      <input type="password" value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                      <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                  </div>
                </div>

                {/* 2. Personal Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 border-b pb-2">ข้อมูลส่วนตัว</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                    <div className="relative">
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                      <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                    <div className="relative">
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
                      <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Address Info */}
              <div className="space-y-4 pt-4 border-t border-gray-100 relative z-[60]">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MapPin size={20} className="text-primary-500" /> ข้อมูลที่อยู่จัดส่ง
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดที่อยู่ (บ้านเลขที่, ซอย, ถนน)</label>
                  <textarea value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]" required />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ตำบล/แขวง</label>
                    <div className="thai-address-wrapper">
                      <InputThaiAddress.District value={address.district} onChange={handleChangeAddress('district')} onSelect={handleSelectAddress} autoCompleteProps={{ className: "w-full" }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">อำเภอ/เขต</label>
                    <div className="thai-address-wrapper">
                      <InputThaiAddress.Amphoe value={address.amphoe} onChange={handleChangeAddress('amphoe')} onSelect={handleSelectAddress} autoCompleteProps={{ className: "w-full" }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
                    <div className="thai-address-wrapper">
                      <InputThaiAddress.Province value={address.province} onChange={handleChangeAddress('province')} onSelect={handleSelectAddress} autoCompleteProps={{ className: "w-full" }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รหัสไปรษณีย์</label>
                    <div className="thai-address-wrapper">
                      <InputThaiAddress.Zipcode value={address.zipcode} onChange={handleChangeAddress('zipcode')} onSelect={handleSelectAddress} autoCompleteProps={{ className: "w-full" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <button 
                  type="button"
                  onClick={() => { setIsRegistering(false); setErrorMsg(''); }}
                  className="text-gray-500 hover:text-gray-900 font-medium text-sm w-full sm:w-auto text-center"
                >
                  มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-bold transition-colors w-full sm:w-auto disabled:opacity-70 shadow-md shadow-primary-500/30"
                >
                  {loading ? 'กำลังบันทึก...' : 'ลงทะเบียนและเริ่มต้นใช้งาน'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Autocomplete Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .thai-address-wrapper input {
          width: 100%;
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          outline: none;
        }
        .thai-address-wrapper input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
        }
        .ant-select-dropdown {
          z-index: 9999 !important;
        }
      `}} />
    </div>
  );
};

export default Login;
