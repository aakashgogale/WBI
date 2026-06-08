import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiFileText, FiBriefcase, FiUsers, FiSettings, 
  FiLock, FiCalendar, FiDollarSign, FiShare2, FiHeart
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const CrmEnquiry = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form Data State
  const [formData, setFormData] = useState({
    // Section 1
    fullName: '', companyName: '', email: '', phone: '', city: '',
    
    // Section 2
    businessType: '', currentCrm: '', reasonForCrm: '', teamSize: '',
    
    // Section 3
    coreModules: [], customModulesNeeded: 'Not Sure', thirdPartyIntegration: '',
    
    // Section 4
    deploymentType: '', needMobileApp: 'No', needDataMigration: 'No', needStaffTraining: 'No',
    
    // Section 5
    expectedLaunchDate: '', projectUrgency: '', budgetRange: '', source: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Dropdown Options
  const businessTypes = ['Retail / E-Commerce', 'Real Estate', 'Healthcare / Clinic', 'Education / Coaching', 'Manufacturing', 'Service-Based Business', 'Finance / Insurance', 'Hospitality / Hotel', 'Other'];
  const currentCrms = ['None / Managing manually', 'Excel / Google Sheets', 'Salesforce', 'Zoho CRM', 'HubSpot', 'Custom Software', 'Other'];
  const teamSizes = ['Just Me (1)', '2–5', '6–15', '16–50', '50+'];
  const coreModulesList = ['Lead Management', 'Contact / Customer Database', 'Sales Pipeline Tracking', 'Follow-up Reminders & Alerts', 'Task & Activity Management', 'Email Integration', 'WhatsApp Integration', 'Invoice / Quotation Generation', 'Reporting & Analytics Dashboard', 'Role-Based Access (Admin/Staff/Manager)', 'Customer Support / Ticketing', 'Document Management', 'Product / Inventory Tracking', 'Campaign Management', 'Mobile App Access'];
  const deploymentTypes = ['Cloud / Online (SaaS)', 'On-Premise / Self-Hosted', 'No Preference'];
  const urgencies = ['ASAP', 'Within 1 Month', '1–3 Months', 'Flexible'];
  const budgetRanges = ['Below ₹25,000', '₹25,000 – ₹75,000', '₹75,000 – ₹1,50,000', '₹1,50,000 – ₹3,00,000', 'Above ₹3,00,000', 'To be discussed'];
  const sources = ['Social Media', 'Referral', 'Google', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCoreModule = (moduleName) => {
    setFormData(prev => {
      const exists = prev.coreModules.includes(moduleName);
      if (exists) {
        return { ...prev, coreModules: prev.coreModules.filter(m => m !== moduleName) };
      } else {
        return { ...prev, coreModules: [...prev.coreModules, moduleName] };
      }
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 3) {
        toast.error('Maximum 3 files allowed');
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return [];
    setUploading(true);
    const uploadedUrls = [];
    
    try {
      for (const file of files) {
        const fileData = new FormData();
        fileData.append('file', file);
        
        const res = await api.post('/upload-file', fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (res.data.success) {
          uploadedUrls.push({
            url: res.data.imageUrl,
            filename: file.name
          });
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to upload some attachments.');
    } finally {
      setUploading(false);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const attachmentUrls = await uploadFiles();
      
      const finalData = {
        ...formData,
        attachments: attachmentUrls
      };

      if (!finalData.expectedLaunchDate) {
        delete finalData.expectedLaunchDate;
      }

      const res = await api.post('/public/crm-enquiries', finalData);
      
      if (res.data.success) {
        setSuccess(true);
        toast.success('Enquiry submitted successfully!');
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 pb-24">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-4xl text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enquiry Received!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for your interest in our CRM Development services. Our technical team will review your requirements and contact you within 24 hours.
          </p>
          <button 
            onClick={() => navigate('/user')}
            className="w-full bg-[#10AFA5] text-white py-4 rounded-xl font-semibold hover:bg-[#0c8e86] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">CRM Development</h1>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <FiHeart className="text-xl" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <FiShare2 className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex-1">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <FiBriefcase className="text-2xl text-[#10AFA5]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Custom CRM Solutions</h2>
            <p className="text-gray-600 text-sm max-w-sm">Tailor-made Customer Relationship Management software to streamline your business operations.</p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1: Client Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <FiUsers />
              </div>
              <h3 className="text-lg font-bold text-gray-800">1. Basic Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business / Company Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Your company name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Email address" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="WhatsApp number" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Location *</label>
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="e.g. Mumbai, India" />
              </div>
            </div>
          </div>

          {/* Section 2: CRM Project Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <FiFileText />
              </div>
              <h3 className="text-lg font-bold text-gray-800">2. Project Details</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
                  <select required name="businessType" value={formData.businessType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent outline-none">
                    <option value="">Select industry</option>
                    {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current CRM Used? *</label>
                  <select required name="currentCrm" value={formData.currentCrm} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent outline-none">
                    <option value="">Select current system</option>
                    {currentCrms.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want a CRM? (Pain points) *</label>
                <textarea required name="reasonForCrm" value={formData.reasonForCrm} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent outline-none" placeholder="Explain the main problem you want to solve..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Team Members *</label>
                <select required name="teamSize" value={formData.teamSize} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent outline-none">
                  <option value="">Select team size</option>
                  {teamSizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Features Required */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <FiSettings />
              </div>
              <h3 className="text-lg font-bold text-gray-800">3. Features Required</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Core Modules Needed (Select multiple)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {coreModulesList.map(feature => (
                    <label key={feature} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.coreModules.includes(feature) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-[#10AFA5] rounded focus:ring-[#10AFA5]" 
                        checked={formData.coreModules.includes(feature)}
                        onChange={() => toggleCoreModule(feature)}
                      />
                      <span className={`ml-3 text-sm ${formData.coreModules.includes(feature) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Need Custom Fields/Modules?</label>
                  <div className="flex gap-4">
                    {['Yes', 'No', 'Not Sure'].map(opt => (
                      <label key={opt} className="flex items-center">
                        <input type="radio" name="customModulesNeeded" value={opt} checked={formData.customModulesNeeded === opt} onChange={handleInputChange} className="w-4 h-4 text-[#10AFA5] focus:ring-[#10AFA5]" />
                        <span className="ml-2 text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Third-party integrations needed?</label>
                <input type="text" name="thirdPartyIntegration" value={formData.thirdPartyIntegration} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="e.g. Tally, Razorpay, Shopify" />
              </div>
            </div>
          </div>

          {/* Section 4: Technical Preferences */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <FiLock />
              </div>
              <h3 className="text-lg font-bold text-gray-800">4. Technical Preferences</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deployment Type *</label>
                <select required name="deploymentType" value={formData.deploymentType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent outline-none">
                  <option value="">Select type</option>
                  {deploymentTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Need a Mobile App?</label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map(opt => (
                      <label key={`mobile-${opt}`} className="flex items-center">
                        <input type="radio" name="needMobileApp" value={opt} checked={formData.needMobileApp === opt} onChange={handleInputChange} className="w-4 h-4 text-[#10AFA5] focus:ring-[#10AFA5]" />
                        <span className="ml-2 text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Migration from existing system?</label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map(opt => (
                      <label key={`migrate-${opt}`} className="flex items-center">
                        <input type="radio" name="needDataMigration" value={opt} checked={formData.needDataMigration === opt} onChange={handleInputChange} className="w-4 h-4 text-[#10AFA5] focus:ring-[#10AFA5]" />
                        <span className="ml-2 text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Staff Training after delivery?</label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map(opt => (
                      <label key={`train-${opt}`} className="flex items-center">
                        <input type="radio" name="needStaffTraining" value={opt} checked={formData.needStaffTraining === opt} onChange={handleInputChange} className="w-4 h-4 text-[#10AFA5] focus:ring-[#10AFA5]" />
                        <span className="ml-2 text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Timeline & Budget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <FiCalendar />
              </div>
              <h3 className="text-lg font-bold text-gray-800">5. Timeline & Budget</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Go-Live Date</label>
                <input type="date" name="expectedLaunchDate" value={formData.expectedLaunchDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Urgency *</label>
                <select required name="projectUrgency" value={formData.projectUrgency} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent outline-none">
                  <option value="">Select urgency</option>
                  {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range *</label>
                <select required name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent outline-none">
                  <option value="">Select budget</option>
                  {budgetRanges.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How did you hear about us? *</label>
                <select required name="source" value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent outline-none">
                  <option value="">Select source</option>
                  {sources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 6: Attachments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
                <FiUploadCloud />
              </div>
              <h3 className="text-lg font-bold text-gray-800">6. Attachments (Optional)</h3>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">Upload Current Process Document, Data Sheets, or Reference Images (Max 3 files).</p>
            
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-3">
                <FiUploadCloud className="text-xl text-[#10AFA5]" />
              </div>
              <p className="font-medium text-gray-800">Tap to upload files</p>
              <p className="text-xs text-gray-400 mt-1">Images, PDF, DOC, Excel</p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FiFileText className="text-[#10AFA5] flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                    </div>
                    <button type="button" onClick={() => removeFile(idx)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 pb-8">
            <button 
              type="submit" 
              disabled={isSubmitting || uploading}
              className="w-full bg-[#10AFA5] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#0c8e86] shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2"
            >
              {isSubmitting || uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {uploading ? 'Uploading Files...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <FiCheckCircle className="text-xl" />
                  Submit Enquiry — Our team will contact you within 24 hours
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
              <FiLock /> 100% Secure & Confidential
            </p>
          </div>
        </form>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default CrmEnquiry;
