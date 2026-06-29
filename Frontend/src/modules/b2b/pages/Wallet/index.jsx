import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FiCreditCard, FiArrowUpRight, FiArrowDownRight, FiPlus, FiCheckCircle, 
  FiFileText, FiAlertCircle, FiDownload, FiCheck, FiUsers, FiClock,
  FiTrendingUp, FiActivity, FiShield, FiLoader
} from 'react-icons/fi';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

// Helper to dynamically load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Wallet = () => {
  const [topupAmount, setTopupAmount] = useState('20000');
  const [selectedMethod, setSelectedMethod] = useState('razorpay');
  const [processing, setProcessing] = useState(false);

  // 1. Fetch Wallet Summary
  const { data: summary, isLoading: loadSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['b2bWalletSummary'],
    queryFn: async () => {
      const res = await api.get('/b2b/wallet/summary');
      return res.data.data;
    }
  });

  // 2. Fetch Transactions History
  const { data: transactions, isLoading: loadTxns, refetch: refetchTransactions } = useQuery({
    queryKey: ['b2bWalletTransactions'],
    queryFn: async () => {
      const res = await api.get('/b2b/wallet/transactions');
      return res.data.data;
    }
  });

  // Handle Quick Amount Click
  const handleQuickAmount = (amountStr) => {
    setTopupAmount(amountStr);
  };

  // Launch Razorpay Top-up
  const handleProceedPay = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(topupAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error('Please enter a valid top-up amount');
      return;
    }

    setProcessing(true);
    try {
      // Step A: Load SDK script
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        toast.error('Failed to load Razorpay payment SDK');
        setProcessing(false);
        return;
      }

      // Step B: Create payment order on backend
      const res = await api.post('/b2b/wallet/create-topup-order', {
        amount: amountVal,
        paymentMethod: selectedMethod
      });

      if (!res.data.success) {
        toast.error('Failed to create topup order');
        setProcessing(false);
        return;
      }

      const orderData = res.data;

      // Step C: Launch Razorpay checkout options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100, // paise
        currency: orderData.currency,
        name: 'WBI Service Platform',
        description: 'B2B Partner Wallet Top Up',
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          setProcessing(true);
          try {
            // Step D: Cryptographic verification on backend
            const verifyRes = await api.post('/b2b/wallet/verify-topup-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              transactionId: orderData.transactionId
            });

            if (verifyRes.data.success) {
              toast.success(`₹${amountVal.toLocaleString('en-IN')} successfully credited!`);
              refetchSummary();
              refetchTransactions();
            } else {
              toast.error('Payment signature mismatch.');
            }
          } catch (verifyErr) {
            toast.error('Payment verification failed');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: orderData.company.name,
          email: orderData.company.email,
          contact: orderData.company.phone
        },
        theme: {
          color: '#10AFA5'
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      const paymentWindow = new window.Razorpay(options);
      paymentWindow.open();

    } catch (err) {
      console.error('Proceed payment error:', err);
      toast.error('Failed to initiate checkout gateway');
      setProcessing(false);
    }
  };

  const handleDownloadInvoice = (invoiceId) => {
    toast.success(`Downloading invoice ${invoiceId} PDF...`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight">Wallet & Payments</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">Top up your wallet and view your transactions</p>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Wallet Balance */}
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-5 shadow-sm space-y-4 hover:border-[#10AFA5]/20 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Wallet Balance</span>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-[#10AFA5] flex items-center justify-center border border-teal-100 shrink-0">
              <FiCreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[#10AFA5] leading-none">
              ₹{loadSummary ? '---' : summary?.balance?.toLocaleString('en-IN') || '0.00'}
            </p>
            <span className="text-[9px] text-gray-400 font-semibold block mt-3 flex items-center gap-1">
              <FiClock /> Last updated: 2 min ago
            </span>
          </div>
        </div>

        {/* Total Top-ups */}
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-5 shadow-sm space-y-4 hover:border-[#10AFA5]/20 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Top-ups</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <FiArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-800 leading-none">
              ₹{loadSummary ? '---' : summary?.totalTopup?.toLocaleString('en-IN') || '0.00'}
            </p>
            <span className="text-[9px] text-gray-400 font-semibold block mt-3">
              This Month
            </span>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-5 shadow-sm space-y-4 hover:border-[#10AFA5]/20 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Spent</span>
            <div className="h-8 w-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
              <FiArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-800 leading-none">
              ₹{loadSummary ? '---' : summary?.totalSpent?.toLocaleString('en-IN') || '0.00'}
            </p>
            <span className="text-[9px] text-gray-400 font-semibold block mt-3">
              This Month
            </span>
          </div>
        </div>

        {/* Pending Deductions */}
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-5 shadow-sm space-y-4 hover:border-[#10AFA5]/20 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Deductions</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shrink-0">
              <FiClock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-800 leading-none">
              ₹{loadSummary ? '---' : summary?.pendingDeductions?.toLocaleString('en-IN') || '0.00'}
            </p>
            <span className="text-[9px] text-gray-400 font-semibold block mt-3">
              Auto deduct after completion
            </span>
          </div>
        </div>

      </div>

      {/* Main Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Top up Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Top Up Wallet</h3>
            <p className="text-[10px] text-gray-400 font-semibold mt-1">Add money to your wallet to upload and manage bulk jobs</p>
          </div>

          <form onSubmit={handleProceedPay} className="space-y-6">
            {/* Input & Quick presets */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-700 block">Enter Amount</label>
              
              <div className="relative max-w-lg">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₹</span>
                <input 
                  type="number" 
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  className="w-full h-11 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl pl-8 pr-4 focus:ring-2 focus:ring-[#10AFA5]/10 focus:border-[#10AFA5] transition-all font-bold"
                />
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 pt-1.5">
                {['5000', '10000', '20000', '50000', '100000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className={`text-[11px] font-bold px-4 py-2 border rounded-xl transition-all cursor-pointer ${
                      topupAmount === amt 
                        ? 'border-[#10AFA5] bg-[#10AFA5]/5 text-[#10AFA5]' 
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    ₹{parseInt(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector Method */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 block">Select Payment Method</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Razorpay */}
                <div 
                  onClick={() => setSelectedMethod('razorpay')}
                  className={`border rounded-2xl p-4 flex flex-col justify-between h-20 cursor-pointer transition-all ${
                    selectedMethod === 'razorpay' 
                      ? 'border-[#10AFA5] bg-[#10AFA5]/5 text-gray-800' 
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <p className="text-xs font-bold">Razorpay</p>
                  <span className="text-[9px] text-gray-400 font-semibold">UPI, Cards, Netbanking</span>
                </div>

                {/* Bank Transfer */}
                <div 
                  onClick={() => setSelectedMethod('bank')}
                  className={`border rounded-2xl p-4 flex flex-col justify-between h-20 cursor-pointer transition-all ${
                    selectedMethod === 'bank' 
                      ? 'border-[#10AFA5] bg-[#10AFA5]/5 text-gray-800' 
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <p className="text-xs font-bold">Bank Transfer</p>
                  <span className="text-[9px] text-gray-400 font-semibold">NEFT, RTGS, IMPS</span>
                </div>

                {/* UPI */}
                <div 
                  onClick={() => setSelectedMethod('upi')}
                  className={`border rounded-2xl p-4 flex flex-col justify-between h-20 cursor-pointer transition-all ${
                    selectedMethod === 'upi' 
                      ? 'border-[#10AFA5] bg-[#10AFA5]/5 text-gray-800' 
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <p className="text-xs font-bold">UPI</p>
                  <span className="text-[9px] text-gray-400 font-semibold">GPay, PhonePe, Paytm</span>
                </div>

              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-[#10AFA5] hover:bg-[#0D9488] disabled:bg-gray-200 text-white text-sm font-bold h-11 rounded-xl shadow-lg shadow-teal-500/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {processing ? 'Processing Payment...' : `Proceed to Pay ₹${parseFloat(topupAmount || '0').toLocaleString('en-IN')}`}
            </button>
          </form>

          {/* Secure Trust badges */}
          <div className="flex flex-wrap gap-4 justify-between items-center text-[10px] font-bold text-gray-400 border-t border-gray-50 pt-5 mt-2">
            <span className="flex items-center gap-1.5"><FiShield className="text-[#10AFA5] w-3.5 h-3.5" /> 100% Secure Payments</span>
            <span className="flex items-center gap-1.5"><FiCheck className="text-[#10AFA5] w-3.5 h-3.5" /> Instant Wallet Top-up</span>
            <span className="flex items-center gap-1.5"><FiFileText className="text-[#10AFA5] w-3.5 h-3.5" /> GST Invoice Available</span>
          </div>
        </div>

        {/* Right Side: How It Works Info */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Timeline steps */}
          <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-gray-800">How It Works</h3>
            
            <div className="relative pl-7 space-y-5">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#E6F4F2]"></div>
              
              {[
                { title: 'Top Up Wallet', desc: 'Add money to your wallet using secure payment methods.' },
                { title: 'Upload Jobs', desc: 'Upload your bulk jobs and our system will process them.' },
                { title: 'Jobs Completed', desc: 'Engineers complete the jobs successfully.' },
                { title: 'Auto Deduction', desc: 'Amount is automatically deducted from your wallet.' }
              ].map((step, idx) => (
                <div key={idx} className="relative space-y-1 text-xs">
                  <span className="absolute -left-7 top-0.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-[#10AFA5] flex items-center justify-center text-[8px] font-bold text-[#10AFA5] z-10">
                    {idx + 1}
                  </span>
                  <p className="font-bold text-gray-800">{step.title}</p>
                  <p className="text-gray-400 font-semibold text-[10px] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Rule Card */}
          <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Pricing & Deductions</h3>
            
            <div className="bg-[#F0FDFA]/50 border border-[#10AFA5]/10 rounded-2xl p-4 text-xs font-semibold space-y-2.5">
              <div className="flex justify-between items-center text-gray-600">
                <span>Per Job Charge</span>
                <span>₹{summary?.deductionRule?.perJobCharge?.toFixed(2) || '12.00'}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>GST (18%)</span>
                <span>₹{parseFloat(( (summary?.deductionRule?.perJobCharge || 12) * 0.18 ).toFixed(2)) || '2.16'}</span>
              </div>
              <div className="border-t border-[#10AFA5]/10 pt-2.5 flex justify-between items-center text-[#10AFA5] font-black">
                <span>Total Deduction Per Job</span>
                <span>₹{summary?.deductionRule?.totalPerJob?.toFixed(2) || '14.16'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Transaction History Logs */}
      <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-gray-50 mb-6">
          <h3 className="text-sm font-bold text-gray-800">Transaction History</h3>
        </div>

        {loadTxns ? (
          <div className="flex justify-center items-center py-20">
            <FiLoader className="w-8 h-8 text-[#10AFA5] animate-spin" />
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs font-bold leading-relaxed">
            No transactions found in this wallet ledger yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 font-bold pb-3">
                  <th className="pb-3 pr-4">Transaction ID</th>
                  <th className="pb-3 px-4">Type</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Payment Method</th>
                  <th className="pb-3 px-4">Description</th>
                  <th className="pb-3 px-4">Date & Time</th>
                  <th className="pb-3 pl-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/25 transition-colors">
                    <td className="py-4 pr-4 font-bold text-[#10AFA5] truncate max-w-[120px]">{t.transactionId}</td>
                    <td className="py-4 px-4 capitalize font-bold text-gray-800">
                      {t.type === 'topup' ? 'Top-up' : t.type === 'job_deduction' ? 'Auto Deduction' : t.type}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-black ${t.amount >= 0 ? 'text-green-600' : 'text-gray-800'}`}>
                        {t.amount >= 0 ? '+' : '-'}₹{Math.abs(t.totalAmount || t.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        t.status === 'success' 
                          ? 'bg-green-100 text-green-700' 
                          : t.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 capitalize">{t.paymentMethod}</td>
                    <td className="py-4 px-4 text-gray-600 truncate max-w-[200px]">{t.remark || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-400 text-[10px]">
                      {new Date(t.date || t.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      {t.status === 'success' && (
                        <button 
                          onClick={() => handleDownloadInvoice(t.transactionId)}
                          className="text-gray-400 hover:text-[#10AFA5] p-1 bg-gray-50 rounded"
                        >
                          <FiDownload className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Wallet;
