import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiUploadCloud } from 'react-icons/fi';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    badge: '',
    imageUrl: '',
    mobileImageUrl: '',
    ctaText: 'Book Now',
    redirectType: 'none',
    redirectValue: '',
    bannerType: 'home_banner',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/banners');
      if (res.data.success) {
        setBanners(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Close modal instantly for fast UI
    setIsModalOpen(false);
    
    // Optimistic UI update
    const optimisticBanner = { ...formData, _id: Date.now().toString() };
    if (!currentBanner) {
      setBanners(prev => [optimisticBanner, ...prev]);
    } else {
      setBanners(prev => prev.map(b => b._id === currentBanner._id ? optimisticBanner : b));
    }

    try {
      let finalImageUrl = formData.imageUrl;
      
      // Upload image to Cloudinary ONLY when submitting
      if (pendingFile) {
        toast.loading('Uploading image & saving...', { id: 'banner-action' });
        const uploadFormData = new FormData();
        uploadFormData.append('file', pendingFile);
        
        const res = await api.post('/admin/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000 // 60 seconds timeout for image uploads
        });
        
        if (res.data.success) {
          finalImageUrl = res.data.imageUrl || res.data.url;
        } else {
          throw new Error('Image upload failed');
        }
      } else {
        toast.loading('Saving banner...', { id: 'banner-action' });
      }
      
      const payload = { ...formData, imageUrl: finalImageUrl };
      
      if (currentBanner) {
        await api.put(`/admin/banners/${currentBanner._id}`, payload, { timeout: 30000 });
        toast.success('Banner updated successfully', { id: 'banner-action' });
      } else {
        await api.post('/admin/banners', payload, { timeout: 30000 });
        toast.success('Banner created successfully', { id: 'banner-action' });
      }
      
      setPendingFile(null);
      fetchBanners(); // Fetch real data to replace optimistic IDs
    } catch (error) {
      console.error('Error saving banner:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Operation failed';
      toast.error(errorMsg, { id: 'banner-action' });
      fetchBanners(); // Revert on failure
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      const previousBanners = [...banners];
      // Optimistic delete for instant UI feedback
      setBanners(prev => prev.filter(b => b._id !== id));
      
      try {
        await api.delete(`/admin/banners/${id}`);
        toast.success('Banner deleted');
      } catch (error) {
        setBanners(previousBanners); // Revert on failure
        toast.error('Failed to delete banner');
      }
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local preview for fast UI response
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, [field]: previewUrl }));
    setPendingFile(file); // Store file to upload later during submit
  };

  const openModal = (banner = null) => {
    if (banner) {
      setCurrentBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        badge: banner.badge || '',
        imageUrl: banner.imageUrl || '',
        mobileImageUrl: banner.mobileImageUrl || '',
        ctaText: banner.ctaText || 'Book Now',
        redirectType: banner.redirectType || 'none',
        redirectValue: banner.redirectValue || '',
        bannerType: banner.bannerType || 'home_banner',
        isActive: banner.isActive !== undefined ? banner.isActive : true,
        sortOrder: banner.sortOrder || 0
      });
    } else {
      setCurrentBanner(null);
      setPendingFile(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        badge: '',
        imageUrl: '',
        mobileImageUrl: '',
        ctaText: 'Book Now',
        redirectType: 'none',
        redirectValue: '',
        bannerType: 'home_banner',
        isActive: true,
        sortOrder: 0
      });
    }
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dynamic Banners & Offers</h1>
        <button
          onClick={() => openModal()}
          className="bg-[#10AFA5] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0d8f87]"
        >
          <FiPlus /> Add New Banner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Image</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Type</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-4">
                  {banner.imageUrl ? (
                    <img fetchPriority="low" loading="lazy" src={banner.imageUrl} alt={banner.title} className="w-24 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-24 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      <FiImage size={20} />
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    banner.bannerType === 'home_banner' ? 'bg-blue-100 text-blue-800' : 
                    banner.bannerType === 'promo_banner' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {banner.bannerType === 'home_banner' ? 'Home Banner' : 
                     banner.bannerType === 'promo_banner' ? 'Promo Banner' : 'Offer Banner'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(banner)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No banners found. Click 'Add New Banner' to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                {currentBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner Type</label>
                  <select
                    value={formData.bannerType}
                    onChange={(e) => setFormData({...formData, bannerType: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="home_banner">Home Hero Banner</option>
                    <option value="offer_banner">Offer Banner (Slider)</option>
                    <option value="promo_banner">Promo Banner (Instant Booking)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image (Required)</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl hover:border-[#10AFA5] hover:bg-[#F8FCFC] transition-all overflow-hidden group cursor-pointer bg-gray-50 flex flex-col items-center justify-center aspect-[21/10] w-full max-w-[500px] mx-auto h-auto shadow-inner">
                  {formData.imageUrl ? (
                    <>
                      <img fetchPriority="low" loading="lazy" 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="absolute inset-0 w-full h-full object-fill" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <span className="text-white font-medium flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg">
                          <FiUploadCloud size={20} /> Replace Image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 pointer-events-none">
                      <FiUploadCloud size={32} className="mx-auto text-gray-400 mb-3 group-hover:text-[#10AFA5] transition-colors" />
                      <p className="text-sm font-medium text-gray-700">Click or drag image to upload</p>
                      <p className="text-xs text-gray-500 mt-1">Recommended size: 1050x500px (Aspect Ratio 21:10)</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'imageUrl')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Redirect Type</label>
                  <select
                    value={formData.redirectType}
                    onChange={(e) => setFormData({...formData, redirectType: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="none">No Redirect (Display Only)</option>
                    <option value="service">Specific Service</option>
                    <option value="category">Category</option>
                    <option value="external">External Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Redirect Value (ID or URL)</label>
                  <input
                    type="text"
                    value={formData.redirectValue}
                    onChange={(e) => setFormData({...formData, redirectValue: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g. ac-service-slug or http://..."
                    disabled={formData.redirectType === 'none'}
                  />
                </div>
              </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#10AFA5] text-white font-medium rounded-lg hover:bg-[#0E9B92] transition-colors shadow-sm"
                  >
                    {currentBanner ? 'Update Banner' : 'Create Banner'}
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
