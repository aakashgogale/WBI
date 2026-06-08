import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiChevronLeft, FiUser, FiBriefcase, FiMail, FiPhone, FiMapPin,
  FiLayout, FiFileText, FiTarget, FiCheckSquare, FiCode,
  FiLink, FiImage, FiCalendar, FiDollarSign, FiUploadCloud,
  FiCheckCircle, FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const WebDevelopmentEnquiry = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    city: '',
    websiteType: 'Business Website',
    projectTitle: '',
    description: '',
    targetAudience: '',
    pagesNeeded: '1-5',
    featuresRequired: [],
    techPreference: '',
    hasExistingWebsite: 'No',
    existingWebsiteUrl: '',
    hasBrandingReady: 'No',
    designStylePreference: 'Bold & Modern',
    referenceWebsites: '',
    deadline: '',
    budgetRange: '₹25,000 – ₹50,000',
    source: 'Google',
    attachments: [] // Will store uploaded file URLs
  });

  const [files, setFiles] = useState([]); // Temporary local files

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => {
      const exists = prev.featuresRequired.includes(feature);
      return {
        ...prev,
        featuresRequired: exists 
          ? prev.featuresRequired.filter(f => f !== feature)
          : [...prev.featuresRequired, feature]
      };
    });
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
        
        // Use the new generic file upload route
        const res = await api.post('/upload-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
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

      const res = await api.post('/public/web-enquiries', finalData);
      
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

  const featuresList = [
    'User Login / Registration', 'Admin Panel', 'Payment Gateway', 
    'Contact Form', 'Live Chat', 'Booking/Scheduling', 
    'Product Listing', 'Blog / News Section', 'API Integration', 'Multi-language Support'
  ];

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
          <h1 className="text-[17px] font-bold text-[#0F172A]">Web Development Enquiry</h1>
        </div>
      </header>

      <div className="px-4 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#10AFA5] to-[#0A8D84] rounded-3xl p-6 text-white mb-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-2">Let's Build Something Great!</h2>
          <p className="text-sm text-teal-50 opacity-90 leading-relaxed">
            Fill out this form to help us understand your digital vision. Our expert team will review your requirements and get back to you with a custom proposal within 24 hours.
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
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Company / Business Name</label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="Acme Corp" />
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
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">City *</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="Indore" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Project Details */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiLayout className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">2. Project Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Website Type *</label>
                <select name="websiteType" value={formData.websiteType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                  <option value="Business Website">Business Website</option>
                  <option value="E-Commerce Store">E-Commerce Store</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Booking / Appointment App">Booking / Appointment App</option>
                  <option value="Service-Based App">Service-Based App</option>
                  <option value="Custom Web App">Custom Web App</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Project Title (Optional)</label>
                <input type="text" name="projectTitle" value={formData.projectTitle} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="E.g., NextGen E-Commerce" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Brief Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all resize-none" placeholder="Describe your project goals and what it does..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Target Audience</label>
                <textarea name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all resize-none" placeholder="Who will use your website/app?" />
              </div>
            </div>
          </section>

          {/* SECTION 3: Features Required */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiCheckSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">3. Features Required</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">Number of Pages</label>
                <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-100">
                  {['1-5', '5-10', '10+'].map(option => (
                    <button 
                      key={option} type="button"
                      onClick={() => handleInputChange({ target: { name: 'pagesNeeded', value: option } })}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${formData.pagesNeeded === option ? 'bg-white text-[#10AFA5] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-3 block">Key Features Needed</label>
                <div className="grid grid-cols-2 gap-3">
                  {featuresList.map((feature, idx) => {
                    const isSelected = formData.featuresRequired.includes(feature);
                    return (
                      <div 
                        key={idx}
                        onClick={() => handleFeatureToggle(feature)}
                        className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center border transition-colors shrink-0 ${isSelected ? 'bg-[#10AFA5] border-[#10AFA5]' : 'border-gray-300 bg-white'}`}>
                          {isSelected && <FiCheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-[11px] font-medium leading-tight ${isSelected ? 'text-[#10AFA5]' : 'text-gray-600'}`}>{feature}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Specific Tech Preference (Optional)</label>
                <div className="relative">
                  <FiCode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="techPreference" value={formData.techPreference} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="React, Node.js, WordPress, etc." />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Design Preferences */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiImage className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">4. Design Preferences</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Existing Website?</h4>
                  <p className="text-[10px] text-gray-500">Do you already have a live website?</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleInputChange({ target: { name: 'hasExistingWebsite', value: 'Yes' } })} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.hasExistingWebsite === 'Yes' ? 'bg-[#10AFA5] text-white' : 'bg-gray-200 text-gray-600'}`}>Yes</button>
                  <button type="button" onClick={() => handleInputChange({ target: { name: 'hasExistingWebsite', value: 'No' } })} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.hasExistingWebsite === 'No' ? 'bg-[#10AFA5] text-white' : 'bg-gray-200 text-gray-600'}`}>No</button>
                </div>
              </div>

              {formData.hasExistingWebsite === 'Yes' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
                  <div className="relative">
                    <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="url" name="existingWebsiteUrl" value={formData.existingWebsiteUrl} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="https://www.yourdomain.com" />
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Branding Ready?</h4>
                  <p className="text-[10px] text-gray-500">Logos, colors, typography</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleInputChange({ target: { name: 'hasBrandingReady', value: 'Yes' } })} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.hasBrandingReady === 'Yes' ? 'bg-[#10AFA5] text-white' : 'bg-gray-200 text-gray-600'}`}>Yes</button>
                  <button type="button" onClick={() => handleInputChange({ target: { name: 'hasBrandingReady', value: 'No' } })} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.hasBrandingReady === 'No' ? 'bg-[#10AFA5] text-white' : 'bg-gray-200 text-gray-600'}`}>No</button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Design Style</label>
                <select name="designStylePreference" value={formData.designStylePreference} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                  <option value="Minimal & Clean">Minimal & Clean</option>
                  <option value="Bold & Modern">Bold & Modern</option>
                  <option value="Corporate / Professional">Corporate / Professional</option>
                  <option value="Colorful & Creative">Colorful & Creative</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Reference Websites (Optional)</label>
                <textarea name="referenceWebsites" value={formData.referenceWebsites} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all resize-none" placeholder="Paste links of websites you like..." />
              </div>
            </div>
          </section>

          {/* SECTION 5: Timeline & Budget */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiDollarSign className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">5. Timeline & Budget</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Expected Launch Date</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Budget Range</label>
                <select name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                  <option value="Below ₹10,000">Below ₹10,000</option>
                  <option value="₹10,000 – ₹25,000">₹10,000 – ₹25,000</option>
                  <option value="₹25,000 – ₹50,000">₹25,000 – ₹50,000</option>
                  <option value="₹50,000 – ₹1,00,000">₹50,000 – ₹1,00,000</option>
                  <option value="Above ₹1,00,000">Above ₹1,00,000</option>
                  <option value="To be discussed">To be discussed</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 6: Attachments */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiUploadCloud className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">6. Attachments (Optional)</h3>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-3">Upload logos, reference images, or requirement documents (Max 3 files).</p>
              
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
                  <span>Submit Enquiry</span>
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

export default WebDevelopmentEnquiry;
