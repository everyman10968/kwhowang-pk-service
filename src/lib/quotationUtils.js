import { FileText, Truck, Receipt, CheckCircle2 } from 'lucide-react';

// ตัวเลือกสถานะขั้นตอนการดำเนินการ
export const STATUS_OPTIONS = [
  {
    id: 'quoted',
    label: 'กำลังจัดทำ',
    shortLabel: '1. กำลังจัดทำ',
    color: 'blue',
    bgClass: 'bg-blue-50/40 hover:bg-blue-100/40 border-l-4 border-l-blue-500 text-blue-950',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    dotColor: 'bg-blue-500',
    icon: FileText
  },
  {
    id: 'delivery_sent',
    label: 'ส่งใบส่งของแล้ว',
    shortLabel: '2. ใบส่งของ',
    color: 'amber',
    bgClass: 'bg-amber-50/40 hover:bg-amber-100/40 border-l-4 border-l-amber-500 text-amber-950',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    dotColor: 'bg-amber-500',
    icon: Truck,
    defaultLocked: true
  },
  {
    id: 'receipt_sent',
    label: 'ส่งใบเสร็จรับเงินแล้ว',
    shortLabel: '3. ใบเสร็จ',
    color: 'purple',
    bgClass: 'bg-purple-50/40 hover:bg-purple-100/40 border-l-4 border-l-purple-500 text-purple-950',
    badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200',
    dotColor: 'bg-purple-500',
    icon: Receipt,
    defaultLocked: true
  },
  {
    id: 'paid',
    label: 'รับเงินเรียบร้อยแล้ว',
    shortLabel: '4. รับเงิน',
    color: 'emerald',
    bgClass: 'bg-emerald-50/40 hover:bg-emerald-100/40 border-l-4 border-l-emerald-500 text-emerald-950',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    dotColor: 'bg-emerald-500',
    icon: CheckCircle2,
    defaultLocked: true,
    hasPaymentDate: true
  }
];

export const getStepIndex = (statusId) => STATUS_OPTIONS.findIndex(s => s.id === statusId);

export const normalizeStatus = (statusStr) => {
  if (statusStr === 'paid') return 'paid';
  if (statusStr === 'delivery_sent' || statusStr === 'shipped') return 'delivery_sent';
  if (statusStr === 'receipt_sent') return 'receipt_sent';
  return 'quoted';
};

// ฟังก์ชันแปลงวันที่คริสต์ศักราช (YYYY-MM-DD) เป็นวันที่ไทย (DD/MM/YYYY พ.ศ.)
export const formatThaiDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
};

// ข้อมูลร้านค้า (ใช้ร่วมกันทั้ง 2 ร้าน)
export const shopConfig = {
  pk: {
    name: 'ร้าน PK เครื่องมือช่าง',
    shortName: 'PK',
    address: '23 หมู่ 7 ตำบลค้อวัง อำเภอค้อวัง จังหวัดยโสธร 35160',
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
    shortName: '888',
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

// แปลงแถวจากตาราง quotations ให้เป็นใบเสนอราคาที่ออกโดยแอดมิน
// คืนค่า null หากไม่ใช่ใบเสนอราคาที่ออกโดยแอดมิน (เช่น คิวช่างจากหน้าร้าน)
export const parseAdminQuotation = (q) => {
  try {
    if (!q.details || !q.details.trim().startsWith('{')) return null;
    const detailsObj = JSON.parse(q.details);
    if (!detailsObj.is_admin_issued) return null;

    const itemShopType = detailsObj.shopType || 'pk';
    const shop = shopConfig[itemShopType] || shopConfig.pk;
    const rawStatus = detailsObj.status || q.status || 'quoted';
    const statusKey = normalizeStatus(rawStatus);
    const parsedStatusDates = detailsObj.statusDates || {
      quoted: detailsObj.date || (q.created_at ? q.created_at.split('T')[0] : ''),
      delivery_sent: detailsObj.deliveryDate || '',
      receipt_sent: detailsObj.receiptDate || '',
      paid: detailsObj.paymentDate || q.paymentDate || ''
    };
    if (!parsedStatusDates.quoted && (detailsObj.date || q.date)) {
      parsedStatusDates.quoted = detailsObj.date || q.date;
    }

    return {
      ...q,
      isAdminIssued: true,
      shopType: itemShopType,
      qtNumber: detailsObj.qtNumber || `${shop.prefix}${q.id}`,
      date: detailsObj.date || '',
      showDate: detailsObj.showDate !== undefined ? detailsObj.showDate : true,
      validityDays: detailsObj.validityDays || '30 วัน',
      deliveryDays: detailsObj.deliveryDays || '7 วัน',
      clientAddress: detailsObj.clientAddress || '',
      items: detailsObj.items || [],
      totalAmount: detailsObj.totalAmount || 0,
      status: statusKey,
      statusDates: parsedStatusDates,
      paymentDate: parsedStatusDates.paid || detailsObj.paymentDate || q.paymentDate || '',
      isUnlocked: detailsObj.isUnlocked === true
    };
  } catch (e) {
    return null;
  }
};
