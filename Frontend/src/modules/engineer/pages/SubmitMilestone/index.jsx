import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUploadCloud, FiX, FiFileText } from 'react-icons/fi';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';
import uploadToCloudinary from '../../../../utils/cloudinaryUpload';

const SubmitMilestone = () => {
  const { projectId, milestoneId } = useParams();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [workDescription, setWorkDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMilestoneDetails();
  }, [projectId, milestoneId]);

  const fetchMilestoneDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/workers/projects/${projectId}/milestones/${milestoneId}`);
      if (res.data.success) {
        const ms = res.data.data;
        if (!['Pending', 'In Progress', 'Rejected'].includes(ms.status)) {
          toast.error(`Cannot submit a milestone that is ${ms.status}`);
          navigate(`/engineer/projects/${projectId}/milestones`);
          return;
        }
        setMilestone(ms);
      }
    } catch (error) {
      toast.error('Failed to load milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    setUploading(true);
    const uploadedFiles = [];

    for (let file of selectedFiles) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 20MB limit`);
        continue;
      }
      
      try {
        const secureUrl = await uploadToCloudinary(file, 'wbi_milestones');
        uploadedFiles.push({
          fileUrl: secureUrl,
          title: file.name,
          type: file.type || 'unknown'
        });
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (uploadedFiles.length > 0) {
      setFiles((prev) => [...prev, ...uploadedFiles]);
      toast.success('Files uploaded successfully');
    }
    setUploading(false);
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!workDescription.trim()) {
      return toast.error('Work Description is required');
    }

    try {
      setSubmitting(true);
      const payload = {
        workDescription,
        notes,
        attachments: files
      };

      const res = await api.post(`/api/workers/projects/${projectId}/milestones/${milestoneId}/submit`, payload);
      
      if (res.data.success) {
        toast.success('Milestone submitted for review!');
        navigate(`/engineer/projects/${projectId}/milestones/${milestoneId}/review`);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit milestone';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !milestone) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] p-4 space-y-4">
        <div className="h-14 bg-white rounded animate-pulse w-full"></div>
        <div className="h-24 bg-white rounded-2xl animate-pulse"></div>
        <div className="h-40 bg-white rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FCFC]  font-sans text-[#0F172A]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#F8FCFC] border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <button className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full" onClick={() => navigate(-1)}>
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Submit Milestone</h1>
          <div className="w-6"></div> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Milestone Info */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50">
          <p className="text-xs font-bold text-[#10AFA5] mb-1">Milestone</p>
          <h2 className="text-[15px] font-bold text-[#0F172A]">{milestone.title}</h2>
          
          {milestone.dueDate && (
            <p className="text-xs text-gray-500 mt-2">
              Due: {new Date(milestone.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Work Description */}
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] mb-2 px-1">Work Description <span className="text-red-500">*</span></h3>
          <textarea
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            placeholder="Describe what you have completed for this milestone..."
            className="w-full h-32 p-4 rounded-2xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#10AFA5] focus:ring-1 focus:ring-[#10AFA5] resize-none transition-all shadow-sm"
          ></textarea>
        </div>

        {/* Upload Files */}
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] mb-1 px-1">Upload Files</h3>
          <p className="text-xs text-gray-500 mb-3 px-1">Add screenshots, documents or source code (Max 20MB)</p>
          
          <div className="flex flex-wrap gap-3">
            {files.map((f, idx) => (
              <div key={idx} className="w-[85px] h-[85px] rounded-xl border border-gray-200 relative group overflow-hidden bg-gray-50 flex items-center justify-center">
                {f.type.includes('image') ? (
                  <img src={f.fileUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center p-2 text-center text-[#10AFA5]">
                    <FiFileText className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-medium truncate w-full">{f.title.split('.').pop().toUpperCase()}</span>
                  </div>
                )}
                <button 
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm text-red-500 rounded-full p-1 border border-gray-200 shadow-sm"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            ))}

            <label className={`w-[85px] h-[85px] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input type="file" multiple className="hidden" onChange={handleFileChange} disabled={uploading} />
              {uploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#10AFA5] border-t-transparent"></div>
              ) : (
                <span className="text-2xl font-light">+</span>
              )}
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] mb-2 px-1">Notes (Optional)</h3>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes for the reviewer..."
            className="w-full p-4 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#10AFA5] focus:ring-1 focus:ring-[#10AFA5] transition-all shadow-sm"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-[0_4px_15px_rgba(16,175,165,0.3)] transition-all active:scale-[0.98] ${
              submitting || uploading ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-[#10AFA5] hover:bg-teal-600'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitMilestone;
