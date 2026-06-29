import React, { useState, useEffect } from 'react';
import { Save, Lock, ShieldAlert, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminSettings = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('key', 'admin_password')
        .single();
        
      if (!error && data) {
        setPassword(data.value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setMessage({ text: 'กรุณากรอกรหัสผ่าน', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({ 
          key: 'admin_password', 
          value: password,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setMessage({ text: 'บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: 'เกิดข้อผิดพลาด: ' + error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">ความปลอดภัยและรหัสผ่าน</h2>
            <p className="text-sm text-gray-500 mt-1">จัดการรหัสผ่านสำหรับเข้าสู่ระบบหลังบ้าน (Admin Portal)</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">รหัสผ่านผู้ดูแลระบบ (Admin Password)</label>
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 text-gray-900 font-medium"
                  placeholder="กรอกรหัสผ่านใหม่ที่ต้องการ"
                />
                <KeyRound className="absolute left-4 top-3.5 text-gray-400" size={20} />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Lock size={12} /> รหัสผ่านนี้จะใช้สำหรับการเข้าสู่หน้าระบบจัดการร้านค้า
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
