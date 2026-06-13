import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiCreditCard, FiHash, FiFileText } from 'react-icons/fi';
import { BsBank } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';

const BankDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await workerService.getProfile();
        if (res.success && res.worker) {
          const w = res.worker;
          setFormData({
            accountHolder: w.bankDetails?.accountHolder || w.name || '',
            bankName: w.bankDetails?.bankName || '',
            accountNumber: w.bankDetails?.accountNumber || '',
            ifscCode: w.bankDetails?.ifscCode || ''
          });
        }
      } catch (err) {
        toast.error('Failed to load bank details');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.accountNumber || !formData.ifscCode) {
      toast.error('Account Number and IFSC Code are required');
      return;
    }
    
    setSaving(true);
    try {
      await workerService.updateProfile({
        bankDetails: formData
      });
      toast.success('Bank details updated successfully');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update bank details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A] ">
      <Header title="Bank Details" showBack={true} onBack={() => navigate(-1)} />
      
      <main className="px-5 pt-6 max-w-md mx-auto space-y-6">
        
        {/* Helper Banner */}
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
          <FiCreditCard className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-800 font-medium leading-relaxed">
            Please ensure your bank details are correct. Earnings from your one-time jobs will be securely transferred to this account.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50">
          <div className="space-y-5">
            
            {/* Account Holder */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <FiFileText className="text-slate-400 text-sm" /> Account Holder Name
              </label>
              <input
                type="text"
                name="accountHolder"
                value={formData.accountHolder}
                onChange={handleChange}
                className="w-full bg-[#F8F9FA] rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all uppercase border-none"
                placeholder="KARTIK"
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <BsBank className="text-slate-400 text-sm" /> Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full bg-[#F8F9FA] rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border-none"
                placeholder="e.g. State Bank of India"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <FiHash className="text-slate-400 text-sm" /> Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full bg-[#F8F9FA] rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-800 placeholder-gray-500 tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border-none"
                placeholder="0000 0000 0000"
              />
            </div>

            {/* IFSC Code */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <FiFileText className="text-slate-400 text-sm" /> IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                className="w-full bg-[#F8F9FA] rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-800 placeholder-gray-500 tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all uppercase border-none"
                placeholder="SBIN0001234"
                maxLength={11}
              />
            </div>

          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.15)] disabled:opacity-70 disabled:active:scale-100"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <FiSave className="w-5 h-5" /> Secure & Save Details
            </>
          )}
        </button>

      </main>
    </div>
  );
};

export default BankDetails;
