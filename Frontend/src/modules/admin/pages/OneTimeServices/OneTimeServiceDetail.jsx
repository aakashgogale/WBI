import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

// Simple Tab Components
const BrandsTab = ({ serviceId }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ brandName: '', logo: '', isActive: true, sortOrder: 0 });

  useEffect(() => { fetchBrands(); }, [serviceId]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/one-time-services/${serviceId}/brands`);
      if (res.data.success) setBrands(res.data.data);
    } catch (e) { toast.error('Failed to fetch brands'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/one-time-services/${serviceId}/brands`, { ...formData, serviceId });
      toast.success('Brand added');
      setIsModalOpen(false);
      setFormData({ brandName: '', logo: '', isActive: true, sortOrder: 0 });
      fetchBrands();
    } catch (e) { toast.error('Error adding brand'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete brand?')) {
      try {
        await api.delete(`/admin/one-time-services/brands/${id}`);
        toast.success('Brand deleted');
        fetchBrands();
      } catch (e) { toast.error('Error deleting brand'); }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Manage Brands</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#10AFA5] text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"><FiPlus /> Add Brand</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {brands.map(b => (
          <div key={b._id} className="border p-4 rounded-xl flex flex-col items-center relative group">
            {b.logo ? <img src={b.logo} alt={b.brandName} className="h-12 object-contain mb-2" /> : <div className="h-12 mb-2 font-bold text-gray-400">No Logo</div>}
            <p className="font-semibold text-sm">{b.brandName}</p>
            <button onClick={() => handleDelete(b._id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition"><FiTrash2 /></button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h3 className="font-bold text-lg">Add Brand</h3>
            <div><label className="block text-sm">Brand Name</label><input required className="border w-full p-2 rounded" value={formData.brandName} onChange={e=>setFormData({...formData, brandName: e.target.value})} /></div>
            <div><label className="block text-sm">Logo URL</label><input className="border w-full p-2 rounded" value={formData.logo} onChange={e=>setFormData({...formData, logo: e.target.value})} /></div>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#10AFA5] text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const IssuesTab = ({ serviceId }) => {
  const [issues, setIssues] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', brandIds: [], allowMultiple: true, isActive: true });

  useEffect(() => { 
    fetchIssues(); 
    api.get(`/admin/one-time-services/${serviceId}/brands`).then(r => setBrands(r.data.data || []));
  }, [serviceId]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/one-time-services/${serviceId}/issues`);
      if (res.data.success) setIssues(res.data.data);
    } catch (e) { toast.error('Failed to fetch issues'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/one-time-services/${serviceId}/issues`, { ...formData, serviceId });
      toast.success('Issue added');
      setIsModalOpen(false);
      setFormData({ title: '', brandIds: [], allowMultiple: true, isActive: true });
      fetchIssues();
    } catch (e) { toast.error('Error adding issue'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete issue?')) {
      try {
        await api.delete(`/admin/one-time-services/issues/${id}`);
        toast.success('Issue deleted');
        fetchIssues();
      } catch (e) { toast.error('Error deleting issue'); }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Manage Issues</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#10AFA5] text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"><FiPlus /> Add Issue</button>
      </div>
      <div className="space-y-2">
        {issues.map(i => (
          <div key={i._id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">{i.title}</p>
              <p className="text-xs text-gray-500">Brands: {i.brandIds.length > 0 ? i.brandIds.map(b=>b.brandName).join(', ') : 'All Brands'}</p>
            </div>
            <button onClick={() => handleDelete(i._id)} className="text-red-500"><FiTrash2 /></button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h3 className="font-bold text-lg">Add Issue</h3>
            <div><label className="block text-sm">Issue Title</label><input required className="border w-full p-2 rounded" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} /></div>
            <div>
              <label className="block text-sm">Target Brands (Ctrl+Click for multiple)</label>
              <select multiple className="border w-full p-2 rounded text-sm" value={formData.brandIds} onChange={e => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({...formData, brandIds: selected});
              }}>
                {brands.map(b => <option key={b._id} value={b._id}>{b.brandName}</option>)}
              </select>
              <p className="text-[10px] text-gray-400 mt-1">Leave empty to apply to ALL brands</p>
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.allowMultiple} onChange={e=>setFormData({...formData, allowMultiple: e.target.checked})} /> <span className="text-sm">Allow Multiple Selection</span></label>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#10AFA5] text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const PackagesTab = ({ serviceId }) => {
  const [packages, setPackages] = useState([]);
  const [issues, setIssues] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, estimatedDuration: '', warranty: '', isRequired: false, brandIds: [], issueIds: [] });

  useEffect(() => { 
    fetchPackages(); 
    api.get(`/admin/one-time-services/${serviceId}/brands`).then(r => setBrands(r.data.data || []));
    api.get(`/admin/one-time-services/${serviceId}/issues`).then(r => setIssues(r.data.data || []));
  }, [serviceId]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/one-time-services/${serviceId}/packages`);
      if (res.data.success) setPackages(res.data.data);
    } catch (e) { toast.error('Failed to fetch packages'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/one-time-services/${serviceId}/packages`, { ...formData, serviceId });
      toast.success('Package added');
      setIsModalOpen(false);
      setFormData({ name: '', description: '', price: 0, estimatedDuration: '', warranty: '', isRequired: false, brandIds: [], issueIds: [] });
      fetchPackages();
    } catch (e) { toast.error('Error adding package'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete package?')) {
      try {
        await api.delete(`/admin/one-time-services/packages/${id}`);
        toast.success('Package deleted');
        fetchPackages();
      } catch (e) { toast.error('Error deleting package'); }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Manage Packages</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#10AFA5] text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"><FiPlus /> Add Package</button>
      </div>
      <div className="space-y-3">
        {packages.map(p => (
          <div key={p._id} className="border p-4 rounded-xl relative">
            <h3 className="font-bold">{p.name} <span className="text-[#10AFA5] ml-2">₹{p.price}</span> {p.isRequired && <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded ml-2">REQUIRED</span>}</h3>
            <p className="text-sm text-gray-600 my-1">{p.description}</p>
            <p className="text-xs text-gray-400">Brands: {p.brandIds.length ? p.brandIds.map(b=>b.brandName).join(', ') : 'All'} | Issues: {p.issueIds.length ? p.issueIds.map(i=>i.title).join(', ') : 'All'}</p>
            <button onClick={() => handleDelete(p._id)} className="absolute top-4 right-4 text-red-500"><FiTrash2 /></button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 py-10">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-full max-w-lg space-y-3 max-h-full overflow-y-auto">
            <h3 className="font-bold text-lg">Add Package</h3>
            <div><label className="block text-xs">Name</label><input required className="border w-full p-2 rounded text-sm" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="block text-xs">Description</label><textarea className="border w-full p-2 rounded text-sm" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} /></div>
            <div className="flex gap-2">
              <div className="flex-1"><label className="block text-xs">Price (₹)</label><input type="number" required className="border w-full p-2 rounded text-sm" value={formData.price} onChange={e=>setFormData({...formData, price: Number(e.target.value)})} /></div>
              <div className="flex-1"><label className="block text-xs">Duration (e.g. 45 mins)</label><input className="border w-full p-2 rounded text-sm" value={formData.estimatedDuration} onChange={e=>setFormData({...formData, estimatedDuration: e.target.value})} /></div>
            </div>
            <div><label className="block text-xs">Warranty (e.g. 30 days)</label><input className="border w-full p-2 rounded text-sm" value={formData.warranty} onChange={e=>setFormData({...formData, warranty: e.target.value})} /></div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs">Target Brands</label>
                <select multiple className="border w-full p-2 rounded text-xs h-24" value={formData.brandIds} onChange={e => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({...formData, brandIds: selected});
                }}>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.brandName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs">Target Issues</label>
                <select multiple className="border w-full p-2 rounded text-xs h-24" value={formData.issueIds} onChange={e => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({...formData, issueIds: selected});
                }}>
                  {issues.map(i => <option key={i._id} value={i._id}>{i.title}</option>)}
                </select>
              </div>
            </div>
            
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isRequired} onChange={e=>setFormData({...formData, isRequired: e.target.checked})} /> <span className="text-sm">Required (Automatically added to cart)</span></label>
            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#10AFA5] text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};


const OneTimeServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('brands');

  return (
    <div className="p-6">
      <button onClick={() => navigate('/admin/one-time-services')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4">
        <FiArrowLeft /> Back to Services
      </button>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[60vh]">
        {/* Tabs */}
        <div className="flex border-b">
          {['brands', 'issues', 'packages'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-center font-bold capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-[#10AFA5] text-[#10AFA5] bg-[#F1FAF9]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'brands' && <BrandsTab serviceId={id} />}
          {activeTab === 'issues' && <IssuesTab serviceId={id} />}
          {activeTab === 'packages' && <PackagesTab serviceId={id} />}
        </div>
      </div>
    </div>
  );
};

export default OneTimeServiceDetail;
