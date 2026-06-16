import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, FiArrowUp, FiArrowDown, FiRefreshCw, FiX, FiFileText, 
  FiClock, FiCheck, FiAlertCircle, FiChevronRight, FiBriefcase, FiFilter,
  FiActivity, FiMapPin, FiCalendar
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import engineerWalletService from '../../../../services/engineerWalletService';
import { useAppNotifications } from '../../../../hooks/useAppNotifications';
import { toast } from 'react-hot-toast';
import { useWalletData } from '../../../../hooks/useWalletData';
import { Skeleton } from '../../../../components/common/Skeleton';
import { ErrorAlert } from '../../../../components/common/ErrorAlert';

const Wallet = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState('upi');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  // Bank Details State
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [submittingBank, setSubmittingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    bankName: ''
  });

  const socket = useAppNotifications('engineer');
  const { walletData, isLoading, error, refetch } = useWalletData();

  useEffect(() => {
    if (walletData?.bankDetails) {
      setBankForm({
        accountHolderName: walletData.bankDetails.accountHolderName || '',
        accountNumber: walletData.bankDetails.accountNumberEncrypted || '',
        ifsc: walletData.bankDetails.ifsc || '',
        bankName: walletData.bankDetails.bankName || ''
      });
    }
  }, [walletData?.bankDetails]);

  useEffect(() => {
    if (socket) {
      const handleSocketUpdate = () => refetch();
      
      socket.on('wallet:credited', handleSocketUpdate);
      socket.on('wallet:updated', handleSocketUpdate);
      socket.on('payment:released', handleSocketUpdate);
      socket.on('payment:statusChanged', handleSocketUpdate);
      socket.on('withdrawal:approved', handleSocketUpdate);
      
      return () => {
        socket.off('wallet:credited', handleSocketUpdate);
        socket.off('wallet:updated', handleSocketUpdate);
        socket.off('payment:released', handleSocketUpdate);
        socket.off('payment:statusChanged', handleSocketUpdate);
        socket.off('withdrawal:approved', handleSocketUpdate);
      };
    }
  }, [socket, refetch]);

  const handleWithdrawSubmit = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > walletData.wallet.availableBalance) return toast.error('Insufficient available balance');
    
    setSubmittingWithdrawal(true);
    try {
      let payload = { amount: amt, method: withdrawMethod };
      if (withdrawMethod === 'upi') {
        if (!upiId.trim()) throw new Error('UPI ID is required');
        payload.upiId = upiId;
        await engineerWalletService.verifyUpi(upiId);
      }

      const res = await engineerWalletService.requestWithdraw(payload);
      if (res.success) {
        toast.success('Withdrawal requested successfully');
        setWithdrawOpen(false);
        setWithdrawAmount('');
        setUpiId('');
        refetch();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to request withdrawal');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const handleBankSubmit = async () => {
    if (!bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.ifsc || !bankForm.bankName) {
      return toast.error('Please fill all bank details');
    }
    
    setSubmittingBank(true);
    try {
      const res = await engineerWalletService.updateBankDetails(bankForm);
      if (res.success) {
        toast.success('Bank details saved successfully');
        setBankModalOpen(false);
        refetch();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update bank details');
    } finally {
      setSubmittingBank(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-gray-100 text-gray-700 border-gray-200',
      'Under Review': 'bg-orange-50 text-orange-600 border-orange-200',
      'Vendor Approved': 'bg-blue-50 text-blue-600 border-blue-200',
      'Client Approved': 'bg-indigo-50 text-indigo-600 border-indigo-200',
      'Released': 'bg-green-50 text-green-700 border-green-200',
      'Withdrawn': 'bg-teal-50 text-teal-700 border-teal-200',
      'Rejected': 'bg-red-50 text-red-600 border-red-200'
    };
    const style = styles[status] || styles['Pending'];
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${style}`}>
        {status}
      </span>
    );
  };

  const renderPaymentList = () => {
    const filtered = walletData.payments.filter(p => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Pending' && ['Pending', 'Vendor Approved', 'Client Approved'].includes(p.status)) return true;
      if (activeTab === 'Released' && p.status === 'Released') return true;
      if (activeTab === 'Under Review' && p.status === 'Under Review') return true;
      return false;
    });

    if (filtered.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
          <FiFileText className="w-10 h-10 text-gray-300 mb-3" />
          <h4 className="font-bold text-gray-800 mb-1">No earnings found</h4>
          <p className="text-sm text-gray-500">Your completed jobs and approved payments will appear here.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filtered.map(payment => (
          <div 
            key={payment._id || payment.id} 
            onClick={() => setSelectedPayment(payment)}
            className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center justify-between transition-all hover:shadow-md cursor-pointer"
          >
            <div className="flex items-start gap-3 w-full">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0 mt-1 text-teal-600">
                <FiActivity className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-[#0F172A] text-sm truncate pr-2">{payment.jobTitle || payment.description}</h4>
                  <span className="font-bold text-[#0F172A]">₹{payment.amount?.toLocaleString() || 0}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2 truncate">{payment.subService} • {payment.paymentType}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FiBriefcase className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">{payment.vendorName || 'Vendor'}</span>
                  </div>
                  {getStatusBadge(payment.status || 'Pending')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTimeline = (stage) => {
    const steps = [
      'Payment Received', 'Vendor Approved', 'Engineer Assigned', 
      'Milestone Completed', 'Client Approval Pending', 'Admin Release Pending', 'Wallet Credit Pending'
    ];
    return (
      <div className="mt-6 relative pl-4 border-l-2 border-gray-100 space-y-6">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum <= stage;
          const isCurrent = stepNum === stage;
          return (
            <div key={idx} className="relative">
              <div className={`absolute -left-[21px] w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-teal-500 border-teal-500' : 'bg-white border-gray-200'} ${isCurrent ? 'ring-4 ring-teal-50' : ''}`} />
              <p className={`text-sm font-medium flex items-center gap-2 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                {step} {isCompleted && <FiCheck className="text-teal-500" />}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] p-4 space-y-4">
        <Skeleton height="56px" />
        <Skeleton height="192px" className="rounded-2xl" />
        <Skeleton height="128px" className="rounded-2xl" />
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] p-4">
        <ErrorAlert message={error} action={() => refetch()} actionLabel="Retry Fetching" />
      </div>
    );
  }

  const { wallet, context, payments, transactions, withdrawals, bankDetails } = walletData;
  const pendingReleases = payments.filter(p => ['Pending', 'Vendor Approved', 'Client Approved'].includes(p.status));

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#F8FCFC] border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="w-10">
             <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </div>
          <h1 className="text-lg font-bold">Wallet</h1>
          <button 
            onClick={() => refetch()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-all"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        
        {/* Top Wallet Card */}
        <div className="bg-[#0F172A] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-teal-500 opacity-20 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <h2 className="text-4xl font-black text-white">₹{wallet.availableBalance?.toLocaleString() || 0}</h2>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
              <FiDollarSign className="w-6 h-6 text-teal-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-700/50">
            <div>
              <p className="text-xs text-gray-400 mb-1">Pending Release</p>
              <p className="font-bold text-orange-400">₹{wallet.pendingBalance?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Under Review</p>
              <p className="font-bold text-blue-400">₹{wallet.underReviewBalance?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setWithdrawOpen(true)}
              className="flex-1 bg-white text-[#0F172A] font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors flex justify-center items-center gap-2"
            >
              <FiArrowUp className="w-4 h-4" /> Withdraw
            </button>
            <button 
              onClick={() => setBankModalOpen(true)}
              className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Bank Details
            </button>
          </div>
        </div>

        {/* Engineer Service Context Card (Dynamic) */}
        {context && (
          <div className="bg-white rounded-2xl p-5 border border-teal-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -z-0"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiBriefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-600 mb-1 block">Assigned Service</span>
                <h3 className="font-bold text-[#0F172A] text-lg leading-tight mb-1">{context.categoryName || 'Service Category'}</h3>
                <p className="text-xs text-gray-500 mb-2">Vendor: {context.vendorName || 'Assigned Vendor'}</p>
                
                <div className="flex gap-3 mt-3">
                  <span className="text-xs font-medium bg-gray-50 border border-gray-100 px-2 py-1 rounded text-gray-600">
                    {context.activeJobsCount || 0} Active Jobs
                  </span>
                  <span className="text-xs font-medium bg-gray-50 border border-gray-100 px-2 py-1 rounded text-gray-600">
                    {context.paymentMode || 'Milestone-based'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Earned</p>
            <p className="font-bold text-lg text-[#0F172A]">₹{wallet.totalEarned?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Withdrawn</p>
            <p className="font-bold text-lg text-teal-600">₹{wallet.withdrawnBalance?.toLocaleString() || 0}</p>
          </div>
        </div>

        {/* Pending Releases Section */}
        {pendingReleases.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[#0F172A]">Pending Releases</h3>
            </div>
            <div className="space-y-3">
              {pendingReleases.map(p => (
                <div key={`pending_${p._id || p.id}`} onClick={() => setSelectedPayment(p)} className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex justify-between items-center cursor-pointer">
                  <div>
                    <p className="font-bold text-sm text-[#0F172A] mb-1">{p.jobTitle || 'Job/Project'}</p>
                    <p className="text-xs text-orange-600 font-medium">{p.status}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <p className="font-bold text-[#0F172A]">₹{p.amount?.toLocaleString() || 0}</p>
                    <FiChevronRight className="text-orange-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Tabs & List */}
        <div className="mt-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
            {['All', 'Pending', 'Released', 'Under Review', 'Withdrawals'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === tab 
                  ? 'bg-[#0F172A] text-white' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {activeTab === 'Withdrawals' ? (
             <div className="space-y-3">
              {withdrawals.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No withdrawals yet</p>}
              {withdrawals.map(wd => (
                <div key={wd._id} className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <FiArrowUp className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0F172A] text-sm truncate">Withdrawal #{wd._id?.toString().slice(-6)}</p>
                    <p className="text-xs text-gray-500">{new Date(wd.createdAt).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0F172A]">-₹{wd.amount?.toLocaleString() || 0}</p>
                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded uppercase">{wd.status}</span>
                  </div>
                </div>
              ))}
             </div>
          ) : (
            renderPaymentList()
          )}
        </div>

        {/* Transaction History */}
        <div className="mt-8">
          <h3 className="font-bold text-[#0F172A] mb-4">Recent Transactions</h3>
          <div className="space-y-3">
             {transactions.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No transactions yet</p>}
             {transactions.map(txn => (
                <div key={txn._id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.transactionType === 'withdrawal' || txn.transactionType === 'debit' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                    {txn.transactionType === 'withdrawal' || txn.transactionType === 'debit' ? <FiArrowUp className="w-4 h-4" /> : <FiArrowDown className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{txn.description}</p>
                    <p className="text-xs text-gray-400">{new Date(txn.createdAt).toLocaleDateString('en-GB')}</p>
                  </div>
                  <p className={`font-bold ${txn.transactionType === 'withdrawal' || txn.transactionType === 'debit' ? 'text-gray-800' : 'text-green-600'}`}>
                    {txn.transactionType === 'withdrawal' || txn.transactionType === 'debit' ? '-' : '+'}₹{txn.amount?.toLocaleString() || 0}
                  </p>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Payment Detail Bottom Sheet */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4"
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <button onClick={() => setSelectedPayment(null)} className="absolute top-5 right-5 p-2 bg-gray-100 rounded-full text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded mb-2 inline-block">{selectedPayment.serviceCategory || 'Service'}</span>
                <h2 className="text-xl font-bold text-[#0F172A] mb-1">{selectedPayment.jobTitle || 'Job Title'}</h2>
                <p className="text-sm text-gray-500">{selectedPayment.vendorName} {selectedPayment.clientName && `• ${selectedPayment.clientName}`}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 flex justify-between items-center border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                  <p className="font-black text-lg text-[#0F172A]">₹{selectedPayment.amount?.toLocaleString() || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-0.5">Payment Type</p>
                  <p className="font-bold text-sm text-[#0F172A]">{selectedPayment.paymentType || 'One-Time'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-[#0F172A] mb-2">Payment Progress</h3>
                {renderTimeline(selectedPayment.stage || 3)}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {withdrawOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
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
              <p className="text-sm text-gray-500 mb-6">Transfer earnings to your bank account or UPI.</p>

              <div className="bg-teal-50 rounded-xl p-4 mb-6 flex justify-between items-center border border-teal-100">
                <span className="text-teal-800 text-sm font-bold">Available Balance</span>
                <span className="text-teal-600 text-lg font-black">₹{wallet.availableBalance?.toLocaleString() || 0}</span>
              </div>

              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setWithdrawMethod('upi')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${withdrawMethod === 'upi' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  UPI
                </button>
                <button 
                  onClick={() => setWithdrawMethod('bank')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${withdrawMethod === 'bank' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  Bank Transfer
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Amount to Withdraw (₹)</label>
                  <input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5]"
                  />
                </div>

                {withdrawMethod === 'upi' ? (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">UPI ID</label>
                    <input 
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="example@upi"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5]"
                    />
                  </div>
                ) : (
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-700">Linked Bank</span>
                      {bankDetails ? (
                        <span className={`text-xs px-2 py-1 rounded font-bold flex items-center gap-1 ${bankDetails.verificationStatus === 'verified' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
                          {bankDetails.verificationStatus === 'verified' ? <FiCheck /> : <FiClock />} {bankDetails.verificationStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded font-bold">Not Added</span>
                      )}
                    </div>
                    {bankDetails ? (
                      <p className="text-[#0F172A] font-medium">{bankDetails.bankName} **** {bankDetails.accountNumberEncrypted?.slice(-4)}</p>
                    ) : (
                      <p className="text-sm text-gray-500">Please add bank details first</p>
                    )}
                  </div>
                )}
              </div>

              <button 
                onClick={handleWithdrawSubmit}
                disabled={submittingWithdrawal}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] ${submittingWithdrawal ? 'bg-gray-400' : 'bg-[#0F172A] hover:bg-gray-800'}`}
              >
                {submittingWithdrawal ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank Details Modal */}
      <AnimatePresence>
        {bankModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setBankModalOpen(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative"
            >
              <button onClick={() => setBankModalOpen(false)} className="absolute top-5 right-5 p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                <FiX className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-[#0F172A] mb-1">Bank Details</h2>
              <p className="text-sm text-gray-500 mb-6">Manage your primary bank account for withdrawals.</p>

              {bankDetails && (
                <div className={`mb-6 p-3 rounded-xl border flex items-center justify-between ${bankDetails.verificationStatus === 'verified' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                  <div className="flex items-center gap-2">
                    {bankDetails.verificationStatus === 'verified' ? <FiCheck className="w-5 h-5" /> : <FiClock className="w-5 h-5" />}
                    <span className="font-bold text-sm capitalize">{bankDetails.verificationStatus} Account</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Account Holder Name</label>
                  <input 
                    type="text"
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({...bankForm, accountHolderName: e.target.value})}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Bank Name</label>
                  <input 
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Account Number</label>
                  <input 
                    type="password"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                    placeholder="Enter account number"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">IFSC Code</label>
                  <input 
                    type="text"
                    value={bankForm.ifsc}
                    onChange={(e) => setBankForm({...bankForm, ifsc: e.target.value.toUpperCase()})}
                    placeholder="HDFC0001234"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 focus:border-[#10AFA5] uppercase"
                  />
                </div>
              </div>

              <button 
                onClick={handleBankSubmit}
                disabled={submittingBank}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98] ${submittingBank ? 'bg-gray-400' : 'bg-[#0F172A] hover:bg-gray-800'}`}
              >
                {submittingBank ? 'Saving...' : 'Save Bank Details'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Wallet;
