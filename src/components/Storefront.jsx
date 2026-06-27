import React, { useState } from 'react';
import { 
  Wrench, Zap, Video, Network, ThermometerSnowflake, 
  ArrowRight, CheckCircle2, ShoppingCart, Calendar, FileText, 
  X, PenTool, Monitor, Printer, HardHat, MapPin, Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import ProductDetailModal from './ProductDetailModal';

const Storefront = ({ onNavigate }) => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ 
    type: 'จองคิวล้างแอร์', // default
    name: '', 
    phone: '', 
    address: '', 
    date: '',
    details: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (data) setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fullDetails = `[ประเภท: ${quoteForm.type}]\nวันที่สะดวก: ${quoteForm.date || 'ไม่ระบุ'}\nที่อยู่: ${quoteForm.address}\nรายละเอียดเพิ่มเติม: ${quoteForm.details}`;
      
      const { error } = await supabase.from('quotations').insert([
        {
          company_name: 'ลูกค้าทั่วไป', // Default for individuals
          contact_name: quoteForm.name,
          phone: quoteForm.phone,
          email: '-',
          details: fullDetails,
          status: 'new'
        }
      ]);
      if (error) throw error;
      alert('ส่งข้อมูลเรียบร้อยแล้ว! ทีมงานจะติดต่อกลับโดยเร็วที่สุดครับ');
      setShowQuoteModal(false);
      setQuoteForm({ type: 'จองคิวล้างแอร์', name: '', phone: '', address: '', date: '', details: '' });
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการส่ง: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const services = [
    { id: 1, title: 'ติดตั้งแอร์บ้าน', desc: 'ติดตั้งแอร์ใหม่ ย้ายแอร์ โดยช่างแอร์มืออาชีพ', icon: <ThermometerSnowflake size={32} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { id: 2, title: 'ล้างแอร์บ้าน', desc: 'ล้างทำความสะอาดแอร์ ขจัดฝุ่นและเชื้อโรค', icon: <ThermometerSnowflake size={32} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 3, title: 'ซ่อมแอร์บ้าน', desc: 'แอร์ไม่เย็น น้ำหยด มีเสียงดัง เราซ่อมได้', icon: <Wrench size={32} />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { id: 4, title: 'เดินระบบไฟฟ้า', desc: 'ซ่อมไฟ เดินสายไฟใหม่ ติดตั้งเบรกเกอร์ โคมไฟ', icon: <Zap size={32} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 5, title: 'ติดตั้งกล้องวงจรปิด', desc: 'CCTV ดูออนไลน์ผ่านมือถือได้ 24 ชม.', icon: <Video size={32} />, color: 'text-red-400', bg: 'bg-red-500/10' },
    { id: 6, title: 'ระบบเน็ตเวิร์ค', desc: 'เดินสายแลน (LAN) ติดตั้ง Wi-Fi แก้ปัญหาเน็ตหลุด', icon: <Network size={32} />, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  const productCategories = [
    { id: 1, title: 'เครื่องมือช่าง', desc: 'สว่าน หินเจียร ประแจ อุปกรณ์ช่างทุกชนิด', icon: <PenTool size={24} />, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 2, title: 'วัสดุ และอุปกรณ์', desc: 'สีทาบ้าน หมวกนิรภัย อุปกรณ์ก่อสร้าง', icon: <HardHat size={24} />, image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 3, title: 'อุปกรณ์ไฟฟ้าและแสงสว่าง', desc: 'หลอดไฟ สายไฟ เบรกเกอร์', icon: <Zap size={24} />, image: 'https://images.unsplash.com/photo-1558455850-8de63d4db5ba?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 4, title: 'คอมพิวเตอร์และเน็ตเวิร์ค', desc: 'สายแลน เราเตอร์ อะไหล่คอมพิวเตอร์', icon: <Monitor size={24} />, image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 5, title: 'กล้องวงจรปิด', desc: 'กล้องวงจรปิด CCTV ทั้งในและนอกบ้าน', icon: <Video size={24} />, image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 6, title: 'อุปกรณ์แอร์และอะไหล่', desc: 'น้ำยาล้างแอร์ ท่อทองแดง อะไหล่แอร์', icon: <ThermometerSnowflake size={24} />, image: 'https://images.unsplash.com/photo-1620608514104-585dcfe1a221?auto=format&fit=crop&q=80&w=400&h=300' },
  ];

  return (
    <div className="flex flex-col w-full bg-gray-900 text-gray-100 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80" 
            alt="Engineering Background" 
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary-500/20 text-primary-400 text-sm font-bold mb-6 border border-primary-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(234,88,12,0.3)]">
              ช่างผู้เชี่ยวชาญ ประสบการณ์สูง
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
              รับเหมาติดตั้ง ซ่อมบำรุง <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-500">
                ครบวงจร โดยมืออาชีพ
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-6 max-w-2xl leading-relaxed">
              บริการติดตั้งและซ่อมแอร์ เดินระบบไฟฟ้า กล้องวงจรปิด และระบบเน็ตเวิร์ค พร้อมจัดจำหน่ายเครื่องมือช่างและอุปกรณ์คอมพิวเตอร์ครบครัน
            </p>
            <div className="flex items-center gap-2 mb-10 text-primary-400 font-medium bg-primary-500/10 w-fit px-4 py-2 rounded-lg border border-primary-500/20">
              <MapPin size={20} />
              <span>พื้นที่ให้บริการ: จ.ยโสธร, จ.ศรีสะเกษ, จ.อุบลราชธานี และพื้นที่ใกล้เคียง</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowQuoteModal(true)}
                className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(234,88,12,0.6)] hover:-translate-y-1"
              >
                <Calendar size={20} /> จองคิวช่าง / ขอใบเสนอราคา
              </button>
              <button 
                onClick={() => {
                  setSelectedCategory(null);
                  setShowAllProducts(true);
                  document.getElementById('products-catalog').scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-gray-700 hover:border-gray-600 flex items-center justify-center gap-2"
              >
                ดูสินค้าทั้งหมด <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">บริการรับเหมาและซ่อมบำรุง</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              ให้บริการโดยทีมช่างผู้เชี่ยวชาญเฉพาะทาง พร้อมรับประกันผลงานและดูแลหลังการขาย
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600 transition-all hover:-translate-y-1 group cursor-pointer shadow-lg"
                onClick={() => {
                  setQuoteForm(prev => ({ ...prev, type: `จองคิว: ${service.title}` }));
                  setShowQuoteModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`${service.bg} ${service.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  <div className="bg-gray-900 p-2 rounded-full border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                    <ArrowRight size={16} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {service.desc}
                </p>
                <div className="flex items-center text-sm text-primary-500 font-medium group-hover:text-primary-400">
                  <CheckCircle2 size={16} className="mr-2" /> ประเมินหน้างานฟรี
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
      </div>

      {/* Products Category Section */}
      <section id="products-section" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">หมวดหมู่สินค้าจัดจำหน่าย</h2>
              <p className="text-gray-400 max-w-xl">
                นอกจากบริการรับเหมา เรายังมีสินค้าคุณภาพสูงจัดจำหน่าย เพื่อรองรับการใช้งานทุกรูปแบบ
              </p>
            </div>
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setShowAllProducts(true);
                setTimeout(() => {
                  document.getElementById('products-catalog').scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-2 transition-colors"
            >
              ดูสินค้าทั้งหมด <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productCategories.map((category) => (
              <div 
                key={category.id} 
                className="group rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 hover:border-primary-500/50 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedCategory(category);
                  setTimeout(() => {
                    document.getElementById('products-catalog').scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gray-900/40 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-primary-400">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white">{category.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {category.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section id="products-catalog" className="py-20 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="text-center md:text-left flex-1">
              {selectedCategory ? (
                <>
                  <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                    <button onClick={() => setSelectedCategory(null)} className="text-gray-400 hover:text-white transition-colors">
                      <ArrowRight className="rotate-180" size={24} />
                    </button>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">สินค้าหมวดหมู่: {selectedCategory.title}</h2>
                  </div>
                  <p className="text-gray-400 max-w-xl ml-9">
                    {selectedCategory.desc}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                    {showAllProducts && (
                      <button onClick={() => setShowAllProducts(false)} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowRight className="rotate-180" size={24} />
                      </button>
                    )}
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {showAllProducts ? 'สินค้าทั้งหมด' : 'สินค้าขายดี (Top 4 Best Sellers)'}
                    </h2>
                  </div>
                  <p className="text-gray-400 max-w-xl">
                    {showAllProducts ? 'เลือกดูสินค้าคุณภาพทั้งหมดของเราได้ที่นี่' : 'สินค้ายอดนิยมที่ขายดีที่สุด การันตีคุณภาพและราคาพิเศษ'}
                  </p>
                </>
              )}
            </div>
            
            <div className="w-full md:w-auto relative">
              <input 
                type="text" 
                placeholder="ค้นหาสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 pl-10 pr-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
          </div>
          
          {loadingProducts ? (
            <div className="flex justify-center py-20 text-primary-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products
                .filter(p => !selectedCategory || p.category_id === selectedCategory.id)
                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())))
                .slice(0, selectedCategory || searchQuery || showAllProducts ? undefined : 4)
                .map((product) => (
                <div 
                  key={product.id} 
                  className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-primary-500/50 transition-all flex flex-col group h-full cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="h-48 bg-gray-700 relative overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PenTool className="text-gray-600 opacity-20" size={48} />
                      </div>
                    )}
                    {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                        เหลือเพียง {product.stock_quantity} ชิ้น
                      </div>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="absolute top-2 left-2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                        สินค้าหมด
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                      {product.description || 'รายละเอียดสินค้า'}
                    </p>
                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-700/50">
                      <div>
                        <span className="block text-xs text-gray-500 mb-0.5">ราคา</span>
                        <span className="text-xl font-bold text-primary-400">฿{product.price.toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        disabled={product.stock_quantity === 0}
                        className="bg-primary-600 hover:bg-primary-500 disabled:bg-gray-700 disabled:text-gray-500 text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-primary-500/20 disabled:shadow-none relative z-10"
                        title={product.stock_quantity === 0 ? "สินค้าหมด" : "หยิบใส่ตะกร้า"}
                      >
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-600"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">มีโปรเจกต์ใหญ่ หรือต้องการปรึกษาช่าง?</h2>
              <p className="text-primary-100 text-lg">
                เรายินดีให้คำปรึกษาฟรี พร้อมทีมช่างเข้าประเมินพื้นที่หน้างาน ติดต่อเราวันนี้เพื่อรับข้อเสนอที่ดีที่สุด
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <button 
                onClick={() => setShowQuoteModal(true)}
                className="bg-white text-primary-700 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-xl"
              >
                ขอใบเสนอราคา
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Booking / Quotation Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative">
            <button 
              onClick={() => setShowQuoteModal(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="text-primary-500" size={28} />
                <h3 className="text-2xl font-bold text-white">จองคิว / ขอใบเสนอราคา</h3>
              </div>
              <p className="text-gray-400 mb-8 text-sm">กรุณากรอกข้อมูลเพื่อให้ทีมช่างติดต่อกลับ หรือประเมินราคางาน</p>
              
              <form onSubmit={handleQuoteSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">ความต้องการ</label>
                  <select 
                    value={quoteForm.type}
                    onChange={(e) => setQuoteForm({...quoteForm, type: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="จองคิวล้างแอร์">ล้างแอร์บ้าน</option>
                    <option value="จองคิวติดตั้งแอร์">ติดตั้งแอร์บ้าน</option>
                    <option value="จองคิวซ่อมแอร์">ซ่อมแอร์บ้าน</option>
                    <option value="จองคิวเดินระบบไฟฟ้า">ซ่อม/เดินระบบไฟฟ้า</option>
                    <option value="จองคิวติดตั้งกล้องวงจรปิด">ติดตั้งกล้องวงจรปิด</option>
                    <option value="จองคิวระบบเน็ตเวิร์ค">ติดตั้งระบบเน็ตเวิร์ค</option>
                    <option value="ขอใบเสนอราคา (โปรเจกต์อื่นๆ)">ขอใบเสนอราคางานโปรเจกต์อื่นๆ</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">ชื่อ-นามสกุล / ชื่อบริษัท</label>
                    <input 
                      type="text" 
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm({...quoteForm, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="นายสมชาย / บจก.ตัวอย่าง"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">เบอร์โทรศัพท์ติดต่อ</label>
                    <input 
                      type="tel" 
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="08X-XXX-XXXX"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">ที่อยู่หน้างาน / สถานที่ติดตั้ง</label>
                    <input 
                      type="text" 
                      value={quoteForm.address}
                      onChange={(e) => setQuoteForm({...quoteForm, address: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="หมู่บ้าน, บ้านเลขที่, ซอย, ถนน, ตำบล, อำเภอ, จังหวัด"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">วันที่สะดวกให้เข้าประเมิน/ทำงาน (ถ้ามี)</label>
                    <input 
                      type="date" 
                      value={quoteForm.date}
                      onChange={(e) => setQuoteForm({...quoteForm, date: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">รายละเอียดเพิ่มเติม (ขนาดแอร์, จำนวนกล้อง, อาการเสีย ฯลฯ)</label>
                  <textarea 
                    value={quoteForm.details}
                    onChange={(e) => setQuoteForm({...quoteForm, details: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                    placeholder="แอร์ 9000 BTU 1 ตัว, อาการแอร์ไม่เย็นมีแต่ลม..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-xl font-bold text-lg transition-colors mt-4 disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {submitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการจองคิว / ขอใบเสนอราคา'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

    </div>
  );
};

export default Storefront;
