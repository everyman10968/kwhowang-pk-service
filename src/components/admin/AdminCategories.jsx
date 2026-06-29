import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setCategories(data || []);
    setLoading(false);
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        image_url: category.image_url || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '', description: '', image_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `category_${Date.now()}_${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('category_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('category_images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const { error } = await supabase.from('categories').update(formData).eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([formData]);
        if (error) throw error;
      }

      handleCloseModal();
      fetchCategories();
    } catch (error) {
      alert('Error saving category: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?\n*ข้อควรระวัง: หากมีสินค้าอยู่ในหมวดหมู่นี้ อาจทำให้เกิดข้อผิดพลาดได้ ควรย้ายสินค้าก่อนลบ*')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        fetchCategories();
      } else {
        alert('Error deleting category. It might be used by existing products.');
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">จัดการหมวดหมู่สินค้า</h2>
          <p className="text-sm text-gray-500 mt-1">เพิ่ม แก้ไข และจัดการรูปหน้าปกของหมวดหมู่ทั้งหมดในระบบ</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <input 
              type="text" 
              placeholder="ค้นหาหมวดหมู่..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> <span className="hidden sm:inline">เพิ่มหมวดหมู่ใหม่</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100 uppercase">
            <tr>
              <th className="px-6 py-4 font-bold">รูปหน้าปก</th>
              <th className="px-6 py-4 font-bold">ชื่อหมวดหมู่</th>
              <th className="px-6 py-4 font-bold">คำอธิบาย</th>
              <th className="px-6 py-4 text-right font-bold">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-gray-500">
                  ไม่พบหมวดหมู่สินค้า
                </td>
              </tr>
            ) : filteredCategories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center flex-shrink-0">
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs">ไม่มีรูปภาพ</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{category.name}</td>
                <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{category.description || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(category)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors bg-white rounded-md border border-gray-200 hover:border-blue-200 shadow-sm" title="แก้ไข">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-md border border-gray-200 hover:border-red-200 shadow-sm" title="ลบ">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-dark/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">{editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหมวดหมู่</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รูปหน้าปกหมวดหมู่</label>
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
                <p className="text-xs text-gray-400">รูปภาพปกจะแสดงในหน้าร้านค้าเมื่อลูกค้าเลือกดูตามหมวดหมู่</p>
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

export default AdminCategories;
