import React, { useState } from 'react';
import { Wrench, Zap, Video, ThermometerSnowflake, ArrowRight, CheckCircle2, ChevronRight, X, ShoppingCart } from 'lucide-react';

const Storefront = () => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const services = [
    { id: 1, title: 'ซ่อมบำรุง/เดินระบบไฟฟ้า', icon: <Zap size={32} />, color: 'bg-yellow-500' },
    { id: 2, title: 'ติดตั้งระบบกล้องวงจรปิด', icon: <Video size={32} />, color: 'bg-blue-500' },
    { id: 3, title: 'ล้าง/ซ่อม/ติดตั้งแอร์', icon: <ThermometerSnowflake size={32} />, color: 'bg-cyan-500' },
    { id: 4, title: 'ซ่อมเครื่องมือช่างทั่วไป', icon: <Wrench size={32} />, color: 'bg-primary-500' },
  ];

  const products = [
    { id: 1, name: 'สว่านไร้สาย 20V Max', price: '2,490', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 2, name: 'ชุดประแจอเนกประสงค์ 108 ชิ้น', price: '1,290', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 3, name: 'เครื่องฉีดน้ำแรงดันสูง 120 Bar', price: '3,150', image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 4, name: 'ตู้เชื่อม Inverter 300A', price: '4,500', image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400&h=300' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="bg-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80" alt="Workshop" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-dark to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-primary-500/20 text-primary-400 text-sm font-semibold mb-4 border border-primary-500/30">
              มืออาชีพ ไว้ใจได้ รับประกันผลงาน
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              ศูนย์รวมเครื่องมือช่าง <br/>
              วัสดุ-อุปกรณ์สำนักงาน, คอมพิวเตอร์ <br/>
              <span className="text-primary-500">และบริการรับเหมา</span>ซ่อมบำรุง
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-xl">
              สินค้าคุณภาพมาตรฐานอุตสาหกรรม พร้อมทีมช่างผู้เชี่ยวชาญให้บริการถึงที่ ประเมินราคาก่อนซ่อม
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2">
                เรียกช่างด่วน <ArrowRight size={20} />
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors border border-white/20">
                ดูแคตตาล็อกสินค้า
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">บริการรับเหมาและซ่อมบำรุง</h2>
              <p className="text-gray-600">โดยทีมช่างผู้เชี่ยวชาญ ผ่านการอบรมมาตรฐาน</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer">
                <div className={`${service.color} text-white w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600 gap-2"><CheckCircle2 size={16} className="text-green-500" /> ประเมินหน้างานฟรี</li>
                  <li className="flex items-center text-sm text-gray-600 gap-2"><CheckCircle2 size={16} className="text-green-500" /> รับประกันงาน 6 เดือน</li>
                </ul>
                <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-dark hover:text-white hover:border-dark transition-colors">
                  จองคิวช่าง
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">สินค้าขายดี</h2>
              <p className="text-gray-600">เครื่องมือคุณภาพ สำหรับช่างมืออาชีพและงานอดิเรก</p>
            </div>
            <button className="hidden sm:flex items-center text-primary-600 font-medium hover:text-primary-700">
              ดูทั้งหมด <ChevronRight size={20} />
            </button>
          </div>

          {/* Horizontally scrollable container for mobile */}
          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 snap-x hide-scrollbar">
            {products.map((product) => (
              <div key={product.id} className="min-w-[280px] sm:min-w-0 flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow snap-center">
                <div className="h-48 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-primary-600">฿{product.price}</span>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2.5 rounded-full transition-colors">
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 mt-2 sm:hidden rounded-xl border border-gray-200 text-gray-700 font-medium flex items-center justify-center gap-2">
             ดูสินค้าทั้งหมด <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Corporate Quotation Section */}
      <section className="py-16 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute -right-20 -top-20 opacity-10">
              <Wrench size={400} />
            </div>
            <div className="relative z-10 md:w-2/3">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">สำหรับลูกค้าองค์กร / ผู้รับเหมา</h2>
              <p className="text-primary-100 text-lg mb-8 max-w-xl">
                เรามีราคาพิเศษสำหรับโปรเจกต์ขนาดใหญ่ พร้อมเครดิตเทอมสำหรับบริษัทที่ผ่านการอนุมัติ ขอใบเสนอราคาได้รวดเร็วภายใน 24 ชม.
              </p>
              <button 
                onClick={() => setShowQuoteModal(true)}
                className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg"
              >
                ขอใบเสนอราคา
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quotation Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={() => setShowQuoteModal(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">ขอใบเสนอราคา</h3>
              <button onClick={() => setShowQuoteModal(false)} className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท / องค์กร <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" placeholder="บจก. ตัวอย่าง" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ติดต่อ <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" placeholder="สมชาย ใจดี" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                    <input type="tel" className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" placeholder="08x-xxx-xxxx" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล <span className="text-red-500">*</span></label>
                  <input type="email" className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" placeholder="example@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า/งานที่ต้องการ <span className="text-red-500">*</span></label>
                  <textarea rows="4" className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50" placeholder="ระบุรายการสินค้า หรือลักษณะงานที่ต้องการให้ประเมินราคา..."></textarea>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
              <button 
                onClick={() => {
                  alert('ส่งคำขอใบเสนอราคาเรียบร้อยแล้ว (จำลอง)');
                  setShowQuoteModal(false);
                }}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-xl font-bold text-lg transition-colors"
              >
                ส่งข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for hiding scrollbar but keeping functionality */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default Storefront;
