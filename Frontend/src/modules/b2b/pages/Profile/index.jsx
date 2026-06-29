import React, { useState, useEffect } from 'react';
import { FiUser, FiBriefcase, FiMapPin, FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  
  // Form edit states
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  // Add branch form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [bName, setBName] = useState('');
  const [bAddress, setBAddress] = useState('');
  const [bCity, setBCity] = useState('');
  const [bState, setBState] = useState('');
  const [bPincode, setBPincode] = useState('');
  const [bContact, setBContact] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/b2b/me');
      if (res.data.success) {
        const comp = res.data.company;
        setCompany(comp);
        setBranches(comp.branches || []);
        setCompanyName(comp.companyName);
        setCompanyAddress(comp.companyAddress);
        setBillingAddress(comp.billingAddress);
      }
    } catch (err) {
      toast.error('Failed to load profile details');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch('/b2b/profile', {
        companyName,
        companyAddress,
        billingAddress
      });

      if (res.data.success) {
        toast.success('Company profile updated successfully!');
        setCompany(res.data.company);
        
        // Update local/session storage
        const key = localStorage.getItem('b2bData') ? 'b2bData' : 'b2bData'; // defaults
        localStorage.setItem('b2bData', JSON.stringify(res.data.company));
        sessionStorage.setItem('b2bData', JSON.stringify(res.data.company));
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!bName || !bAddress || !bCity || !bState || !bPincode || !bContact) {
      toast.error('Please fill all branch fields');
      return;
    }

    const newBranch = {
      branchName: bName,
      branchAddress: bAddress,
      city: bCity,
      state: bState,
      pincode: bPincode,
      contactPerson: bContact
    };

    const updatedBranches = [...branches, newBranch];
    setLoading(true);

    try {
      const res = await api.patch('/b2b/profile', {
        branches: updatedBranches
      });
      if (res.data.success) {
        toast.success('New branch added!');
        setBranches(res.data.company.branches);
        setShowAddForm(false);
        // reset form
        setBName('');
        setBAddress('');
        setBCity('');
        setBState('');
        setBPincode('');
        setBContact('');
      }
    } catch (err) {
      toast.error('Failed to add branch');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBranch = async (index) => {
    const updatedBranches = branches.filter((_, i) => i !== index);
    setLoading(true);
    try {
      const res = await api.patch('/b2b/profile', {
        branches: updatedBranches
      });
      if (res.data.success) {
        toast.success('Branch removed');
        setBranches(res.data.company.branches);
      }
    } catch (err) {
      toast.error('Failed to remove branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Profile details form */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm">
          <div className="border-b border-gray-50 pb-4 mb-6">
            <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide">Company Core Profile</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Company Name *</label>
              <input 
                type="text" 
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-10 border border-gray-200 text-xs rounded-xl px-3 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Company Address *</label>
              <textarea 
                required
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full h-20 border border-gray-200 text-xs rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Billing Address *</label>
              <textarea 
                required
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                className="w-full h-20 border border-gray-200 text-xs rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#10AFA5] hover:bg-[#0D9488] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-teal-500/10 flex items-center gap-1.5 transition-colors ml-auto block"
            >
              <FiCheckCircle />
              Save Settings
            </button>
          </form>
        </div>

        {/* Branches management */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Branch list */}
          <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-6">
              <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide">Registered Office Branches</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[#10AFA5]/10 hover:bg-[#10AFA5]/20 text-[#10AFA5] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                <FiPlus />
                Add Branch
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <form onSubmit={handleAddBranch} className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-3.5 mb-6 animate-fade-in">
                <h4 className="text-xs font-bold text-gray-800">Branch Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input 
                    type="text"
                    required
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    placeholder="Branch name"
                    className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 bg-white"
                  />
                  <input 
                    type="text"
                    required
                    value={bContact}
                    onChange={(e) => setBContact(e.target.value)}
                    placeholder="Contact person"
                    className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 bg-white"
                  />
                  <input 
                    type="text"
                    required
                    value={bAddress}
                    onChange={(e) => setBAddress(e.target.value)}
                    placeholder="Street address"
                    className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 bg-white sm:col-span-2"
                  />
                  <input 
                    type="text"
                    required
                    value={bCity}
                    onChange={(e) => setBCity(e.target.value)}
                    placeholder="City"
                    className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 bg-white"
                  />
                  <input 
                    type="text"
                    required
                    value={bState}
                    onChange={(e) => setBState(e.target.value)}
                    placeholder="State"
                    className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 bg-white"
                  />
                  <input 
                    type="text"
                    required
                    value={bPincode}
                    onChange={(e) => setBPincode(e.target.value)}
                    placeholder="Pincode"
                    className="w-full h-9 border border-gray-200 text-xs rounded-xl px-3 bg-white"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="px-3 py-1.5 bg-[#10AFA5] hover:bg-[#0D9488] text-white text-xs font-bold rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="space-y-3">
              {branches.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs font-bold">
                  No branches added yet.
                </div>
              ) : (
                branches.map((br, idx) => (
                  <div key={idx} className="border border-gray-50 rounded-xl p-3 bg-gray-50/50 flex justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-gray-800 capitalize">{br.branchName}</p>
                      <p className="text-gray-500 mt-1 leading-snug">{br.branchAddress}, {br.city}, {br.state} - {br.pincode}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1.5 flex items-center gap-1">
                        <FiUser className="text-[#10AFA5]" /> Contact: {br.contactPerson}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveBranch(idx)}
                      disabled={loading}
                      className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 self-start transition-colors shrink-0"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
