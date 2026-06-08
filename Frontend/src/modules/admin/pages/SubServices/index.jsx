import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiArrowLeft, FiX } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const SubServices = () => {
  const [subServices, setSubServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSub, setCurrentSub] = useState(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [formData, setFormData] = useState({
    categoryId: categoryFilter || '',
    name: '',
    description: '',
    icon: '',
    image: '',
    startingPrice: 0,
    rating: 4.8,
    reviewCount: 128,
    displayOrder: 0,
    isActive: true,
    isFeatured: false
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch categories for the dropdown
      const catRes = await api.get('/admin/service-categories');
      if (catRes.data.success) {
        setCategories(catRes.data.data);
      }

      // Fetch sub-services
      const url = categoryFilter 
        ? `/admin/sub-services?categoryId=${categoryFilter}` 
        : '/admin/sub-services';
      
      const subRes = await api.get(url);
      if (subRes.data.success) {
        setSubServices(subRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load Sub Services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const handleOpenModal = (sub = null) => {
    if (sub) {
      setCurrentSub(sub);
      setFormData({
        categoryId: sub.categoryId?._id || sub.categoryId || '',
        name: sub.name || '',
        description: sub.description || '',
        icon: sub.icon || '',
        image: sub.image || '',
        startingPrice: sub.startingPrice || 0,
        rating: sub.rating || 4.8,
        reviewCount: sub.reviewCount || 128,
        displayOrder: sub.displayOrder || 0,
        isActive: sub.isActive,
        isFeatured: sub.isFeatured || false
      });
    } else {
      setCurrentSub(null);
      setFormData({
        categoryId: categoryFilter || (categories.length > 0 ? categories[0]._id : ''),
        name: '', description: '', icon: '', image: '', startingPrice: 0, rating: 4.8, reviewCount: 128, displayOrder: 0, isActive: true, isFeatured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentSub) {
        await api.put(`/admin/sub-services/${currentSub._id}`, formData);
        toast.success('Sub Service updated successfully');
      } else {
        await api.post('/admin/sub-services', formData);
        toast.success('Sub Service created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save sub service');
    }
  };

  const toggleStatus = async (id, field, currentValue) => {
    try {
      await api.patch(`/admin/sub-services/${id}/status`, {
        [field]: !currentValue
      });
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteSubService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sub service?')) return;
    try {
      await api.delete(`/admin/sub-services/${id}`);
      toast.success('Sub Service deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete sub service');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/service-categories')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50">
            <FiArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sub Services</h1>
            <p className="text-sm text-gray-500">Manage individual services within categories</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#10AFA5] text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FiPlus /> Add Sub Service
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
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Name & Category</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Active</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subServices.map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-10 h-10 rounded bg-[#10AFA5]/10 flex items-center justify-center text-[#10AFA5]">
                      {sub.icon ? <span className="text-xs">{sub.icon}</span> : <FiImage />}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{sub.name}</p>
                    <p className="text-xs text-[#10AFA5] font-medium">{sub.categoryId?.name}</p>
                  </td>
                  <td className="p-4 font-bold text-gray-800">₹{sub.startingPrice}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-400">★</span>
                      <span className="font-bold">{sub.rating}</span>
                      <span className="text-gray-400 text-xs">({sub.reviewCount})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleStatus(sub._id, 'isActive', sub.isActive)} className={`px-3 py-1 rounded-full text-xs font-semibold ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sub.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(sub)} className="p-2 text-gray-400 hover:text-[#10AFA5] bg-gray-50 rounded">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => deleteSubService(sub._id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded">
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
              <h2 className="text-xl font-bold">{currentSub ? 'Edit Sub Service' : 'Add Sub Service'}</h2>
              <button onClick={() => setIsModalOpen(false)}><FiX size={24} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <select required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#10AFA5] outline-none bg-white" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub Service Name</label>
                  <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#10AFA5] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="2" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#10AFA5] outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price (₹)</label>
                  <input required type="number" min="0" className="w-full p-2 border rounded-lg" value={formData.startingPrice} onChange={e => setFormData({...formData, startingPrice: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <input type="number" step="0.1" min="0" max="5" className="w-full p-2 border rounded-lg" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reviews Count</label>
                  <input type="number" min="0" className="w-full p-2 border rounded-lg" value={formData.reviewCount} onChange={e => setFormData({...formData, reviewCount: e.target.value})} />
                </div>
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

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-[#10AFA5]" />
                  <span className="text-sm font-medium">Is Active</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#10AFA5] text-white rounded-lg">Save Sub Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubServices;
