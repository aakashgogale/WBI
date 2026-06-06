import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';
import api from '../../../../services/api'; // Or your admin axios instance
import toast from 'react-hot-toast';

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <button className="bg-[#10AFA5] text-white px-4 py-2 rounded-lg flex items-center gap-2">
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
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Name & Description</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Order</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Active</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Show on App</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-10 h-10 rounded bg-[#10AFA5]/10 flex items-center justify-center text-[#10AFA5]">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <FiImage />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{cat.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                  </td>
                  <td className="p-4 text-sm font-medium">{cat.displayOrder}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleStatus(cat._id, 'isActive', cat.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleStatus(cat._id, 'showOnApp', cat.showOnApp)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${cat.showOnApp ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {cat.showOnApp ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-[#10AFA5] bg-gray-50 rounded">
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteCategory(cat._id)}
                      className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No service categories found. Run the seed script to populate!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServiceCategories;
