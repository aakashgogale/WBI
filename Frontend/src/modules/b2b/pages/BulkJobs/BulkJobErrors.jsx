import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiDownload, FiChevronDown, FiChevronUp, 
  FiChevronLeft, FiChevronRight, FiClock, FiAlertTriangle, FiInfo
} from 'react-icons/fi';
import api from '../../../../services/api';

const BulkJobErrors = () => {
  const { batchId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const itemsPerPage = 20;

  // 1. Fetch Batch Context
  const { data: batchData } = useQuery({
    queryKey: ['b2bErrorsBatch', batchId],
    queryFn: async () => {
      const res = await api.get(`/b2b/bulk-jobs/${batchId}`);
      return res.data.batch;
    }
  });

  // 2. Fetch Paginated Errors
  const { data: errorsData, isLoading } = useQuery({
    queryKey: ['b2bErrorsListAll', batchId, currentPage],
    queryFn: async () => {
      const res = await api.get(`/b2b/bulk-jobs/errors/${batchId}`, {
        params: { page: currentPage, limit: itemsPerPage }
      });
      return res.data;
    }
  });

  const toggleRow = (rowId) => {
    const updated = new Set(expandedRows);
    if (updated.has(rowId)) {
      updated.delete(rowId);
    } else {
      updated.add(rowId);
    }
    setExpandedRows(updated);
  };

  const errors = errorsData?.errors || [];
  const pagination = errorsData?.pagination || { page: 1, totalPages: 1, total: 0 };
  const batch = batchData;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link 
            to="/b2b/bulk-jobs"
            className="h-10 w-10 bg-white border border-[#E6F4F2] hover:border-[#10AFA5] rounded-xl flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Validation Error Log</h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              File: <strong className="text-gray-600 font-bold">{batch?.fileName || 'Spreadsheet'}</strong>
            </p>
          </div>
        </div>

        <a 
          href={`${import.meta.env.VITE_API_BASE_URL || 'https://app.wbinfs.com'}/api/b2b/bulk-jobs/errors/${batchId}/download`}
          download
          className="bg-white border border-red-200 hover:border-red-500 text-red-500 text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-2 transition-all hover:shadow cursor-pointer"
        >
          <FiDownload className="w-4.5 h-4.5" />
          Download Error Sheet (.xlsx)
        </a>
      </div>

      {/* Error Grid Table */}
      <div className="bg-white rounded-3xl border border-[#E6F4F2] p-6 shadow-sm space-y-4">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 pb-2">
                <th className="py-2.5 pl-2">Row No.</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Service Type</th>
                <th>Address Details</th>
                <th className="text-red-500">Error Highlight</th>
                <th className="text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-500">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400 font-bold">
                    <FiClock className="w-6 h-6 animate-spin mx-auto text-[#10AFA5] mb-2" />
                    Fetching validation entries...
                  </td>
                </tr>
              ) : errors.length > 0 ? (
                errors.map((err) => {
                  const isExpanded = expandedRows.has(err._id);
                  return (
                    <React.Fragment key={err._id}>
                      <tr className="hover:bg-red-50/10 transition-colors cursor-pointer" onClick={() => toggleRow(err._id)}>
                        <td className="py-4 pl-2 font-mono text-gray-400">{err.rowNumber}</td>
                        <td className="font-bold text-gray-800">{err.rowData.customerName || 'N/A'}</td>
                        <td>{err.rowData.phone || 'N/A'}</td>
                        <td>
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold">
                            {err.rowData.service || 'N/A'}
                          </span>
                        </td>
                        <td className="max-w-[200px] truncate">{err.rowData.address || 'N/A'}, {err.rowData.city || ''}</td>
                        <td className="text-red-500 font-bold max-w-[180px] truncate">
                          {err.errors[0]} {err.errors.length > 1 && `(+${err.errors.length - 1} more)`}
                        </td>
                        <td className="text-right pr-2">
                          <button 
                            className="text-[#10AFA5] hover:bg-[#F0FDFA] p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="bg-red-50/20 p-4 border-l-2 border-red-500">
                            <div className="space-y-3 pl-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-red-500">
                                <FiAlertTriangle className="w-4.5 h-4.5" />
                                <span>Specific row issues found:</span>
                              </div>
                              <ul className="list-disc pl-5 text-xs text-gray-600 font-semibold space-y-1.5">
                                {err.errors.map((errorMsg, idx) => (
                                  <li key={idx} className="leading-relaxed">{errorMsg}</li>
                                ))}
                              </ul>
                              <div className="flex gap-2 items-start mt-3 text-[10px] text-gray-400 font-medium bg-white p-2.5 rounded-xl border border-gray-100 max-w-lg">
                                <FiInfo className="w-4 h-4 shrink-0 text-[#10AFA5] mt-0.5" />
                                <p>
                                  Make sure columns match exactly and the values follow system conventions (e.g. valid 10 digits for Phone, active services like 'AC Repair', correct 6-digit Pincodes).
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 font-bold">
                    No validation errors resolved for this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center border-t border-gray-50 pt-4 text-xs font-bold text-gray-500">
            <span>Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total errors)</span>
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

    </div>
  );
};

export default BulkJobErrors;
