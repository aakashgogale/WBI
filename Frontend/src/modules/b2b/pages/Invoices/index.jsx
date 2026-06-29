import React from 'react';
import { FiFileText, FiDownload, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Invoices = () => {
  const dummyInvoices = [
    { id: 'INV-2026-042', billingPeriod: '15 June 2026 - 28 June 2026', amount: 24500, status: 'Settled', date: '28 June 2026' },
    { id: 'INV-2026-039', billingPeriod: '01 June 2026 - 15 June 2026', amount: 38200, status: 'Settled', date: '15 June 2026' },
    { id: 'INV-2026-031', billingPeriod: '15 May 2026 - 31 May 2026', amount: 19800, status: 'Settled', date: '31 May 2026' }
  ];

  const handleDownload = (id) => {
    toast.success(`Downloading invoice ${id} PDF...`);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm">
        <div className="border-b border-gray-50 pb-4 mb-6">
          <h3 className="text-sm font-bold text-gray-800 border-l-4 border-[#10AFA5] pl-2 uppercase tracking-wide">Corporate Billing Invoices</h3>
        </div>

        <div className="space-y-4">
          {dummyInvoices.map((inv) => (
            <div 
              key={inv.id}
              className="border border-gray-50 hover:border-[#10AFA5]/25 rounded-2xl p-5 bg-gray-50/30 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-[#F0FDFA] rounded-xl flex items-center justify-center text-[#10AFA5] shrink-0 border border-[#10AFA5]/10">
                  <FiFileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{inv.id}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Billing: {inv.billingPeriod}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div className="text-right">
                  <p className="text-xs font-black text-gray-800">₹{inv.amount.toLocaleString('en-IN')}</p>
                  <span className="text-[9px] font-bold text-green-600 flex items-center justify-end gap-1 mt-0.5">
                    <FiCheckCircle className="w-3 h-3" /> {inv.status}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(inv.id)}
                  className="bg-white hover:bg-[#F0FDFA] border border-gray-200 text-[#10AFA5] p-2 rounded-xl transition-all"
                >
                  <FiDownload className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default Invoices;
