import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiList, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    icon: '',
    bannerImage: '',
    trustPoints: '',
    displayOrder: 0,
    isActive: true,
    showOnApp: true,
    roles: ['worker']
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/service-categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load Service Categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setCurrentCategory(cat);
      setFormData({
        name: cat.name || '',
        description: cat.description || '',
        shortDescription: cat.shortDescription || '',
        icon: cat.icon || '',
        bannerImage: cat.bannerImage || '',
        trustPoints: cat.trustPoints ? cat.trustPoints.join(', ') : '',
        displayOrder: cat.displayOrder || 0,
        isActive: cat.isActive,
        showOnApp: cat.showOnApp,
        roles: cat.roles || ['worker']
      });
    } else {
      setCurrentCategory(null);
      setFormData({
        name: '', description: '', shortDescription: '', icon: '', bannerImage: '', trustPoints: '', displayOrder: 0, isActive: true, showOnApp: true, roles: ['worker']
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        trustPoints: formData.trustPoints.split(',').map(t => t.trim()).filter(t => t)
      };

      if (currentCategory) {
        await api.put(`/admin/service-categories/${currentCategory._id}`, payload);
        toast.success('Category updated successfully');
      } else {
        await api.post('/admin/service-categories', payload);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const toggleStatus = async (id, field, currentValue) => {
    try {
      await api.patch(`/admin/service-categories/${id}/status`, {
        [field]: !currentValue
      });
      toast.success('Status updated');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/admin/service-categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Premium Service Categories</h1>
          <p className="text-sm text-gray-500">Manage categories displayed on the Premium Services page</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#10AFA5] text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FiPlus /> Add Category
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Icon</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Name & Desc</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Roles</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Order</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Active</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-10 h-10 rounded bg-[#10AFA5]/10 flex items-center justify-center text-[#10AFA5]">
                      {cat.icon ? <span className="text-xs">{cat.icon}</span> : <FiImage />}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{cat.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                  </td>
                  <td className="p-4 text-sm font-medium">
                    <div className="flex gap-1 flex-wrap">
                      {(cat.roles || []).map(r => (
                        <span key={r} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium">{cat.displayOrder}</td>
                  <td className="p-4">
                    <button onClick={() => toggleStatus(cat._id, 'isActive', cat.isActive)} className={`px-3 py-1 rounded-full text-xs font-semibold ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => navigate(`/admin/sub-services?category=${cat._id}`)} className="px-3 py-1 text-[#10AFA5] bg-[#10AFA5]/10 rounded flex items-center gap-1 text-sm font-medium">
                      <FiList size={14} /> Sub Services
                    </button>
                    <button onClick={() => handleOpenModal(cat)} className="p-2 text-gray-400 hover:text-[#10AFA5] bg-gray-50 rounded">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => deleteCategory(cat._id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded">
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{currentCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setIsModalOpen(false)}><FiX size={24} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#10AFA5] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name/URL</label>
                  <input type="text" className="w-full p-2 border rounded-lg" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input type="number" className="w-full p-2 border rounded-lg" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="2" className="w-full p-2 border rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trust Points (comma separated)</label>
                <input type="text" className="w-full p-2 border rounded-lg" placeholder="Expert Team, 24/7 Support" value={formData.trustPoints} onChange={e => setFormData({...formData, trustPoints: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-[#10AFA5]" />
                  <span className="text-sm font-medium">Is Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.showOnApp} onChange={e => setFormData({...formData, showOnApp: e.target.checked})} className="w-4 h-4 text-[#10AFA5]" />
                  <span className="text-sm font-medium">Show on App</span>
                </label>
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available For (Roles)</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.roles.includes('worker')} 
                      onChange={e => {
                        const newRoles = e.target.checked 
                          ? [...formData.roles, 'worker'] 
                          : formData.roles.filter(r => r !== 'worker');
                        setFormData({...formData, roles: newRoles});
                      }} 
                      className="w-4 h-4 text-[#10AFA5]" 
                    />
                    <span className="text-sm font-medium">Worker</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.roles.includes('engineer')} 
                      onChange={e => {
                        const newRoles = e.target.checked 
                          ? [...formData.roles, 'engineer'] 
                          : formData.roles.filter(r => r !== 'engineer');
                        setFormData({...formData, roles: newRoles});
                      }} 
                      className="w-4 h-4 text-[#10AFA5]" 
                    />
                    <span className="text-sm font-medium">Engineer</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#10AFA5] text-white rounded-lg">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCategories;
