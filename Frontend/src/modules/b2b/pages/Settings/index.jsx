import React, { useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Settings = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully!');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      <div className="max-w-xl bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm">
        <div className="border-b border-gray-50 pb-4 mb-6">
          <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide">Change Account Password</h3>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Old Password *</label>
            <input 
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full h-10 border border-gray-200 text-xs rounded-xl px-3.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">New Password *</label>
            <input 
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full h-10 border border-gray-200 text-xs rounded-xl px-3.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Confirm New Password *</label>
            <input 
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full h-10 border border-gray-200 text-xs rounded-xl px-3.5 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="bg-[#10AFA5] hover:bg-[#0D9488] disabled:bg-gray-300 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-teal-500/10 flex items-center gap-1.5 transition-colors ml-auto block"
          >
            <FiCheckCircle />
            {updating ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Settings;
