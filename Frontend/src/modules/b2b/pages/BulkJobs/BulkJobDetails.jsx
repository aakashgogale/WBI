import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle, 
  FiFile, FiList, FiChevronLeft, FiChevronRight, FiUser, FiMapPin
} from 'react-icons/fi';
import api from '../../../../services/api';

const BulkJobDetails = () => {
  const { batchId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 1. Fetch batch details
  const { data: batchData, isLoading: batchLoading } = useQuery({
    queryKey: ['b2bBatchDetails', batchId],
    queryFn: async () => {
      const res = await api.get(`/b2b/bulk-jobs/${batchId}`);
      return res.data.batch;
    }
  });

  // 2. Fetch created jobs linked to this batch (using query parameters on /b2b/jobs)
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['b2bBatchCreatedJobs', batchId, currentPage],
    queryFn: async () => {
      const res = await api.get('/b2b/jobs', {
        params: {
          batchId,
          page: currentPage,
          limit: itemsPerPage
        }
      });
      return res.data;
    },
    enabled: !!batchId
  });

  if (batchLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 font-bold">
        <FiClock className="w-8 h-8 animate-spin text-[#10AFA5] mb-2" />
        Resolving batch statistics...
      </div>
    );
  }

  const batch = batchData;
  if (!batch) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-[#E6F4F2] p-6">
        <FiAlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-sm font-bold text-gray-800">Batch Not Found</h3>
        <p className="text-xs text-gray-400 font-semibold mt-1">This spreadsheet batch does not exist or has been deleted.</p>
        <Link to="/b2b/bulk-jobs" className="mt-4 inline-block text-xs font-bold text-[#10AFA5] hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  const jobsList = jobsData?.data || [];
  const pagination = jobsData?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          to="/b2b/bulk-jobs/history"
          className="h-10 w-10 bg-white border border-[#E6F4F2] hover:border-[#10AFA5] rounded-xl flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Batch Details</h1>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">
            Batch Reference ID: <strong className="text-mono text-gray-600 font-bold uppercase">{batch.batchId}</strong>
          </p>
        </div>
      </div>

      {/* Batch Summary Card */}
      <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-[#F0FDFA] text-[#10AFA5] rounded-2xl flex items-center justify-center text-xl font-bold border border-[#10AFA5]/10">
              <FiFile />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{batch.fileName}</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Uploaded: {new Date(batch.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            batch.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' :
            batch.status === 'failed' ? 'bg-red-50 text-red-500 border border-red-100' :
            batch.status === 'validated' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
            batch.status === 'processing' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100 animate-pulse' :
            'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            {batch.status}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
            <span className="block text-[10px] text-gray-400 font-bold uppercase">Total Rows</span>
            <span className="text-lg font-extrabold text-gray-800">{batch.totalRows}</span>
          </div>
          <div className="p-4 bg-green-50/20 rounded-2xl border border-green-50">
            <span className="block text-[10px] text-gray-400 font-bold uppercase">Valid Jobs</span>
            <span className="text-lg font-extrabold text-green-600">{batch.validRows}</span>
          </div>
          <div className="p-4 bg-red-50/20 rounded-2xl border border-red-50">
            <span className="block text-[10px] text-gray-400 font-bold uppercase">Invalid Rows</span>
            <span className="text-lg font-extrabold text-red-500">{batch.invalidRows}</span>
          </div>
          <div className="p-4 bg-teal-50/20 rounded-2xl border border-teal-50">
            <span className="block text-[10px] text-gray-400 font-bold uppercase">Estimated Cost</span>
            <span className="text-lg font-extrabold text-teal-600">₹{batch.estimatedCost.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {batch.status === 'failed' && batch.failureReason && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-semibold p-4 rounded-2xl flex gap-2">
            <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold">Failure Reason:</span>
              <p className="mt-0.5 font-medium text-red-500/80">{batch.failureReason}</p>
            </div>
          </div>
        )}
      </div>

      {/* Dispatched Jobs Table */}
      {batch.status === 'completed' && (
        <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
            <FiList className="text-[#10AFA5] w-5 h-5" />
            <h3 className="text-sm font-bold text-gray-800">Dispatched Service Jobs</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 pb-2">
                  <th className="py-2.5 pl-2">Job ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Service</th>
                  <th>City</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-right pr-2">Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {jobsLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400 font-bold">
                      Loading scheduled jobs...
                    </td>
                  </tr>
                ) : jobsList.length > 0 ? (
                  jobsList.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pl-2 font-mono text-[10px] text-gray-400 uppercase">{job.jobId.split('-').pop() || job.jobId}</td>
                      <td className="font-bold text-gray-800">
                        <div className="flex items-center gap-1.5">
                          <FiUser className="text-gray-400" />
                          {job.customerName}
                        </div>
                      </td>
                      <td>{job.phone}</td>
                      <td>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold">
                          {job.service}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <FiMapPin className="text-gray-400 shrink-0" />
                          {job.city}
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.priority === 'High' ? 'bg-red-50 text-red-500' :
                          job.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-blue-50 text-blue-500'
                        }`}>
                          {job.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          job.status === 'completed' ? 'bg-green-50 text-green-600' :
                          job.status === 'assigned' ? 'bg-blue-50 text-blue-600' :
                          job.status === 'searching_engineer' ? 'bg-yellow-50 text-yellow-600 animate-pulse' :
                          job.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-right pr-2 font-extrabold text-gray-800">₹{job.charge.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400 font-bold">
                      No jobs currently active or dispatched for this batch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center border-t border-gray-50 pt-4 text-xs font-bold text-gray-500">
              <span>Showing Page {pagination.page} of {pagination.totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="h-8 w-8 border border-[#E6F4F2] disabled:opacity-40 rounded-lg flex items-center justify-center bg-white hover:border-[#10AFA5] transition-all hover:shadow cursor-pointer"
                >
                  <FiChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="h-8 w-8 border border-[#E6F4F2] disabled:opacity-40 rounded-lg flex items-center justify-center bg-white hover:border-[#10AFA5] transition-all hover:shadow cursor-pointer"
                >
                  <FiChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default BulkJobDetails;
