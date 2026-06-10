import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiSearch, FiLoader, FiArrowUpRight, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import CardShell from '../UserCategories/components/CardShell';
import adminEngineerService from '../../../../services/adminEngineerService';

const EngineerPayments = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await adminEngineerService.getEngineerPayments();
      if (response.success) {
        setEngineers(response.data);
      }
    } catch (error) {
      console.error('Error loading engineer payments:', error);
      toast.error('Failed to load engineer payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredEngineers = engineers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <CardShell
        icon={FiDollarSign}
      >
        {/* Search */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <FiSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search engineer by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 text-gray-400 animate-spin mr-3" />
              <span className="text-gray-600">Loading payment data...</span>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Engineer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Wallet Balance</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Earnings</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEngineers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No payment records found</td>
                  </tr>
                ) : (
                  filteredEngineers.map((engineer) => (
                    <tr key={engineer._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{engineer.name}</span>
                          <span className="text-xs text-gray-500">{engineer.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{engineer.serviceCategory}</td>
                      <td className="px-4 py-4">
                        <span className={`font-bold ${engineer.wallet?.balance > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          ₹{(engineer.wallet?.balance || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">₹{(engineer.wallet?.totalEarnings || 0).toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${engineer.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {engineer.approvalStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          className="flex items-center gap-1 text-primary-600 font-semibold hover:underline"
                          onClick={() => toast('Detailed transaction history coming soon')}
                        >
                          View History <FiArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </CardShell>
    </div>
  );
};

export default EngineerPayments;
