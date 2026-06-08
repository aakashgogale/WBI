import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiFileText, FiBriefcase, FiUsers, FiSettings, 
  FiTarget, FiCalendar, FiDollarSign, FiShare2, FiHeart, FiImage
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const MarketingEnquiry = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Client Info
    fullName: '', companyName: '', email: '', phone: '', city: '',
    
    // Business Profile
    businessType: '', industry: '', currentOnlinePresence: [], 
    currentMonthlyMarketingBudget: '', primaryGoal: '',
    
    // Services Required
    servicesNeeded: [], targetLocation: '', specificCities: '', targetAudience: '',
    
    // Content & Branding
    hasExistingCreatives: '', hasBrandGuidelines: '', contentLanguage: [], postingFrequency: '',
    
    // Timeline & Budget
    urgency: '', contractDuration: '', budgetRange: '', source: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Options based on user requirements
  const businessTypes = ['Local Business', 'E-Commerce / Online Store', 'Personal Brand / Creator', 'Startup', 'Corporate / Enterprise', 'NGO / Non-Profit', 'Other'];
  const industries = ['Fashion & Lifestyle', 'Food & Restaurant', 'Real Estate', 'Education / Coaching', 'Healthcare / Wellness', 'Finance / Insurance', 'Travel & Hospitality', 'Technology / Software', 'Retail / Products', 'Other'];
  const onlinePresences = ['Website', 'Instagram', 'Facebook', 'YouTube', 'LinkedIn', 'Google Business Profile', 'None yet'];
  const currentBudgets = ['No budget yet', 'Below ₹10,000/month', '₹10,000 – ₹30,000/month', '₹30,000 – ₹1,00,000/month', 'Above ₹1,00,000/month'];
  const primaryGoals = ['Brand Awareness', 'Generate Leads', 'Increase Sales / Revenue', 'Grow Social Media Following', 'Website Traffic', 'App Downloads', 'All of the Above'];
  
  const servicesList = [
    'Social Media Management (Instagram / Facebook)', 'Social Media Ads (Meta Ads)', 
    'Google Ads / PPC Campaign', 'Search Engine Optimization (SEO)', 
    'Content Creation (Reels / Posts / Graphics)', 'Email Marketing', 
    'WhatsApp Marketing', 'YouTube Marketing / Video Promotion', 
    'Influencer Marketing', 'Performance Marketing', 
    'LinkedIn Marketing', 'Brand Strategy & Consulting'
  ];
  const targetLocations = ['Local City Only', 'State Level', 'Pan India', 'International', 'Specific Cities'];
  
  const languages = ['English', 'Hindi', 'Hinglish', 'Regional Language'];
  const postingFrequencies = ['Daily', '3–4 times a week', 'Weekly', 'As needed', 'Flexible'];

  const urgencies = ['Immediately', 'Within 2 Weeks', 'Next Month', 'Flexible'];
  const contractDurations = ['1 Month Trial', '3 Months', '6 Months', '1 Year', 'Project Basis'];
  const agencyBudgets = ['Below ₹10,000/month', '₹10,000 – ₹25,000/month', '₹25,000 – ₹50,000/month', '₹50,000 – ₹1,00,000/month', 'Above ₹1,00,000/month', 'To be discussed'];
  const sources = ['Social Media', 'Referral', 'Google', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const exists = prev[field].includes(item);
      if (exists) return { ...prev, [field]: prev[field].filter(i => i !== item) };
      return { ...prev, [field]: [...prev[field], item] };
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        toast.error('Maximum 5 files allowed');
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

  const uploadFiles = async () => {
    if (files.length === 0) return [];
    setUploading(true);
    const uploadedUrls = [];
    try {
      for (const file of files) {
        const fileData = new FormData();
        fileData.append('file', file);
        const res = await api.post('/upload-file', fileData, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (res.data.success) uploadedUrls.push({ url: res.data.imageUrl, filename: file.name });
      }
    } catch (error) {
      toast.error('Failed to upload some attachments.');
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
      const finalData = { ...formData, attachments: attachmentUrls };
      const res = await api.post('/public/marketing-enquiries', finalData);
      if (res.data.success) {
        setSuccess(true);
        toast.success('Enquiry submitted successfully!');
        window.scrollTo(0, 0);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
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
          <p className="text-gray-600 mb-8">Our Digital Marketing experts will review your details and contact you within 24 hours to discuss growth strategies.</p>
          <button onClick={() => navigate('/user')} className="w-full bg-[#10AFA5] text-white py-4 rounded-xl font-semibold hover:bg-[#0c8e86]">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 rounded-full"><FiArrowLeft className="text-xl" /></button>
          <h1 className="text-lg font-bold text-gray-800">Digital Marketing</h1>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-600 rounded-full"><FiHeart className="text-xl" /></button>
            <button className="p-2 text-gray-600 rounded-full"><FiShare2 className="text-xl" /></button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex-1">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4"><FiTarget className="text-2xl text-[#10AFA5]" /></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Grow Your Brand</h2>
            <p className="text-gray-600 text-sm max-w-sm">Data-driven marketing strategies to increase reach, engagement, and sales.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1: Client Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><FiUsers /></div>
              <h3 className="text-lg font-bold">1. Client Info</h3>
            </div>
            <div className="space-y-4">
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Full Name *" />
              <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Business / Company Name" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Email *" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Phone *" />
              </div>
              <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="City / Location *" />
            </div>
          </div>

          {/* Section 2: Business & Marketing Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><FiBriefcase /></div>
              <h3 className="text-lg font-bold">2. Business & Marketing Details</h3>
            </div>
            <div className="space-y-6">
              <select required name="businessType" value={formData.businessType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Business Type *</option>
                {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select required name="industry" value={formData.industry} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Industry / Niche *</option>
                {industries.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              
              <div>
                <label className="block text-sm font-medium mb-3">Current Online Presence (Select multiple)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {onlinePresences.map(s => (
                    <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.currentOnlinePresence.includes(s) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={formData.currentOnlinePresence.includes(s)} onChange={() => toggleArrayItem('currentOnlinePresence', s)} className="w-4 h-4 text-[#10AFA5] rounded focus:ring-[#10AFA5]" />
                      <span className={`ml-3 text-sm ${formData.currentOnlinePresence.includes(s) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <select required name="currentMonthlyMarketingBudget" value={formData.currentMonthlyMarketingBudget} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Current Monthly Marketing Budget *</option>
                {currentBudgets.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select required name="primaryGoal" value={formData.primaryGoal} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Main Marketing Goal *</option>
                {primaryGoals.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Section 3: Services Required */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><FiSettings /></div>
              <h3 className="text-lg font-bold">3. Services Required</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Digital Marketing Services Needed (Select multiple)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {servicesList.map(s => (
                    <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.servicesNeeded.includes(s) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={formData.servicesNeeded.includes(s)} onChange={() => toggleArrayItem('servicesNeeded', s)} className="w-4 h-4 text-[#10AFA5] rounded focus:ring-[#10AFA5]" />
                      <span className={`ml-3 text-sm ${formData.servicesNeeded.includes(s) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <select required name="targetLocation" value={formData.targetLocation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Target Location for Marketing *</option>
                {targetLocations.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {formData.targetLocation === 'Specific Cities' && (
                <input required type="text" name="specificCities" value={formData.specificCities} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Enter Specific Cities *" />
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Target Audience Description *</label>
                <textarea required name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none h-24" placeholder="Age, gender, interests, etc."></textarea>
              </div>
            </div>
          </div>

          {/* Section 4: Content & Branding */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><FiImage /></div>
              <h3 className="text-lg font-bold">4. Content & Branding</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Existing Creatives?</label>
                  <select required name="hasExistingCreatives" value={formData.hasExistingCreatives} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Brand Guidelines?</label>
                  <select required name="hasBrandGuidelines" value={formData.hasBrandGuidelines} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Content Language Preference (Select multiple)</label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map(s => (
                    <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.contentLanguage.includes(s) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={formData.contentLanguage.includes(s)} onChange={() => toggleArrayItem('contentLanguage', s)} className="w-4 h-4 text-[#10AFA5] rounded focus:ring-[#10AFA5]" />
                      <span className={`ml-3 text-sm ${formData.contentLanguage.includes(s) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <select required name="postingFrequency" value={formData.postingFrequency} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Posting Frequency Expectation *</option>
                {postingFrequencies.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Section 5: Timeline & Budget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600"><FiCalendar /></div>
              <h3 className="text-lg font-bold">5. Timeline & Budget</h3>
            </div>
            <div className="space-y-4">
              <select required name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">When do you want to start? *</option>
                {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <select required name="contractDuration" value={formData.contractDuration} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Contract Duration *</option>
                {contractDurations.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <select required name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Monthly Budget for Agency Services *</option>
                {agencyBudgets.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select required name="source" value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">How did you hear about us? *</option>
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Section 6: Attachments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><FiUploadCloud /></div>
              <h3 className="text-lg font-bold">6. Attachments (Optional)</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Upload Logo / Brand Assets, Previous Campaign Reports, or Reference Ads you like.</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative" onClick={() => document.getElementById('file-upload').click()}>
              <FiUploadCloud className="mx-auto text-3xl text-[#10AFA5] mb-2" />
              <p className="text-sm text-gray-600">Tap to upload files (Max 5)</p>
              <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
                    <div className="flex items-center text-sm text-gray-700 truncate"><FiFileText className="mr-2 text-[#10AFA5]" /> {file.name}</div>
                    <button type="button" onClick={() => removeFile(index)} className="text-red-500 p-1"><FiX /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting || uploading} className="w-full bg-[#10AFA5] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#0c8e86] shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2">
            {isSubmitting || uploading ? 'Submitting...' : 'Submit Enquiry — Our team will contact you within 24 hours'}
          </button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default MarketingEnquiry;
