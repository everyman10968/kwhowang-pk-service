import React, { useState, useEffect } from 'react';
import { Calendar, Search, Phone, User, Building, MapPin, CheckCircle, XCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setQuotations(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('quotations')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } else {
      fetchQuotations();
      setIsStatusModalOpen(false);
      setSelectedQuote(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={14}/> รอดำเนินการ</span>;
      case 'contacted':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Phone size={14}/> ติดต่อแล้ว</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={14}/> เสร็จสิ้น</span>;
      case 'cancelled':
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={14}/> ยกเลิก</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold w-fit">{status}</span>;
    }
  };

  // Helper function to extract parts of the details string
  const parseDetails = (detailsString) => {
    if (!detailsString) return { type: '-', date: '-', address: '-', extra: '-' };
    
    // Default format from storefront: 
    // [ประเภท: จองคิวล้างแอร์]
    // วันที่สะดวก: 2024-01-01
    // ที่อยู่: บ้านเลขที่...
    // รายละเอียดเพิ่มเติม: อาการแอร์ไม่เย็น...
    
    const extract = (prefix) => {
      const match = detailsString.split('\n').find(line => line.startsWith(prefix));
      return match ? match.replace(prefix, '').trim() : null;
    };

    const typeMatch = detailsString.match(/\[ประเภท: (.*?)\]/);
    const type = typeMatch ? typeMatch[1] : 'ไม่ระบุ';
    
    return {
      type,
      date: extract('วันที่สะดวก: ') || '-',
      address: extract('ที่อยู่: ') || '-',
      extra: extract('รายละเอียดเพิ่มเติม: ') || detailsString
    };
  };

  const filteredQuotations = quotations.filter(q => 
    q.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.phone.includes(searchTerm) ||
    (q.details && q.details.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-primary-500" />
            จัดการคิวช่าง / ใบเสนอราคา
          </h2>
          <p className="text-sm text-gray-500 mt-1">รายชื่อลูกค้าที่จองคิวรับบริการ หรือขอใบเสนอราคาจากหน้าเว็บ</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ, เบอร์โทร, หรือบริการ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 font-medium">วันที่ขอ</th>
              <th className="p-4 font-medium">ลูกค้า / เบอร์โทร</th>
              <th className="p-4 font-medium">บริการที่ต้องการ</th>
              <th className="p-4 font-medium">สถานะ</th>
              <th className="p-4 font-medium text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
            ) : filteredQuotations.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">ไม่มีรายการจองคิว</td></tr>
            ) : filteredQuotations.map((quote) => {
              const parsedInfo = parseDetails(quote.details);
              return (
                <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 align-top">
                    <div className="text-gray-900 font-medium">
                      {new Date(quote.created_at).toLocaleDateString('th-TH')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(quote.created_at).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})} น.
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                      <User size={14} className="text-gray-400" /> {quote.contact_name}
                    </div>
                    <div className="text-gray-500 text-xs flex items-center gap-1.5">
                      <Phone size={12} className="text-gray-400" /> {quote.phone}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="font-bold text-primary-600 mb-1">{parsedInfo.type}</div>
                    <div className="text-gray-500 text-xs line-clamp-2 max-w-xs" title={parsedInfo.extra}>
                      {parsedInfo.extra}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    {getStatusBadge(quote.status)}
                  </td>
                  <td className="p-4 align-top text-right">
                    <button 
                      onClick={() => setSelectedQuote(quote)}
                      className="text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      ดูรายละเอียด / อัปเดต
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Details & Status Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-primary-500" /> รายละเอียดการจองคิว
              </h3>
              <button onClick={() => setSelectedQuote(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {(() => {
                const info = parseDetails(selectedQuote.details);
                return (
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">สถานะปัจจุบัน</p>
                        <div className="mt-1">{getStatusBadge(selectedQuote.status)}</div>
                      </div>
                      <button 
                        onClick={() => {
                          setNewStatus(selectedQuote.status);
                          setIsStatusModalOpen(true);
                        }}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors"
                      >
                        เปลี่ยนสถานะ
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-900 font-bold mb-4 border-b border-gray-100 pb-2">
                          <User size={18} className="text-primary-500" /> ข้อมูลลูกค้า
                        </div>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-gray-500 block mb-0.5">ชื่อ-นามสกุล:</span>
                            <span className="font-medium text-gray-900">{selectedQuote.contact_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-0.5">เบอร์โทรศัพท์:</span>
                            <span className="font-medium text-gray-900">{selectedQuote.phone}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-0.5">ประเภทลูกค้า:</span>
                            <span className="font-medium text-gray-900">{selectedQuote.company_name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 text-gray-900 font-bold mb-4 border-b border-gray-100 pb-2">
                          <Calendar size={18} className="text-primary-500" /> ความต้องการ
                        </div>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-gray-500 block mb-0.5">ประเภทบริการ:</span>
                            <span className="font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{info.type}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-0.5">วันที่สะดวก:</span>
                            <span className="font-medium text-gray-900">{info.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 text-gray-900 font-bold mb-3 border-b border-gray-100 pb-2">
                        <MapPin size={18} className="text-primary-500" /> สถานที่ติดตั้ง / หน้างาน
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{info.address}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 text-gray-900 font-bold mb-3 border-b border-gray-100 pb-2">
                        <FileText size={18} className="text-primary-500" /> รายละเอียดเพิ่มเติม (อาการเสีย / จำนวน)
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                        {info.extra}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Update Status Sub-Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">อัปเดตสถานะ</h3>
            <div className="space-y-3 mb-6">
              {[
                { value: 'new', label: 'รอดำเนินการ', color: 'text-red-700 bg-red-50' },
                { value: 'contacted', label: 'ติดต่อแล้ว / นัดหมายแล้ว', color: 'text-blue-700 bg-blue-50' },
                { value: 'completed', label: 'เสร็จสิ้น', color: 'text-green-700 bg-green-50' },
                { value: 'cancelled', label: 'ยกเลิก', color: 'text-gray-700 bg-gray-100' }
              ].map(status => (
                <label key={status.value} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${newStatus === status.value ? 'border-primary-500 ring-1 ring-primary-500 ' + status.color : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="status" 
                    value={status.value} 
                    checked={newStatus === status.value}
                    onChange={() => setNewStatus(status.value)}
                    className="mr-3 accent-primary-500 w-4 h-4"
                  />
                  <span className="font-bold text-sm">{status.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsStatusModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => updateStatus(selectedQuote.id, newStatus)}
                className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
              >
                บันทึกสถานะ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotations;
