import React, { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiPhone, FiCheckCircle } from 'react-icons/fi';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/b2b/users');
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load users list');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm">
        <div className="border-b border-gray-50 pb-4 mb-6">
          <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide">Portal Authorized Users</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10AFA5]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((usr) => (
              <div 
                key={usr.id}
                className="border border-gray-100 rounded-3xl p-5 bg-gray-50/50 hover:bg-white transition-all space-y-4 hover:border-[#10AFA5]/30 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[#F0FDFA] rounded-2xl flex items-center justify-center text-[#10AFA5] font-bold text-base border border-[#10AFA5]/10 shrink-0">
                    {usr.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{usr.name}</h4>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 mt-1 inline-block">
                      {usr.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 font-semibold leading-relaxed border-t border-gray-100/50 pt-3">
                  <p><span className="text-gray-400">Designation:</span> {usr.role}</p>
                  <div className="flex items-center gap-2">
                    <FiMail className="text-[#10AFA5]" />
                    <span>{usr.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-[#10AFA5]" />
                    <span>{usr.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
