import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Trash2, Printer, Edit2, Search, ArrowLeft, 
  User, MapPin, Phone, Calendar, Clock, DollarSign, CheckCircle2,
  Package, PlusCircle, Save, XCircle, Download, Truck, Receipt
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ฟังก์ชันแปลงตัวเลขเป็นคำอ่านเงินบาทภาษาไทย
const bahtText = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '';
  num = parseFloat(num);
  if (num === 0) return 'ศูนย์บาทถ้วน';

  const numberWords = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const digitWords = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const parts = num.toFixed(2).split('.');
  let baht = parts[0];
  let satang = parts[1];

  let bahtStr = '';

  const convertSection = (str) => {
    let result = '';
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str.charAt(i), 10);
      if (digit !== 0) {
        if (i === len - 1 && digit === 1 && len > 1) {
          result += 'เอ็ด';
        } else if (i === len - 2 && digit === 2) {
          result += 'ยี่';
        } else if (i === len - 2 && digit === 1) {
          result += 'สิบ';
        } else {
          result += numberWords[digit];
        }
        if (i !== len - 2 || digit !== 1) {
          result += digitWords[len - 1 - i];
        }
      }
    }
    return result;
  };

  // จัดการส่วนล้าน
  let bahtLen = baht.length;
  if (bahtLen > 6) {
    const millionSection = baht.substring(0, bahtLen - 6);
    const normalSection = baht.substring(bahtLen - 6);
    bahtStr = convertSection(millionSection) + 'ล้าน' + convertSection(normalSection);
  } else {
    bahtStr = convertSection(baht);
  }

  if (bahtStr !== '') {
    bahtStr += 'บาท';
  }

  let satangStr = '';
  if (parseInt(satang, 10) === 0) {
    satangStr = 'ถ้วน';
  } else {
    if (satang.charAt(0) === '0') {
      satangStr = numberWords[parseInt(satang.charAt(1), 10)] + 'สตางค์';
    } else {
      const digit = parseInt(satang.charAt(0), 10);
      const unit = parseInt(satang.charAt(1), 10);
      let tenStr = '';
      if (digit === 1) tenStr = 'สิบ';
      else if (digit === 2) tenStr = 'ยี่สิบ';
      else tenStr = numberWords[digit] + 'สิบ';

      let unitStr = '';
      if (unit === 1) unitStr = 'เอ็ด';
      else if (unit !== 0) unitStr = numberWords[unit];

      satangStr = tenStr + unitStr + 'สตางค์';
    }
  }

  return bahtStr + satangStr;
};

const shopConfig = {
  pk: {
    name: 'ร้าน PK เครื่องมือช่าง',
    address: '23 หมู่ 7 ตำบลค้อวัง อำเภอค้อวัง จังหวัดยโสธร 35150',
    phone: '093-429-5184',
    taxId: '1103700513329',
    owner: 'นายวรศักดิ์ ปัญญารักษ์',
    logo: '/logo.png',
    prefix: 'PK-',
    dnPrefix: 'DN-',
    rcPrefix: 'RC-'
  },
  888: {
    name: 'ร้าน ทรัพย์ไพศาล 888',
    address: '258 หมู่7 ตำบลค้อวัง อำเภอค้อวัง จังหวัดยโสธร 35160',
    phone: '091-015-3272',
    taxId: '1350700061580',
    owner: 'นางสาวจารุวรรณ มีศิลป์',
    logo: '/logo_888.png',
    prefix: 'SP-',
    dnPrefix: 'DN888-',
    rcPrefix: 'RC888-'
  }
};

const AdminIssueQuotation = ({ shopType = 'pk' }) => {
  const currentShop = shopConfig[shopType] || shopConfig.pk;
  const [quotations, setQuotations] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit'
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // State สำหรับพิมพ์และส่งออกรูปภาพ
  const [printData, setPrintData] = useState(null);
  const [printDocType, setPrintDocType] = useState('quotation'); // 'quotation', 'delivery', 'receipt'

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [qtNumber, setQtNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [qtDate, setQtDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showDate, setShowDate] = useState(true);
  const [validityDays, setValidityDays] = useState('30 วัน');
  const [deliveryDays, setDeliveryDays] = useState('7 วัน');
  const [items, setItems] = useState([
    { description: '', quantity: 1, unit: 'เครื่อง', unitPrice: 0 }
  ]);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  useEffect(() => {
    fetchQuotations();
    fetchProducts();
    fetchCustomers();
  }, [shopType]);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (data) setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const [profilesRes, addressesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('full_name'),
        supabase.from('addresses').select('*')
      ]);

      if (profilesRes.data) {
        const merged = profilesRes.data.map(p => {
          const addrs = (addressesRes.data || []).filter(a => a.user_id === p.id);
          const defaultAddr = addrs.find(a => a.is_default) || addrs[0] || null;
          return {
            ...p,
            addresses: addrs,
            defaultAddress: defaultAddr
          };
        });
        setCustomers(merged);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // กรองเอาเฉพาะข้อมูลที่เป็นใบเสนอราคาที่ออกโดยแอดมิน (เก็บใน details ในรูปแบบ JSON)
        const parsedQts = data.map(q => {
          try {
            if (q.details && q.details.trim().startsWith('{')) {
              const detailsObj = JSON.parse(q.details);
              if (detailsObj.is_admin_issued) {
                const itemShopType = detailsObj.shopType || 'pk';
                if (itemShopType === shopType) {
                  return {
                    ...q,
                    isAdminIssued: true,
                    qtNumber: detailsObj.qtNumber || `${currentShop.prefix}${q.id}`,
                    date: detailsObj.date || '',
                    showDate: detailsObj.showDate !== undefined ? detailsObj.showDate : true,
                    validityDays: detailsObj.validityDays || '30 วัน',
                    deliveryDays: detailsObj.deliveryDays || '7 วัน',
                    clientAddress: detailsObj.clientAddress || '',
                    items: detailsObj.items || [],
                    totalAmount: detailsObj.totalAmount || 0,
                    paymentDate: detailsObj.paymentDate || ''
                  };
                }
              }
            }
          } catch (e) {
            // ไม่ใช่รูปแบบ JSON แอดมิน
          }
          return { ...q, isAdminIssued: false };
        }).filter(q => q.isAdminIssued);

        setQuotations(parsedQts);
      }
    } catch (err) {
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  // สร้างเลขที่ใบเสนอราคาอัตโนมัติ (PK-YYYYMM-XXX)
  const generateQuotationNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${currentShop.prefix}${year}${month}-`;

    // กรองใบเสนอราคาเฉพาะเดือนนี้
    const thisMonthQts = quotations.filter(q => q.qtNumber && q.qtNumber.startsWith(prefix));
    let nextIndex = 1;

    if (thisMonthQts.length > 0) {
      // ค้นหาดัชนีสูงสุด
      const indices = thisMonthQts.map(q => {
        const parts = q.qtNumber.split('-');
        const idxStr = parts[parts.length - 1];
        return parseInt(idxStr, 10) || 0;
      });
      nextIndex = Math.max(...indices) + 1;
    }

    return `${prefix}${String(nextIndex).padStart(3, '0')}`;
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setQtNumber(generateQuotationNumber());
    setClientName('');
    setClientAddress('');
    setClientPhone('');
    setQtDate(new Date().toISOString().split('T')[0]);
    setShowDate(true);
    setValidityDays('30 วัน');
    setDeliveryDays('7 วัน');
    setItems([{ description: '', quantity: 1, unit: 'เครื่อง', unitPrice: 0 }]);
    setViewMode('create');
  };

  const handleOpenEdit = (qt) => {
    setEditingId(qt.id);
    setQtNumber(qt.qtNumber);
    setClientName(qt.contact_name);
    setClientAddress(qt.clientAddress);
    setClientPhone(qt.phone);
    setQtDate(qt.date);
    setShowDate(qt.showDate !== undefined ? qt.showDate : true);
    setValidityDays(qt.validityDays);
    setDeliveryDays(qt.deliveryDays);
    setItems(qt.items.length > 0 ? qt.items : [{ description: '', quantity: 1, unit: 'เครื่อง', unitPrice: 0 }]);
    setViewMode('edit');
  };

  const handleAddItemRow = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'เครื่อง', unitPrice: 0 }]);
  };

  const handleRemoveItemRow = (idx) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const newItems = items.map((item, i) => {
      if (i === idx) {
        let parsedVal = value;
        if (field === 'quantity') parsedVal = parseInt(value, 10) || 0;
        if (field === 'unitPrice') parsedVal = parseFloat(value) || 0;
        return { ...item, [field]: parsedVal };
      }
      return item;
    });
    setItems(newItems);
  };

  const handleAddProductToItems = (prod) => {
    const lastItem = items[items.length - 1];
    const isLastEmpty = !lastItem.description && lastItem.unitPrice === 0;

    const newItem = {
      description: prod.name,
      quantity: 1,
      unit: 'ชิ้น',
      unitPrice: prod.price
    };

    if (isLastEmpty) {
      setItems(items.map((it, idx) => idx === items.length - 1 ? newItem : it));
    } else {
      setItems([...items, newItem]);
    }

    setProductSearch('');
    setShowProductDropdown(false);
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleSaveQuotation = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('กรุณากรอกชื่อลูกค้า');
      return;
    }

    setSaving(true);
    const subtotal = getSubtotal();

    const detailsJson = JSON.stringify({
      is_admin_issued: true,
      shopType,
      qtNumber,
      date: qtDate,
      showDate,
      validityDays,
      deliveryDays,
      clientAddress,
      items,
      totalAmount: subtotal
    });

    const existingStatus = editingId ? (quotations.find(q => q.id === editingId)?.status || 'pending') : 'pending';

    const payload = {
      company_name: clientName.includes('บจก') || clientName.includes('บริษัท') ? 'ลูกค้าองค์กร' : 'ลูกค้าทั่วไป',
      contact_name: clientName,
      phone: clientPhone,
      email: '-',
      details: detailsJson,
      status: existingStatus
    };

    try {
      if (viewMode === 'edit' && editingId) {
        const { error } = await supabase
          .from('quotations')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        alert('อัปเดตใบเสนอราคาเรียบร้อยแล้ว');
      } else {
        const { error } = await supabase
          .from('quotations')
          .insert([payload]);
        if (error) throw error;
        alert('บันทึกใบเสนอราคาสำเร็จ');
      }

      setViewMode('list');
      fetchQuotations();
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuotation = async (id) => {
    if (!id) {
      alert('ไม่พบ ID สำหรับการลบ');
      return;
    }
    if (window.confirm('คุณต้องการลบใบเสนอราคานี้ใช่หรือไม่?')) {
      try {
        const { error } = await supabase
          .from('quotations')
          .delete()
          .eq('id', id);
        if (error) throw error;
        alert('ลบเรียบร้อยแล้ว');
        await fetchQuotations();
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบ: ' + error.message);
      }
    }
  };

  const handleConfirmPayment = async (qt) => {
    const defaultDate = new Date().toLocaleDateString('th-TH');
    const inputDate = window.prompt('กรุณากรอกวันที่รับเงิน:', defaultDate);
    if (inputDate === null) return; // กดยกเลิก
    
    try {
      let detailsObj = {};
      try {
        detailsObj = JSON.parse(qt.details);
      } catch (e) {
        detailsObj = {};
      }
      
      detailsObj.paymentDate = inputDate || defaultDate;
      
      const { error } = await supabase
        .from('quotations')
        .update({
          status: 'paid',
          details: JSON.stringify(detailsObj)
        })
        .eq('id', qt.id);
        
      if (error) throw error;
      alert('ยืนยันรับเงินเรียบร้อยแล้ว');
      await fetchQuotations();
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleCancelPayment = async (qt) => {
    if (!window.confirm('คุณต้องการยกเลิกสถานะรับเงินของเอกสารนี้ใช่หรือไม่?')) return;
    
    try {
      let detailsObj = {};
      try {
        detailsObj = JSON.parse(qt.details);
      } catch (e) {
        detailsObj = {};
      }
      
      delete detailsObj.paymentDate;
      
      const { error } = await supabase
        .from('quotations')
        .update({
          status: 'pending',
          details: JSON.stringify(detailsObj)
        })
        .eq('id', qt.id);
        
      if (error) throw error;
      alert('ยกเลิกสถานะรับเงินเรียบร้อยแล้ว');
      await fetchQuotations();
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handlePrint = (qt, docType = 'quotation') => {
    setPrintData(qt);
    setPrintDocType(docType);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const filteredQuotations = quotations.filter(q =>
    q.qtNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ======== ส่วนหัวกระดาษร้านค้า (ใช้ร่วมกันทุกเอกสาร) ========
  const renderShopHeader = (data, docTitle, docNumber) => (
    <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
      <div className="flex gap-3 text-left">
        <img src={currentShop.logo} alt="Shop Logo" className="w-14 h-14 object-contain border border-gray-200 rounded animate-fade-in" onError={(e) => e.target.style.display = 'none'} />
        <div>
          <h1 className="text-lg font-extrabold tracking-tight">{currentShop.name}</h1>
          <p className="text-[10px] font-bold text-gray-805 mt-0.5">บริหารงานโดย {currentShop.owner}</p>
          <p className="text-[10px] text-gray-700">ที่อยู่: {currentShop.address}</p>
          <p className="text-[10px] text-gray-700">โทรศัพท์: {currentShop.phone}</p>
          <p className="text-[10px] text-gray-700">เลขประจำตัวผู้เสียภาษีอากร: {currentShop.taxId}</p>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-lg font-extrabold border border-black px-3 py-1 uppercase bg-gray-50">{docTitle}</h2>
        <div className="text-[10px] text-gray-700 mt-2 space-y-0.5">
          <p><span className="font-bold">เลขที่:</span> {docNumber}</p>
          <p><span className="font-bold">วันที่:</span> {data.showDate && data.date ? new Date(data.date).toLocaleDateString('th-TH') : '..........................'}</p>
        </div>
      </div>
    </div>
  );

  // ======== ตารางสินค้าแชร์ ========
  const renderItemsTable = (data, showPrice = true) => {
    const emptyRowsCount = 0;
    return (
      <table className="w-full text-left border-collapse border border-black text-[11px] mb-3">
        <thead>
          <tr className="bg-gray-50 border-b border-black text-center font-bold">
            <th className="border border-black p-1.5 w-10">ลำดับ</th>
            <th className="border border-black p-1.5 text-left">รายการสินค้า / บริการ</th>
            <th className="border border-black p-1.5 w-14 text-center">จำนวน</th>
            <th className="border border-black p-1.5 w-14 text-center">หน่วยนับ</th>
            {showPrice && <th className="border border-black p-1.5 w-24 text-right">หน่วยละ (บาท)</th>}
            {showPrice && <th className="border border-black p-1.5 w-24 text-right">รวมเงิน (บาท)</th>}
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => (
            <tr key={idx} className="h-7 align-top">
              <td className="border border-black p-1.5 text-center align-top">{idx + 1}</td>
              <td className="border border-black p-1.5 whitespace-pre-wrap align-top">{item.description}</td>
              <td className="border border-black p-1.5 text-center align-top">{item.quantity}</td>
              <td className="border border-black p-1.5 text-center align-top">{item.unit}</td>
              {showPrice && <td className="border border-black p-1.5 text-right align-top">{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
              {showPrice && <td className="border border-black p-1.5 text-right font-medium align-top">{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>}
            </tr>
          ))}
          {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-7">
              <td className="border border-black p-1.5"></td>
              <td className="border border-black p-1.5"></td>
              <td className="border border-black p-1.5"></td>
              <td className="border border-black p-1.5"></td>
              {showPrice && <td className="border border-black p-1.5"></td>}
              {showPrice && <td className="border border-black p-1.5"></td>}
            </tr>
          ))}
          {showPrice && (
            <>
              <tr>
                <td colSpan="4" className="border border-black p-1.5 bg-gray-50 font-bold text-center">จำนวนเงินตัวอักษร: {bahtText(data.totalAmount)}</td>
                <td className="border border-black p-1.5 bg-gray-50 text-right font-bold">รวมเงิน</td>
                <td className="border border-black p-1.5 bg-gray-50 text-right font-bold">{data.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td colSpan="4" className="border border-black p-1.5 text-gray-500 italic text-[10px] align-middle">* ไม่มีภาษีมูลค่าเพิ่ม</td>
                <td className="border border-black p-1.5 bg-gray-100 text-right font-extrabold">รวมเงินทั้งสิ้น</td>
                <td className="border border-black p-1.5 bg-gray-100 text-right font-extrabold text-primary-600">{data.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    );
  };

  // ======== เรนเดอร์ใบเสนอราคา ========
  const renderQuotationSheet = (data) => {
    const emptyRowsCount = Math.max(0, 10 - data.items.length);
    return (
      <>
        {renderShopHeader(data, 'ใบเสนอราคา / QUOTATION', data.qtNumber)}

        {/* ส่วนรายละเอียดลูกค้า */}
        <div className="grid grid-cols-12 gap-2 border border-black p-2 mb-2 rounded bg-white">
          <div className="col-span-8 space-y-0.5 text-left">
            <p><span className="font-bold">เรียน:</span> {data.contact_name}</p>
            <p><span className="font-bold">ที่อยู่:</span> {data.clientAddress || '-'}</p>
            <p><span className="font-bold">โทรศัพท์:</span> {data.phone || '-'}</p>
          </div>
          <div className="col-span-4 text-right space-y-0.5 border-l border-gray-300 pl-3">
            <p><span className="font-bold">กำหนดยืนราคา:</span> {data.validityDays || '30 วัน'}</p>
            <p><span className="font-bold">กำหนดส่งมอบ:</span> {data.deliveryDays || '7 วัน'}</p>
          </div>
        </div>

        <p className="text-[11px] font-medium text-gray-805 mb-2 text-left">เรื่อง: {currentShop.name} ขอเสนอราคาสินค้า/บริการ ดังรายการต่อไปนี้</p>

        {renderItemsTable(data, true)}

        {/* เงื่อนไข */}
        <div className="text-[10px] space-y-0.5 text-gray-855 mb-4 font-medium text-left">
          <p>1. ราคานี้รวมภาษีมูลค่าเพิ่ม รวมทั้งภาษีอากรอื่น และค่าใช้จ่ายทั้งปวงไว้ด้วยแล้ว</p>
          <p>2. ข้าพเจ้าขอรับรองว่า จะส่งมอบสินค้าดังกล่าวข้างต้นได้ภายในกำหนด</p>
        </div>

        {/* ลายเซ็น */}
        <div className="flex justify-end mb-6">
          <div className="text-center w-56">
            <p className="text-xs mb-8">ขอแสดงความนับถือ</p>
            <div className="border-b border-black w-40 mx-auto mb-1"></div>
            <p className="text-xs font-bold">{currentShop.owner}</p>
            <p className="text-[9px] text-gray-500 mt-0.5">ผู้เสนอราคา</p>
          </div>
        </div>

        {/* ส่วนอนุมัติ */}
        <div className="grid grid-cols-2 gap-4 border-t border-black pt-4 text-xs mt-6">
          <div className="text-center space-y-4">
            <p className="font-bold">ผู้ขออนุมัติ</p>
            <div className="border-b border-black w-40 mx-auto pt-2"></div>
            <p>วันที่ ......./......./.......</p>
          </div>
          <div className="text-center space-y-4 border-l border-black pl-4">
            <p className="font-bold">ผู้มีอำนาจอนุมัติสั่งซื้อ</p>
            <div className="border-b border-black w-40 mx-auto pt-2"></div>
            <p>วันที่ ......./......./.......</p>
          </div>
        </div>
      </>
    );
  };

  // ======== เรนเดอร์ใบส่งของ (Delivery Note) ========
  const renderDeliveryNote = (data) => {
    const dnNumber = data.qtNumber.replace(currentShop.prefix, currentShop.dnPrefix);
    return (
      <>
        {renderShopHeader(data, 'ใบส่งของ / DELIVERY NOTE', dnNumber)}

        {/* ข้อมูลผู้รับ */}
        <div className="border border-black p-2 mb-2 rounded bg-white text-left space-y-0.5">
          <p><span className="font-bold">ผู้รับของ:</span> {data.contact_name}</p>
          <p><span className="font-bold">ที่อยู่จัดส่ง:</span> {data.clientAddress || '-'}</p>
          <p><span className="font-bold">โทรศัพท์:</span> {data.phone || '-'}</p>
        </div>

        <p className="text-[11px] font-medium text-gray-805 mb-2 text-left">รายการสินค้าที่ส่งมอบ</p>

        {/* ตารางสินค้า (แสดงราคา) */}
        {renderItemsTable(data, true)}

        {/* หมายเหตุ */}
        <div className="text-[10px] space-y-0.5 text-gray-855 mb-4 font-medium text-left">
          <p>หมายเหตุ: กรุณาตรวจสอบสินค้าให้เรียบร้อยก่อนเซ็นรับ</p>
        </div>

        {/* ลายเซ็น */}
        <div className="grid grid-cols-2 gap-4 border-t border-black pt-4 text-xs mt-6">
          <div className="text-center space-y-4">
            <p className="font-bold">ผู้ส่งของ</p>
            <div className="border-b border-black w-40 mx-auto pt-6"></div>
            <p className="text-xs font-bold">{currentShop.owner}</p>
            <p>วันที่ ......./......./.......</p>
          </div>
          <div className="text-center space-y-4 border-l border-black pl-4">
            <p className="font-bold">ผู้รับของ</p>
            <div className="border-b border-black w-40 mx-auto pt-6"></div>
            <p className="text-xs">(............................................)</p>
            <p>วันที่ ......./......./.......</p>
          </div>
        </div>
      </>
    );
  };

  // ======== เรนเดอร์ใบเสร็จรับเงิน (Receipt) ========
  const renderReceipt = (data) => {
    const rcNumber = data.qtNumber.replace(currentShop.prefix, currentShop.rcPrefix);
    return (
      <>
        {renderShopHeader(data, 'ใบเสร็จรับเงิน / RECEIPT', rcNumber)}

        {/* ข้อมูลผู้จ่ายเงิน */}
        <div className="border border-black p-2 mb-2 rounded bg-white text-left space-y-0.5">
          <p><span className="font-bold">ได้รับเงินจาก:</span> {data.contact_name}</p>
          <p><span className="font-bold">ที่อยู่:</span> {data.clientAddress || '-'}</p>
          <p><span className="font-bold">โทรศัพท์:</span> {data.phone || '-'}</p>
        </div>

        <p className="text-[11px] font-medium text-gray-805 mb-2 text-left">รายการสินค้า/บริการที่ชำระเงิน</p>

        {/* ตารางสินค้า (แสดงราคา) */}
        {renderItemsTable(data, true)}

        {/* วิธีการชำระเงิน */}
        <div className="text-[10px] space-y-0.5 text-gray-855 mb-4 font-medium text-left">
          <p>ชำระโดย: □ เงินสด  □ โอนเงิน  □ อื่นๆ ....................</p>
        </div>

        {/* ลายเซ็น */}
        <div className="grid grid-cols-2 gap-4 border-t border-black pt-4 text-xs mt-6">
          <div className="text-center space-y-4">
            <p className="font-bold">ผู้จ่ายเงิน</p>
            <div className="border-b border-black w-40 mx-auto pt-6"></div>
            <p className="text-xs">(............................................)</p>
            <p>วันที่ ......./......./.......</p>
          </div>
          <div className="text-center space-y-4 border-l border-black pl-4">
            <p className="font-bold">ผู้รับเงิน</p>
            <div className="border-b border-black w-40 mx-auto pt-6"></div>
            <p className="text-xs font-bold">{currentShop.owner}</p>
            <p>วันที่ ......./......./.......</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="w-full relative">
      {/* 1. สไตล์สำหรับการพิมพ์ (Print Styles) */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
          }
          .print-only {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            z-index: 99999 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 10mm 10mm 10mm 10mm;
          }
        }
      `}</style>

      {/* ==================== SCREEN VIEW (ส่วนแสดงผลบนจอคอมพิวเตอร์) ==================== */}
      <div className="no-print space-y-6">

        {viewMode === 'list' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="text-primary-500" />
                  ออกใบเสนอราคามาตรฐาน
                </h2>
                <p className="text-sm text-gray-500 mt-1">ออกใบเสนอราคาและพิมพ์เอกสารอย่างมืออาชีพให้กับลูกค้า</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อลูกค้า หรือเลขที่..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
                <button
                  onClick={handleOpenCreate}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary-500/20"
                >
                  <Plus size={16} /> ออกใบเสนอราคาใหม่
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="p-4 font-medium">เลขที่ใบเสนอราคา</th>
                    <th className="p-4 font-medium">วันที่เสนอ</th>
                    <th className="p-4 font-medium">ลูกค้า (เรียน)</th>
                    <th className="p-4 font-medium">ยอดเงินรวมสุทธิ</th>
                    <th className="p-4 font-medium text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                  ) : filteredQuotations.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">ไม่พบข้อมูลใบเสนอราคา</td></tr>
                  ) : filteredQuotations.map((qt) => {
                    const isPaid = qt.status === 'paid';
                    return (
                      <tr 
                        key={qt.id} 
                        className={`transition-colors border-b border-gray-100 ${
                          isPaid 
                            ? 'bg-green-50/60 hover:bg-green-100/50 text-green-900 border-l-4 border-l-green-500' 
                            : 'hover:bg-gray-50/50'
                        }`}
                      >
                        <td className="p-4 align-middle">
                          <span className="font-bold text-gray-900">{qt.qtNumber}</span>
                          <div className="mt-1">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <CheckCircle2 size={10} /> รับเงินแล้ว ({qt.paymentDate || 'ไม่ระบุวันที่'})
                              </span>
                            ) : (
                              <span className="inline-flex items-center bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                รอชำระเงิน
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-500 align-middle">
                          {qt.showDate && qt.date ? new Date(qt.date).toLocaleDateString('th-TH') : 'ไม่แสดง'}
                        </td>
                        <td className="p-4 font-medium text-gray-900 align-middle">
                          {qt.contact_name}
                          {qt.phone && <p className="text-xs text-gray-500 mt-0.5">{qt.phone}</p>}
                        </td>
                        <td className="p-4 font-bold text-primary-600 align-middle">฿{qt.totalAmount.toLocaleString()}</td>
                        <td className="p-4 text-right align-middle">
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {isPaid ? (
                              <button
                                type="button"
                                onClick={() => handleCancelPayment(qt)}
                                className="inline-flex items-center gap-1 bg-white border border-orange-200 hover:border-orange-300 text-orange-600 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg font-bold transition-colors text-xs"
                                title="ยกเลิกการยืนยันรับเงิน"
                              >
                                ยกเลิกรับเงิน
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleConfirmPayment(qt)}
                                className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg font-bold transition-colors text-xs shadow-sm"
                                title="ยืนยันการรับชำระเงิน"
                              >
                                <CheckCircle2 size={13} /> ยืนยันรับเงิน
                              </button>
                            )}
                            <button 
                              type="button"
                              onClick={() => handlePrint(qt, 'quotation')}
                              className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 hover:border-blue-300 text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors text-xs"
                              title="พิมพ์ใบเสนอราคา"
                            >
                              <Printer size={13} /> ใบเสนอราคา
                            </button>
                            <button 
                              type="button"
                              onClick={() => handlePrint(qt, 'delivery')}
                              className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 hover:border-orange-300 text-orange-600 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors text-xs"
                              title="พิมพ์ใบส่งของ"
                            >
                              <Truck size={13} /> ใบส่งของ
                            </button>
                            <button 
                              type="button"
                              onClick={() => handlePrint(qt, 'receipt')}
                              className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 hover:border-purple-300 text-purple-600 hover:bg-purple-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors text-xs"
                              title="พิมพ์ใบเสร็จรับเงิน"
                            >
                              <Receipt size={13} /> ใบเสร็จ
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleOpenEdit(qt)}
                              className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors text-xs"
                            >
                              <Edit2 size={13} /> แก้ไข
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteQuotation(qt.id)}
                              className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 hover:border-red-300 text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors text-xs"
                            >
                              <Trash2 size={13} /> ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b-gray-100 pb-4 border-b">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors"
              >
                <ArrowLeft size={18} className="mr-1" /> ย้อนกลับ
              </button>
              <h3 className="text-lg font-bold text-gray-900">
                {viewMode === 'create' ? 'สร้างใบเสนอราคาใหม่' : `แก้ไขใบเสนอราคา: ${qtNumber}`}
              </h3>
            </div>

            <form onSubmit={handleSaveQuotation} className="space-y-6">

              {/* ส่วนหัวรายละเอียด */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">เลขที่ใบเสนอราคา</label>
                  <input
                    type="text"
                    value={qtNumber}
                    onChange={(e) => setQtNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">วันที่ออกใบเสนอราคา</label>
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setShowDate(true)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border ${showDate
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      แสดงวันที่
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDate(false)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border ${!showDate
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      ไม่แสดง
                    </button>
                  </div>
                  {showDate ? (
                    <input
                      type="date"
                      value={qtDate}
                      onChange={(e) => setQtDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-400 italic px-1">จะแสดงเป็น "วันที่ .........................." ในใบเสนอราคา</p>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-1">เรียน (ชื่อลูกค้า/บริษัท)</label>
                  <input
                    type="text"
                    placeholder="บจก. ตัวอย่าง หรือ คุณสมศรี ใจดี"
                    value={clientName}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    required
                  />
                  {showCustomerDropdown && clientName && (
                    (() => {
                      const matched = customers.filter(c =>
                        c.full_name.toLowerCase().includes(clientName.toLowerCase()) ||
                        (c.phone && c.phone.includes(clientName))
                      );
                      if (matched.length === 0) return null;
                      return (
                        <div className="absolute top-16 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-gray-50">
                          {matched.map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setClientName(c.full_name);
                                if (c.phone) setClientPhone(c.phone);
                                if (c.defaultAddress) {
                                  const addr = c.defaultAddress;
                                  setClientAddress(`${addr.address_line} ต.${addr.district} อ.${addr.amphoe} จ.${addr.province} ${addr.zipcode}`);
                                } else {
                                  setClientAddress('');
                                }
                                setShowCustomerDropdown(false);
                              }}
                              className="p-3 hover:bg-primary-50 cursor-pointer flex flex-col text-xs text-left"
                            >
                              <span className="font-bold text-gray-900">{c.full_name}</span>
                              <span className="text-gray-500 mt-0.5">เบอร์โทร: {c.phone || '-'}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">ที่อยู่ลูกค้า</label>
                  <input
                    type="text"
                    placeholder="เช่น 123 ถ.สุขุมวิท ตำบลค้อวัง อำเภอค้อวัง จังหวัดยโสธร 35150"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">เบอร์โทรศัพท์ลูกค้า</label>
                    <input
                      type="tel"
                      placeholder="08X-XXX-XXXX"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">กำหนดยืนราคา</label>
                    <input
                      type="text"
                      value={validityDays}
                      onChange={(e) => setValidityDays(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">กำหนดส่งมอบสินค้า</label>
                    <input
                      type="text"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* ค้นหาและหยิบดึงสินค้าจากสต็อก */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Package size={16} className="text-primary-500" />
                  ตัวช่วย: ดึงข้อมูลสินค้าเดิมในร้าน
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="พิมพ์รหัสหรือชื่อสินค้าในสต็อกเพื่อดึงข้อมูล..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="w-full px-3 py-2 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" size={16} />

                  {showProductDropdown && productSearch && (
                    <div className="absolute top-11 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto divide-y divide-gray-50">
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">ไม่พบสินค้าในสต็อก</div>
                      ) : (
                        filteredProducts.map(p => (
                          <div
                            key={p.id}
                            onClick={() => handleAddProductToItems(p)}
                            className="p-3 hover:bg-primary-50 cursor-pointer flex items-center justify-between text-sm"
                          >
                            <span className="font-medium text-gray-900">{p.name}</span>
                            <span className="font-bold text-primary-600">฿{p.price.toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* รายการสินค้าในตาราง */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 text-md">รายการเสนอราคาสินค้า/บริการ</h4>

                <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                        <th className="p-3 w-12 text-center">ลำดับ</th>
                        <th className="p-3">รายการสินค้า / บริการ</th>
                        <th className="p-3 w-28 text-center">จำนวน</th>
                        <th className="p-3 w-28 text-center">หน่วยนับ</th>
                        <th className="p-3 w-40">ราคาต่อหน่วย (บาท)</th>
                        <th className="p-3 w-40">รวมเงิน (บาท)</th>
                        <th className="p-3 w-16 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 text-center text-gray-500 font-bold">{idx + 1}</td>
                          <td className="p-3">
                            <textarea
                              rows="2"
                              placeholder="เช่น แอร์ติดผนังขนาด 9000 BTU&#10;รุ่น PK-Premium (ระบุรายละเอียดเพิ่มเติมได้)"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm resize-y"
                              required
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-center text-sm"
                              required
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="เครื่อง/ชุด"
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 text-center text-sm"
                              required
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium text-sm text-right"
                              required
                            />
                          </td>
                          <td className="p-3 font-bold text-gray-900 text-right">
                            ฿{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              disabled={items.length === 1}
                              className="text-red-400 hover:text-red-600 disabled:text-gray-300 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="border border-primary-500 text-primary-500 hover:bg-primary-50 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5"
                  >
                    <PlusCircle size={16} /> เพิ่มรายการใหม่
                  </button>

                  {/* แสดงสรุปยอดเงินภาษาไทย */}
                  <div className="text-right space-y-2 max-w-md">
                    <div className="text-sm text-gray-500">
                      <span className="font-bold text-gray-700">จำนวนเงินตัวอักษร:</span> {bahtText(getSubtotal())}
                    </div>
                    <div className="text-lg font-bold text-gray-900 border-t border-gray-100 pt-2 flex justify-end gap-10">
                      <span>ยอดรวมทั้งสิ้น:</span>
                      <span className="text-primary-600">฿{getSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ปุ่มบันทึก */}
              <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'กำลังบันทึก...' : 'บันทึกใบเสนอราคา'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ==================== PRINT VIEW (ส่วนฟอร์มกระดาษที่จะพิมพ์จริง) ==================== */}
      {printData && (
        <div className="print-only mx-auto text-black bg-white font-sans" style={{ fontSize: '11px', lineHeight: '1.3' }}>
          {printDocType === 'quotation' && renderQuotationSheet(printData)}
          {printDocType === 'delivery' && renderDeliveryNote(printData)}
          {printDocType === 'receipt' && renderReceipt(printData)}
        </div>
      )}

    </div>
  );
};

export default AdminIssueQuotation;
