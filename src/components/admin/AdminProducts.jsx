import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    image_url: '',
    gallery_images: [],
    is_active: true
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error) setCategories(data || []);
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        gallery_images: product.gallery_images || [],
        is_active: product.is_active
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', description: '', price: '', stock_quantity: '', category_id: categories.length > 0 ? categories[0].id : '', image_url: '', gallery_images: [], is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `product_images/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingGallery(true);
    const newUrls = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product_images')
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }

      setFormData(prev => ({ 
        ...prev, 
        gallery_images: [...(prev.gallery_images || []), ...newUrls] 
      }));
    } catch (error) {
      alert('Error uploading gallery images: ' + error.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity, 10),
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }

      handleCloseModal();
      fetchProducts();
    } catch (error) {
      alert('Error saving product: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        fetchProducts();
      } else {
        alert('Error deleting product');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">จัดการสินค้า</h2>
          <p className="text-sm text-gray-500 mt-1">เพิ่ม ลบ หรือแก้ไขข้อมูลสินค้าและสต็อก</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} /> เพิ่มสินค้า
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-medium">รูปภาพ</th>
              <th className="p-4 font-medium">ชื่อสินค้า</th>
              <th className="p-4 font-medium">หมวดหมู่</th>
              <th className="p-4 font-medium">ราคา</th>
              <th className="p-4 font-medium">สต็อก</th>
              <th className="p-4 font-medium">สถานะ</th>
              <th className="p-4 font-medium text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">ไม่พบข้อมูลสินค้า</td></tr>
            ) : filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-gray-400" />
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-900">{product.name}</td>
                <td className="p-4 text-gray-500">{product.categories?.name || '-'}</td>
                <td className="p-4 font-medium text-primary-600">฿{product.price.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`font-medium ${product.stock_quantity <= 5 ? 'text-red-500' : 'text-green-600'}`}>
                    {product.stock_quantity}
                  </span>
                </td>
                <td className="p-4">
                  {product.is_active ? (
                    <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">แสดงผล</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-medium">ซ่อน</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(product)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors bg-white rounded-md border border-gray-200 hover:border-blue-200 shadow-sm">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-md border border-gray-200 hover:border-red-200 shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-dark/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">{editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท)</label>
                  <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนสต็อก</label>
                  <input required type="number" min="0" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                  <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="">ไม่มีหมวดหมู่</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500" />
                    <label htmlFor="isActive" className="text-sm text-gray-700">แสดงผลหน้าร้าน</label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพหลักของสินค้า</label>
                  <div className="flex items-start gap-4 mb-2">
                    {formData.image_url && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                      {uploading && <span className="text-xs text-primary-500 mt-2 block">กำลังอัปโหลด...</span>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-6">รองรับไฟล์ JPG, PNG หรือ WebP ขนาดไม่เกิน 2MB</p>

                  {/* Gallery Images */}
                  <label className="block text-sm font-medium text-gray-700 mb-2 border-t border-gray-100 pt-4">รูปภาพเพิ่มเติม (แกลลอรี่)</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {formData.gallery_images && formData.gallery_images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadingGallery && <span className="text-xs text-blue-500 mt-2 block">กำลังอัปโหลดรูปภาพแกลลอรี่...</span>}
                  <p className="text-xs text-gray-400 mt-2">เลือกได้หลายไฟล์พร้อมกัน</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" disabled={uploading} className="px-6 py-2 rounded-lg font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50">
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
