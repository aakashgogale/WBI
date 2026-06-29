import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiDownload, FiTrash2, FiCheckCircle, 
  FiAlertCircle, FiTrendingUp, FiArrowRight, FiFile,
  FiUploadCloud, FiCreditCard, FiDollarSign, FiClock, FiPlusCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const BulkJobReview = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetch batch details
  const { data: batchData, isLoading: batchLoading } = useQuery({
    queryKey: ['b2bBatchReview', batchId],
    queryFn: async () => {
      const res = await api.get(`/b2b/bulk-jobs/${batchId}`);
      return res.data.batch;
    }
  });

  // 2. Fetch Wallet Summary
  const { data: walletData } = useQuery({
    queryKey: ['b2bWalletReviewSummary'],
    queryFn: async () => {
      const res = await api.get('/b2b/wallet/summary');
      return res.data.data;
    }
  });

  // 3. Fetch first 10 errors preview
  const { data: errorsData } = useQuery({
    queryKey: ['b2bBatchErrorsPreview', batchId],
    queryFn: async () => {
      const res = await api.get(`/b2b/bulk-jobs/errors/${batchId}`, {
        params: { page: 1, limit: 10 }
      });
      return res.data.errors;
    }
  });

  // 4. Confirm Upload dispatch mutation
  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/b2b/bulk-jobs/confirm/${batchId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Batch dispatch queued successfully!');
      localStorage.setItem('activeB2BBatchId', batchId); // Retain batchId for live progress matching
      queryClient.invalidateQueries(['b2bBulkJobStats']);
      navigate('/b2b/bulk-jobs'); // Redirect back to index where progress is rendered
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Dispatch confirmation failed');
    }
  });

  // 5. Abort and delete draft batch mutation
  const deleteBatchMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/b2b/bulk-jobs/${batchId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Batch draft purged successfully');
      localStorage.removeItem('activeB2BBatchId');
      navigate('/b2b/bulk-jobs');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Purging failed');
    }
  });

  if (batchLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 font-bold">
        <FiClock className="w-8 h-8 animate-spin text-[#10AFA5] mb-2" />
        Resolving batch validations...
      </div>
    );
  }

  const batch = batchData;
  if (!batch) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-red-100 p-6">
        <FiAlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-sm font-bold text-gray-800">Batch Not Found</h3>
        <p className="text-xs text-gray-400 font-semibold mt-1">This spreadsheet batch does not exist or has been deleted.</p>
        <Link to="/b2b/bulk-jobs" className="mt-4 inline-block text-xs font-bold text-[#10AFA5] hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  const walletBalance = walletData?.balance || 0;
  const isWalletInsufficient = walletBalance < batch.estimatedCost;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          to="/b2b/bulk-jobs"
          className="h-10 w-10 bg-white border border-[#E6F4F2] hover:border-[#10AFA5] rounded-xl flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Review Validation Results</h1>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">
            File name: <strong className="text-gray-600 font-bold">{batch.fileName}</strong>
          </p>
        </div>
      </div>

      {/* Selected File Details and Stats breakdown Card */}
      <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm space-y-6">
        
        {/* Top File Icon Meta Row */}
        <div className="flex justify-between items-start flex-wrap gap-4 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-xl font-bold border border-green-100">
              <FiFile />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{batch.fileName}</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Uploaded: {new Date(batch.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <button 
            onClick={() => deleteBatchMutation.mutate()}
            disabled={deleteBatchMutation.isPending}
            className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <FiTrash2 className="w-4 h-4" /> Remove File
          </button>
        </div>

        {/* Breakdown Stats Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total Rows', value: batch.totalRows, color: 'text-gray-800 bg-gray-50/50' },
            { label: 'Valid Rows', value: batch.validRows, color: 'text-green-600 bg-green-50/30' },
            { label: 'Invalid Rows', value: batch.invalidRows, color: batch.invalidRows > 0 ? 'text-red-500 bg-red-50/30' : 'text-gray-400 bg-gray-50/30' },
            { label: 'Duplicates', value: batch.duplicates, color: batch.duplicates > 0 ? 'text-yellow-600 bg-yellow-50/30' : 'text-gray-400 bg-gray-50/30' },
            { 
              label: 'Estimated Cost', 
              value: `₹${batch.estimatedCost.toLocaleString('en-IN')}`, 
              sub: `(₹${batch.perJobCharge} per job)`,
              color: 'text-teal-600 bg-teal-50/30' 
            }
          ].map((c, i) => (
            <div key={i} className={`p-4 rounded-2xl border border-gray-50 ${c.color} space-y-1`}>
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">{c.label}</span>
              <span className="block text-lg font-black tracking-tight">{c.value}</span>
              {c.sub && <span className="block text-[8px] text-gray-400 font-semibold">{c.sub}</span>}
            </div>
          ))}
        </div>

        {/* Banner alerts depending on valid status */}
        {batch.invalidRows > 0 ? (
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex gap-3 text-red-500 items-start text-xs font-semibold leading-relaxed">
            <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold">Validation flagged errors!</span>
              <p className="mt-0.5 font-medium text-red-500/80">
                You have {batch.invalidRows} invalid rows containing formatting errors or missing fields. You can confirm creation of the {batch.validRows} valid rows, or download the error sheet, resolve the issues, and re-upload the file.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#F0FDFA] border border-teal-100 rounded-2xl p-4 flex gap-3 text-[#10AFA5] items-start text-xs font-semibold leading-relaxed">
            <FiCheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold">Validation completed successfully!</span>
              <p className="mt-0.5 font-medium text-teal-600/80">
                All {batch.totalRows} rows are validated and ready to schedule. Verify your wallet balance below to authorize the dispatch.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Financial Wallet Check Block */}
      <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-4">
          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
            isWalletInsufficient ? 'bg-red-50 text-red-500' : 'bg-[#F0FDFA] text-[#10AFA5]'
          }`}>
            <FiCreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Ensure your wallet has sufficient balance</h3>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              Available Corporate Balance: <strong className={isWalletInsufficient ? 'text-red-500' : 'text-gray-800'}>
                ₹{walletBalance.toLocaleString('en-IN')}
              </strong> (Required: ₹{batch.estimatedCost.toLocaleString('en-IN')})
            </p>
          </div>
        </div>

        {isWalletInsufficient ? (
          <Link 
            to="/b2b/wallet"
            className="bg-[#10AFA5] hover:bg-[#0D9488] text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md shadow-teal-500/10 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <FiPlusCircle className="w-4.5 h-4.5" /> Top Up Wallet
          </Link>
        ) : (
          <div className="text-[10px] text-green-500 font-bold flex items-center gap-1 uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <FiCheckCircle className="w-4 h-4" /> Wallet Balance Verified
          </div>
        )}
      </div>

      {/* Errors Preview table (Renders if errors count > 0) */}
      {batch.invalidRows > 0 && (
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">Errors Preview (First 10 rows)</h3>
            <span className="text-xs font-bold text-red-500">Total Errors: {batch.invalidRows}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="text-gray-400 border-b border-gray-50 pb-2">
                  <th className="py-2.5 pl-2">Row No.</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Service</th>
                  <th>City</th>
                  <th>Pincode</th>
                  <th className="text-red-500 text-right pr-2">Error(s)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-500">
                {errorsData && errorsData.length > 0 ? (
                  errorsData.map((err) => (
                    <tr key={err._id} className="hover:bg-red-50/20 transition-colors">
                      <td className="py-3 pl-2 font-mono text-gray-400">{err.rowNumber}</td>
                      <td className="font-bold text-gray-800">{err.rowData.customerName || 'N/A'}</td>
                      <td>{err.rowData.phone || 'N/A'}</td>
                      <td className="max-w-[150px] truncate">{err.rowData.address || 'N/A'}</td>
                      <td>{err.rowData.service || 'N/A'}</td>
                      <td>{err.rowData.city || 'N/A'}</td>
                      <td>{err.rowData.pincode || 'N/A'}</td>
                      <td className="text-right text-red-500 font-extrabold pr-2 max-w-[200px] truncate">
                        {err.errors.join(', ')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-400 font-bold">
                      Loading preview rows...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link 
              to={`/b2b/bulk-jobs/errors/${batch._id}`}
              className="text-xs font-bold text-[#10AFA5] hover:underline"
            >
              View All Errors Detail
            </Link>
            <a 
              href={`${import.meta.env.VITE_API_BASE_URL || 'https://app.wbinfs.com'}/api/b2b/bulk-jobs/errors/${batch._id}/download`}
              download
              className="text-xs font-bold text-[#10AFA5] hover:underline flex items-center gap-1"
            >
              <FiDownload className="w-4 h-4" /> Download Full Error Report
            </a>
          </div>
        </div>
      )}

      {/* Step Confirm Bottom Action Row */}
      <div className="flex flex-col sm:flex-row justify-end gap-3.5 pt-4">
        <button 
          onClick={() => deleteBatchMutation.mutate()}
          className="h-11 px-6 bg-white border border-[#E6F4F2] hover:border-[#10AFA5] text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Cancel & Upload New
        </button>

        <button 
          onClick={() => confirmMutation.mutate()}
          disabled={confirmMutation.isPending || isWalletInsufficient || batch.validRows === 0}
          className="h-11 px-8 bg-[#10AFA5] hover:bg-[#0D9488] disabled:bg-gray-200 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          {confirmMutation.isPending ? 'Confirming Dispatch...' : 'Confirm Upload & Dispatch ->'}
        </button>
      </div>

    </div>
  );
};

export default BulkJobReview;
