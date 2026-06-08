import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronLeft, FiUser, FiBriefcase, FiMail, FiPhone, FiMapPin,
  FiLayout, FiFileText, FiTarget, FiCheckSquare, FiCode,
  FiSmartphone, FiServer, FiSettings, FiImage, FiCalendar, 
  FiDollarSign, FiUploadCloud, FiCheckCircle, FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const AppDevelopmentEnquiry = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Section 1
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    city: '',
    // Section 2
    appType: 'Android App',
    appCategory: 'E-Commerce / Shopping',
    appName: '',
    description: '',
    problemSolved: '',
    targetAudience: '',
    // Section 3
    coreFeatures: [],
    needBackend: 'Not Sure',
    needAdminPanel: 'No',
    existingSystemIntegration: '',
    // Section 4
    hasDesignReady: 'No',
    hasBrandingReady: 'No',
    designStylePreference: 'Minimal & Clean',
    referenceApps: '',
    // Section 5
    preferredTech: 'No Preference',
    preferredBackend: 'No Preference',
    needPublishingHelp: 'Yes',
    // Section 6
    expectedLaunchDate: '',
    projectUrgency: 'Within 1 Month',
    budgetRange: '₹50,000 – ₹1,00,000',
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
      const exists = prev.coreFeatures.includes(feature);
      return {
        ...prev,
        coreFeatures: exists 
          ? prev.coreFeatures.filter(f => f !== feature)
          : [...prev.coreFeatures, feature]
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
        const fileData = new FormData();
        fileData.append('file', file);
        
        // Use the new generic file upload route
        const res = await api.post('/upload-file', fileData, {
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
      toast.error(error.response?.data?.message || error.message || 'Failed to upload some attachments.');
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

      if (!finalData.expectedLaunchDate) {
        delete finalData.expectedLaunchDate;
      }

      const res = await api.post('/public/app-enquiries', finalData);
      
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
    'User Registration / Login', 'Social Login (Google, Facebook)', 
    'User Profile Management', 'Admin Dashboard / Panel', 
    'Push Notifications', 'In-App Chat / Messaging', 
    'Payment Gateway Integration', 'Geolocation / Maps', 
    'Search & Filter', 'Camera / Image Upload', 
    'Video / Audio Streaming', 'QR Code Scanner', 
    'Offline Mode', 'Multi-language / Localization', 
    'Reviews & Ratings', 'Subscription / Membership Plans', 
    'Analytics & Reports', 'Third-Party API Integration', 'OTP / SMS Verification'
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
          <h1 className="text-[17px] font-bold text-[#0F172A]">App Development Enquiry</h1>
        </div>
      </header>

      <div className="px-4 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#10AFA5] to-[#0A8D84] rounded-3xl p-6 text-white mb-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-2">Turn Your Idea into an App!</h2>
          <p className="text-sm text-teal-50 opacity-90 leading-relaxed">
            Fill out this form to help us understand your mobile app vision. Our expert team will review your requirements and get back to you with a custom proposal.
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
                <FiSmartphone className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">2. App Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">App Type *</label>
                <select name="appType" value={formData.appType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                  <option value="Android App">Android App</option>
                  <option value="iOS App">iOS App</option>
                  <option value="Both (Android + iOS)">Both (Android + iOS)</option>
                  <option value="Cross-Platform App">Cross-Platform App</option>
                  <option value="Progressive Web App (PWA)">Progressive Web App (PWA)</option>
                  <option value="Hybrid App">Hybrid App</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">App Category *</label>
                <select name="appCategory" value={formData.appCategory} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                  {[
                    'E-Commerce / Shopping', 'Food Delivery / Restaurant', 'Healthcare / Medical',
                    'Education / E-Learning', 'Travel & Booking', 'Social Networking',
                    'Business / Productivity', 'Service-Based App', 'Fitness & Wellness',
                    'Finance / Payments', 'Entertainment / Media', 'Other'
                  ].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">App Name / Working Title</label>
                <input type="text" name="appName" value={formData.appName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all" placeholder="E.g., SwiftCart" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">App Idea / Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all resize-none" placeholder="Explain what the app does..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Problem it Solves</label>
                <textarea name="problemSolved" value={formData.problemSolved} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all resize-none" placeholder="What pain point does it address?" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Target Users / Audience</label>
                <textarea name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all resize-none" placeholder="Who will use this app?" />
              </div>
            </div>
          </section>

          {/* SECTION 3: Features Required */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiCheckSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">3. Features & Functionality</h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-3 block">Core Features Required</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {featuresList.map((feature, idx) => {
                    const isSelected = formData.coreFeatures.includes(feature);
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

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Do you need a Backend?</h4>
                  <p className="text-[10px] text-gray-500">Servers, databases, API</p>
                </div>
                <div className="flex gap-2">
                  {['Yes', 'No', 'Not Sure'].map(opt => (
                    <button key={opt} type="button" onClick={() => handleInputChange({ target: { name: 'needBackend', value: opt } })} className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${formData.needBackend === opt ? 'bg-[#10AFA5] text-white' : 'bg-gray-200 text-gray-600'}`}>{opt}</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Need Admin Web Panel?</h4>
                  <p className="text-[10px] text-gray-500">To manage app users/content</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleInputChange({ target: { name: 'needAdminPanel', value: 'Yes' } })} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.needAdminPanel === 'Yes' ? 'bg-[#10AFA5] text-white' : 'bg-gray-200 text-gray-600'}`}>Yes</button>
                  <button type="button" onClick={() => handleInputChange({ target: { name: 'needAdminPanel', value: 'No' } })} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.needAdminPanel === 'No' ? 'bg-[#10AFA5] text-white' : 'bg-gray-200 text-gray-600'}`}>No</button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Any existing system to integrate with?</label>
                <textarea name="existingSystemIntegration" value={formData.existingSystemIntegration} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all resize-none" placeholder="ERP, CRM, existing website, etc..." />
              </div>
            </div>
          </section>

          {/* SECTION 4: Design Preferences */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiImage className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">4. Design & Branding</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">Do you have UI/UX designs ready?</label>
                <div className="flex flex-wrap gap-2">
                  {['Yes', 'No', 'Need help with design'].map(opt => (
                    <button key={opt} type="button" onClick={() => handleInputChange({ target: { name: 'hasDesignReady', value: opt } })} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.hasDesignReady === opt ? 'bg-[#10AFA5] text-white shadow-md' : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}`}>{opt}</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Branding Ready?</h4>
                  <p className="text-[10px] text-gray-500">Logos, colors, fonts</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleInputChange({ target: { name: 'hasBrandingReady', value: 'Yes' } })} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.hasBrandingReady === 'Yes' ? 'bg-[#10AFA5] text-white' : 'bg-gray-200 text-gray-600'}`}>Yes</button>
                  <button type="button" onClick={() => handleInputChange({ target: { name: 'hasBrandingReady', value: 'No' } })} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.hasBrandingReady === 'No' ? 'bg-[#10AFA5] text-white' : 'bg-gray-200 text-gray-600'}`}>No</button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">App Design Style Preference</label>
                <select name="designStylePreference" value={formData.designStylePreference} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                  <option value="Minimal & Clean">Minimal & Clean</option>
                  <option value="Bold & Colorful">Bold & Colorful</option>
                  <option value="Corporate / Professional">Corporate / Professional</option>
                  <option value="Playful / Casual">Playful / Casual</option>
                  <option value="Dark Mode Preferred">Dark Mode Preferred</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Reference Apps you like</label>
                <textarea name="referenceApps" value={formData.referenceApps} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all resize-none" placeholder="Play Store / App Store links..." />
              </div>
            </div>
          </section>

          {/* SECTION 5: Technical Preferences */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiCode className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">5. Technical (Optional)</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Preferred Tech</label>
                  <select name="preferredTech" value={formData.preferredTech} onChange={handleInputChange} className="w-full px-3 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                    <option value="Flutter">Flutter</option>
                    <option value="React Native">React Native</option>
                    <option value="Native Android (Kotlin/Java)">Native Android</option>
                    <option value="Native iOS (Swift)">Native iOS</option>
                    <option value="No Preference">No Preference</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Preferred Backend</label>
                  <select name="preferredBackend" value={formData.preferredBackend} onChange={handleInputChange} className="w-full px-3 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                    <option value="Firebase">Firebase</option>
                    <option value="Node.js">Node.js</option>
                    <option value="PHP / Laravel">PHP / Laravel</option>
                    <option value="Python / Django">Python / Django</option>
                    <option value="No Preference">No Preference</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">App Store Publishing?</h4>
                  <p className="text-[10px] text-gray-500">Need help uploading to stores?</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleInputChange({ target: { name: 'needPublishingHelp', value: 'Yes' } })} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.needPublishingHelp === 'Yes' ? 'bg-[#10AFA5] text-white' : 'bg-gray-200 text-gray-600'}`}>Yes</button>
                  <button type="button" onClick={() => handleInputChange({ target: { name: 'needPublishingHelp', value: 'No' } })} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.needPublishingHelp === 'No' ? 'bg-[#10AFA5] text-white' : 'bg-gray-200 text-gray-600'}`}>No</button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: Timeline & Budget */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiDollarSign className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">6. Timeline & Budget</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Expected Launch Date</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="date" name="expectedLaunchDate" value={formData.expectedLaunchDate} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Project Urgency</label>
                  <select name="projectUrgency" value={formData.projectUrgency} onChange={handleInputChange} className="w-full px-3 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                    <option value="ASAP">ASAP</option>
                    <option value="Within 1 Month">Within 1 Month</option>
                    <option value="1–3 Months">1–3 Months</option>
                    <option value="3–6 Months">3–6 Months</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Budget Range</label>
                  <select name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className="w-full px-3 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                    <option value="Below ₹25,000">Below ₹25,000</option>
                    <option value="₹25,000 – ₹50,000">₹25,000 – ₹50,000</option>
                    <option value="₹50,000 – ₹1,00,000">₹50,000 – ₹1,00,000</option>
                    <option value="₹1,00,000 – ₹2,50,000">₹1,00,000 – ₹2,50,000</option>
                    <option value="₹2,50,000 – ₹5,00,000">₹2,50,000 – ₹5,00,000</option>
                    <option value="Above ₹5,00,000">Above ₹5,00,000</option>
                    <option value="To be discussed">To be discussed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">How did you hear about us?</label>
                <select name="source" value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10AFA5]/20 border border-transparent focus:border-[#10AFA5] transition-all text-gray-700">
                  <option value="Google">Google</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Referral">Referral</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 7: Attachments */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-50 pb-3">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F2] flex items-center justify-center text-[#10AFA5]">
                <FiUploadCloud className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">7. Attachments (Optional)</h3>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-3">Upload App Wireframes, Logos, or Requirement Documents (Max 3 files).</p>
              
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
                  <span>Submit Enquiry — Our team will contact you within 24 hours</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-500 mt-3 font-medium flex items-center justify-center gap-1">
              <FiInfo /> 100% Secure & Confidential
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppDevelopmentEnquiry;
