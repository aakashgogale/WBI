import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiChevronLeft, FiUser, FiBriefcase, FiMail, FiPhone, FiMapPin,
  FiServer, FiFileText, FiCalendar, FiUploadCloud, FiCheckCircle, FiInfo,
  FiCreditCard, FiHash, FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const BankingEnquiry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    city: '',
    branchCode: '',
    serviceType: location.state?.serviceType || 'ATM Service',
    machineModels: '',
    numberOfUnits: '1-5',
    description: '',
    urgency: 'Medium',
    deadline: '',
    source: 'Google',
    attachments: []
  });

  const [files, setFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 3) {
      toast.error('You can upload a maximum of 3 files');
      return;
    }
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return [];
    setUploading(true);
    const uploadedUrls = [];
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await api.post('/upload-file', formData);
        
        if (res.data.success) {
          uploadedUrls.push({
            url: res.data.imageUrl,
            filename: file.name
          });
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload some attachments. Proceeding without them.');
    } finally {
      setUploading(false);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.city || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload files first
      let attachmentUrls = [];
      if (files.length > 0) {
        attachmentUrls = await uploadFiles();
      }

      // 2. Submit form data
      const finalData = {
        ...formData,
        attachments: attachmentUrls
      };

      const res = await api.post('/public/banking-enquiries', finalData);
      
      if (res.data.success) {
        toast.success(res.data.message || 'Enquiry submitted successfully!');
        navigate(-1); // Go back after success
      } else {
        toast.error(res.data.message || 'Failed to submit enquiry');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FCFC] min-h-screen pb-[100px]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F8FCFC]/90 backdrop-blur-md px-4 py-4 flex items-center shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-95 transition-transform"
        >
          <FiChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div className="flex-1 text-center pr-10">
          <h1 className="text-[17px] font-bold text-[#0F172A]">Banking Solutions</h1>
        </div>
      </header>

      <div className="px-4 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#10AFA5] to-[#0A8D84] rounded-3xl p-6 text-white mb-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-2">Secure & Reliable</h2>
          <p className="text-sm text-teal-50 opacity-90 leading-relaxed">
            Fill out this form to request ATM, POS, or other banking infrastructure services. Our specialized team will review your requirements and respond promptly.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: Client Basic Info */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiUser className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">1. Basic Info</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name *</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="John Doe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Bank / Company</label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="SBI, HDFC, etc." />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Branch Code</label>
                  <div className="relative">
                    <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" name="branchCode" value={formData.branchCode} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="Branch Code" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Email Address *</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="john@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone Number *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="9876543210" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">City / Location *</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="City Name" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Service Details */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiServer className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">2. Service Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Type *</label>
                <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                  <option value="ATM Service">ATM Service</option>
                  <option value="ATM Cassette Service">ATM Cassette Service</option>
                  <option value="Passbook Printer Service">Passbook Printer Service</option>
                  <option value="Cash Deposit Machine Service">Cash Deposit Machine Service</option>
                  <option value="POS Service">POS Service</option>
                  <option value="VSAT Service">VSAT Service</option>
                  <option value="Barcode Readers">Barcode Readers</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">Number of Units / Locations</label>
                <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-100">
                  {['1-5', '6-20', '21-50', '50+'].map(option => (
                    <button 
                      key={option} type="button"
                      onClick={() => handleInputChange({ target: { name: 'numberOfUnits', value: option } })}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${formData.numberOfUnits === option ? 'bg-white text-[#10AFA5] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Machine Models (Optional)</label>
                <div className="relative">
                  <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="machineModels" value={formData.machineModels} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="E.g., NCR SelfServ, Verifone VX520" />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Request Scope */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiFileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">3. Request Scope</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Description of Requirement *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="4" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all resize-none" placeholder="Describe the problem, installation request, or maintenance needs..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Urgency</label>
                  <div className="relative">
                    <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Preferred Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Attachments */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiUploadCloud className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">4. Attachments (Optional)</h3>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-3">Upload error screenshots, machine photos, or SLA documents (Max 3 files).</p>
              
              <div className="relative group border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-[#F4FBFB] hover:border-[#10AFA5] transition-all p-6 text-center cursor-pointer overflow-hidden">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-[#10AFA5] group-hover:scale-110 transition-transform">
                    <FiUploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Tap to upload files</p>
                  <p className="text-xs text-gray-400 mt-1">Images, PDF, DOC</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FiFileText className="text-[#10AFA5] shrink-0" />
                        <span className="text-xs text-gray-700 truncate">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-4 pb-8">
            <button 
              type="submit"
              disabled={loading || uploading}
              className="w-full py-4 rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2 bg-[#10AFA5] hover:bg-[#0C8F87] active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(16,175,165,0.3)] disabled:opacity-70 disabled:active:scale-100"
            >
              {loading || uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{uploading ? 'Uploading Files...' : 'Submitting...'}</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-500 mt-3 font-medium flex items-center justify-center gap-1">
              <FiInfo /> Our team will contact you within 24 hours.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankingEnquiry;
