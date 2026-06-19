import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSettings } from 'react-icons/fi';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const OneTimeServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    image: '',
    isActive: true,
    sortOrder: 0,
    isBrandRequired: false,
    isIssueRequired: false,
    isPackageRequired: true,
    allowSchedule: true,
    allowBookNow: true,
    allowPayAtHome: true,
    allowOnlinePayment: true,
    requiresOTP: true,
    requiresProofUpload: true,
    requiresLiveTracking: true,
    estimatedDuration: '60 mins',
    defaultRadiusKm: 10,
    assignmentMode: 'auto_wave'
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/one-time-services');
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentService) {
        await api.put(`/admin/one-time-services/${currentService._id}`, formData);
        toast.success('Service updated successfully');
      } else {
        await api.post('/admin/one-time-services', formData);
        toast.success('Service created successfully');
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service? This will delete all related brands, issues, and packages.')) {
      try {
        await api.delete(`/admin/one-time-services/${id}`);
        toast.success('Service deleted');
        fetchServices();
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setCurrentService(service);
      setFormData({
        name: service.name || '',
        subtitle: service.subtitle || '',
        image: service.image || '',
        isActive: service.isActive !== undefined ? service.isActive : true,
        sortOrder: service.sortOrder || 0,
        isBrandRequired: service.isBrandRequired || false,
        isIssueRequired: service.isIssueRequired || false,
        isPackageRequired: service.isPackageRequired !== undefined ? service.isPackageRequired : true,
        allowSchedule: service.allowSchedule !== undefined ? service.allowSchedule : true,
        allowBookNow: service.allowBookNow !== undefined ? service.allowBookNow : true,
        allowPayAtHome: service.allowPayAtHome !== undefined ? service.allowPayAtHome : true,
        allowOnlinePayment: service.allowOnlinePayment !== undefined ? service.allowOnlinePayment : true,
        requiresOTP: service.requiresOTP !== undefined ? service.requiresOTP : true,
        requiresProofUpload: service.requiresProofUpload !== undefined ? service.requiresProofUpload : true,
        requiresLiveTracking: service.requiresLiveTracking !== undefined ? service.requiresLiveTracking : true,
        estimatedDuration: service.estimatedDuration || '60 mins',
        defaultRadiusKm: service.defaultRadiusKm || 10,
        assignmentMode: service.assignmentMode || 'auto_wave'
      });
    } else {
      setCurrentService(null);
      setFormData({
        name: '',
        subtitle: '',
        image: '',
        isActive: true,
        sortOrder: 0,
        isBrandRequired: false,
        isIssueRequired: false,
        isPackageRequired: true,
        allowSchedule: true,
        allowBookNow: true,
        allowPayAtHome: true,
        allowOnlinePayment: true,
        requiresOTP: true,
        requiresProofUpload: true,
        requiresLiveTracking: true,
        estimatedDuration: '60 mins',
        defaultRadiusKm: 10,
        assignmentMode: 'auto_wave'
      });
    }
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">One-Time Services (B2C)</h1>
        <button
          onClick={() => openModal()}
          className="bg-[#10AFA5] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0d8f87]"
        >
          <FiPlus /> Add New Service
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Image</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Name</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Order</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No services found</td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    {service.image ? (
                      <img src={service.image} alt={service.name} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.slug}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{service.sortOrder}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => window.location.href=`/admin/one-time-services/${service._id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Manage Configs">
                        <FiSettings />
                      </button>
                      <button onClick={() => openModal(service)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(service._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{currentService ? 'Edit Service' : 'Add New Service'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.subtitle}
                  onChange={e => setFormData({...formData, subtitle: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                />
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10AFA5]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10AFA5]"
                    placeholder="e.g. 60 mins"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Radius (km)</label>
                  <input
                    type="number"
                    value={formData.defaultRadiusKm}
                    onChange={(e) => setFormData({ ...formData, defaultRadiusKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10AFA5]"
                  />
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Service Configuration</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBrandRequired}
                      onChange={(e) => setFormData({ ...formData, isBrandRequired: e.target.checked })}
                      className="w-4 h-4 text-[#10AFA5] rounded"
                    />
                    <span className="text-sm text-gray-700">Requires Brand</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isIssueRequired}
                      onChange={(e) => setFormData({ ...formData, isIssueRequired: e.target.checked })}
                      className="w-4 h-4 text-[#10AFA5] rounded"
                    />
                    <span className="text-sm text-gray-700">Requires Issue</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPackageRequired}
                      onChange={(e) => setFormData({ ...formData, isPackageRequired: e.target.checked })}
                      className="w-4 h-4 text-[#10AFA5] rounded"
                    />
                    <span className="text-sm text-gray-700">Requires Packages</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiresOTP}
                      onChange={(e) => setFormData({ ...formData, requiresOTP: e.target.checked })}
                      className="w-4 h-4 text-[#10AFA5] rounded"
                    />
                    <span className="text-sm text-gray-700">Requires Visit OTP</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiresLiveTracking}
                      onChange={(e) => setFormData({ ...formData, requiresLiveTracking: e.target.checked })}
                      className="w-4 h-4 text-[#10AFA5] rounded"
                    />
                    <span className="text-sm text-gray-700">Live Tracking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allowSchedule}
                      onChange={(e) => setFormData({ ...formData, allowSchedule: e.target.checked })}
                      className="w-4 h-4 text-[#10AFA5] rounded"
                    />
                    <span className="text-sm text-gray-700">Allow Schedule</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#10AFA5] rounded"
                    />
                    <span className="text-sm text-gray-700">Is Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#10AFA5] text-white rounded-lg hover:bg-[#0d8f87]"
                >
                  {currentService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneTimeServices;
