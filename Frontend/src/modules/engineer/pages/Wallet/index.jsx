import React, { useState, useEffect, useRef } from 'react';
import { FiDollarSign, FiArrowUp, FiArrowDown, FiRefreshCw, FiX, FiFileText, FiClock, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/layout/Header';
import engineerWalletService from '../../../../services/engineerWalletService';
import { useAppNotifications } from '../../../../hooks/useAppNotifications';
import { toast } from 'react-hot-toast';

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState({
    totalBalance: 0,
    availableBalance: 0,
    pendingBalance: 0,
    withdrawnAmount: 0
  });
  const [transactions, setTransactions] = useState([]);
  
  // Withdraw Modal State
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  const socket = useAppNotifications('worker');

  useEffect(() => {
    loadWalletData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('wallet_update', handleSocketUpdate);
      socket.on('transaction_updated', handleSocketUpdate);
      return () => {
        socket.off('wallet_update', handleSocketUpdate);
        socket.off('transaction_updated', handleSocketUpdate);
      };
    }
  }, [socket]);

  const handleSocketUpdate = () => {
    loadWalletData(false); // background sync
  };

  const loadWalletData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [walletRes, txnRes] = await Promise.all([
        engineerWalletService.getWallet(),
        engineerWalletService.getTransactions({ limit: 50 })
      ]);

      if (walletRes.success) setWallet(walletRes.data);
      if (txnRes.success) setTransactions(txnRes.data || []);
    } catch (error) {
      toast.error('Failed to sync wallet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWalletData(false);
  };

  const handleWithdrawSubmit = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > wallet.availableBalance) return toast.error('Insufficient available balance');
    if (!upiId.trim()) return toast.error('UPI ID is required');

    setSubmittingWithdrawal(true);
    try {
      const res = await engineerWalletService.requestWithdraw({
        amount: amt,
        bankDetails: { upiId }
      });
      if (res.success) {
        toast.success('Withdrawal requested successfully');
        setWithdrawOpen(false);
        setWithdrawAmount('');
        setUpiId('');
        loadWalletData(false);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to request withdrawal');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return `Today, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
      case 'processing': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'failed':
      case 'cancelled':
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'worker_payment':
      case 'earnings_credit':
      case 'commission': return <FiArrowDown className="text-green-500 w-5 h-5" />;
      case 'withdrawal': return <FiArrowUp className="text-red-500 w-5 h-5" />;
      default: return <FiDollarSign className="text-gray-500 w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] p-4 space-y-4">
        <div className="h-14 bg-white rounded animate-pulse w-full"></div>
        <div className="h-48 bg-white rounded-2xl animate-pulse w-full"></div>
        <div className="h-32 bg-white rounded-2xl animate-pulse w-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FCFC]  font-sans text-[#0F172A]">
      {/* Custom Header with Refresh */}
      <div className="sticky top-0 z-40 bg-[#F8FCFC] border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="w-10">
             {/* Using standard WBI menu icon placeholder */}
             <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </div>
          <h1 className="text-lg font-bold">Wallet</h1>
          <button 
            onClick={handleRefresh}
            className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-all ${refreshing ? 'animate-spin' : ''}`}
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Premium Balance Card */}
        <div className="bg-gradient-to-br from-[#10AFA5] to-[#0A8F86] rounded-2xl p-6 text-white shadow-[0_10px_25px_rgba(16,175,165,0.3)] mb-8 relative overflow-hidden">
          {/* Background Pattern Elements */}
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-10px] left-[-10px] w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Total Balance</p>
              <h2 className="text-4xl font-black mb-1 tracking-tight">₹{wallet.availableBalance?.toLocaleString() || 0}</h2>
              <p className="text-white/80 text-xs">Available for withdrawal</p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
              <FiDollarSign className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button 
              onClick={() => setWithdrawOpen(true)}
              className="w-full bg-white text-[#10AFA5] font-bold py-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors active:scale-95"
            >
              Withdraw
            </button>
            <button 
              onClick={() => {
                document.getElementById('transactions_section').scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full bg-white/20 backdrop-blur-sm text-white border border-white/30 font-bold py-3 rounded-xl hover:bg-white/30 transition-colors active:scale-95"
            >
              Transaction History
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Earned</p>
            <p className="text-sm font-bold text-[#0F172A]">₹{wallet.totalBalance?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Pending</p>
            <p className="text-sm font-bold text-orange-500">₹{wallet.pendingBalance?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Withdrawn</p>
            <p className="text-sm font-bold text-teal-600">₹{wallet.withdrawnAmount?.toLocaleString() || 0}</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div id="transactions_section">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#0F172A] text-lg">Recent Transactions</h3>
            <span className="text-[#10AFA5] text-sm font-bold">View All</span>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FiFileText className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="font-bold text-gray-800 mb-1">No Transactions Yet</h4>
              <p className="text-sm text-gray-500">Your completed jobs earnings will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(txn => (
                <div key={txn._id} className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center gap-4 transition-all hover:shadow-md">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${txn.type === 'withdrawal' ? 'bg-red-50' : 'bg-green-50'}`}>
                    {getTransactionIcon(txn.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="font-bold text-[#0F172A] text-sm truncate pr-2">
                        {txn.description || txn.type.replace('_', ' ')}
                      </p>
                      <p className={`font-bold text-[15px] whitespace-nowrap ${txn.type === 'withdrawal' ? 'text-[#0F172A]' : 'text-[#10AFA5]'}`}>
                        {txn.type === 'withdrawal' ? '-' : '+'}₹{Math.abs(txn.amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex flex-col">
                        {txn.bookingId && <p className="text-[11px] text-gray-400 font-medium mb-0.5">#WB{txn.bookingId.toString().substring(0,6).toUpperCase()}</p>}
                        <p className="text-xs text-gray-500">{formatDate(txn.createdAt)}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold border ${getStatusColor(txn.status)}`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {withdrawOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setWithdrawOpen(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative"
            >
              <button onClick={() => setWithdrawOpen(false)} className="absolute top-5 right-5 p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                <FiX className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-[#0F172A] mb-1">Withdraw Funds</h2>
              <p className="text-sm text-gray-500 mb-6">Transfer earnings to your bank account.</p>

              <div className="bg-teal-50 rounded-xl p-4 mb-6 flex justify-between items-center border border-teal-100">
                <span className="text-teal-800 text-sm font-bold">Available Balance</span>
                <span className="text-teal-600 text-lg font-black">₹{wallet.availableBalance.toLocaleString()}</span>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Withdrawal Amount (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">₹</span>
                    </div>
                    <input 
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      max={wallet.availableBalance}
                      className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">UPI ID</label>
                  <input 
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="example@upi"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5] transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleWithdrawSubmit}
                disabled={submittingWithdrawal}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-[0_4px_15px_rgba(16,175,165,0.3)] transition-all active:scale-[0.98] ${submittingWithdrawal ? 'bg-gray-400 shadow-none' : 'bg-[#10AFA5] hover:bg-teal-600'}`}
              >
                {submittingWithdrawal ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
    </div>
  );
};

export default Wallet;
