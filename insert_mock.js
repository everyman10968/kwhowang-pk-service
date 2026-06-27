const url = 'https://vwchtbsgalrwnciznvtm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y2h0YnNnYWxyd25jaXpudnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTExMzIsImV4cCI6MjA5ODAyNzEzMn0.lmPL8TaRGkEb5Tidf0VHddGTJKlIBvMYDi5EkL-TdtU';

const firstNames = ['สมชาย', 'สมหญิง', 'วินัย', 'ประยุทธ์', 'ธนาธร', 'พิธา', 'แพทองธาร', 'เศรษฐา', 'สุดารัตน์', 'ชัชชาติ', 'ณัฐวุฒิ', 'ทักษิณ'];
const lastNames = ['ใจดี', 'รักชาติ', 'แซ่ตั้ง', 'วงศ์สุวรรณ', 'ทองดี', 'เจริญสุข', 'ศรีสุวรรณ', 'รักสงบ', 'มุ่งมั่น', 'ตั้งใจ'];
const jobTypes = ['จองคิวล้างแอร์', 'จองคิวติดตั้งแอร์', 'จองคิวซ่อมแอร์', 'จองคิวเดินระบบไฟฟ้า', 'จองคิวติดตั้งกล้องวงจรปิด', 'จองคิวระบบเน็ตเวิร์ค', 'ขอใบเสนอราคา (โปรเจกต์อื่นๆ)'];
const statuses = ['new', 'new', 'new', 'contacted', 'contacted', 'completed', 'cancelled'];
const addresses = ['หมู่บ้านสิริ 99/9 ต.ค้อวัง', 'ซอยหลังอำเภอ บ้านเลขที่ 11', 'ร้านทองเจริญ ม.1', 'บริษัท สยาม จำกัด อ.เมือง', 'บ้านเลขที่ 55/5 ต.น้ำอ้อม'];
const extraDetails = [
  'แอร์ 9000 BTU 1 ตัว', 
  'อาการแอร์ไม่เย็นมีแต่ลม แอร์เก่ามาก', 
  'เดินสายไฟใหม่ทั้งบ้าน 2 ชั้น', 
  'ติดกล้อง 4 ตัว ขอสเปคภาพชัดกลางคืน', 
  'สัญญาณเน็ตชั้น 2 ไม่ดี อยากเดินสายแลน', 
  'แอร์น้ำหยดหนักมาก ด่วนเลยครับ',
  'ขอใบเสนอราคาคอมพิวเตอร์ออฟฟิศ 5 เครื่อง'
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone() {
  return '08' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
}

const mockData = Array.from({ length: 20 }).map((_, i) => {
  const type = getRandom(jobTypes);
  const date = new Date(Date.now() + Math.floor(Math.random() * 10) * 86400000).toISOString().split('T')[0];
  const address = getRandom(addresses);
  const extra = getRandom(extraDetails);
  
  const details = `[ประเภท: ${type}]\nวันที่สะดวก: ${date}\nที่อยู่: ${address}\nรายละเอียดเพิ่มเติม: ${extra}`;
  
  return {
    company_name: Math.random() > 0.8 ? 'บริษัท ลูกค้าองค์กร จำกัด' : 'ลูกค้าทั่วไป',
    contact_name: getRandom(firstNames) + ' ' + getRandom(lastNames),
    phone: generatePhone(),
    email: '-',
    details: details,
    status: getRandom(statuses)
  };
});

fetch(url + '/rest/v1/quotations', {
  method: 'POST',
  headers: { 
    'apikey': key, 
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify(mockData)
})
.then(r => {
  if(r.ok) console.log('Successfully inserted 20 records');
  else return r.text().then(console.error);
})
.catch(console.error);
