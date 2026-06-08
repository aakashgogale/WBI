import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiFileText, FiBriefcase, FiUsers, FiSettings, 
  FiCalendar, FiShare2, FiHeart, FiLayout, FiImage, FiBox
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const DesignEnquiry = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Client Info
    fullName: '', companyName: '', email: '', phone: '', city: '',
    
    // Project Details
    designType: '', projectTitle: '', projectDescription: '', targetAudience: '', pagesCount: '',
    
    // Branding & Style
    hasLogo: '', hasBrandColors: '', designStyle: '', colorTheme: '', referenceWebsites: '', excludeDesignElements: '',
    
    // Content & Assets
    provideContent: '', provideImages: '', hasDesignFiles: '', needIcons: '',
    
    // Deliverables
    requiredFormat: [], responsiveDesign: '', interactivePrototype: '', developerHandoff: '',
    
    // Timeline & Budget
    expectedDeliveryDate: '', urgency: '', budgetRange: '', source: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Options
  const designTypes = ['Website UI Design (Figma / Adobe XD)', 'Landing Page Design', 'E-Commerce Store Design', 'Mobile App UI Design', 'Dashboard / Admin Panel Design', 'Redesign of Existing Website', 'Other'];
  const pagesCounts = ['1 – 3 pages', '4 – 8 pages', '9 – 15 pages', '15+ pages', 'Not sure'];
  const designStyles = ['Minimal & Clean', 'Bold & Modern', 'Corporate / Professional', 'Playful & Creative', 'Luxury / Premium', 'Dark Theme', 'E-Commerce / Product Focus', 'No preference — suggest me'];
  const formats = ['Figma File', 'Adobe XD', 'PSD (Photoshop)', 'HTML/CSS Conversion too', 'PDF Prototype', 'No preference'];
  const urgencies = ['ASAP', 'Within 1 Week', 'Within 2 Weeks', '1 Month', 'Flexible'];
  const budgets = ['Below ₹5,000', '₹5,000 – ₹15,000', '₹15,000 – ₹30,000', '₹30,000 – ₹75,000', 'Above ₹75,000', 'To be discussed'];
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
      if (!finalData.expectedDeliveryDate) delete finalData.expectedDeliveryDate;

      const res = await api.post('/public/design-enquiries', finalData);
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
          <p className="text-gray-600 mb-8">Our Senior UI/UX Designers will review your project details and contact you within 24 hours to discuss your vision.</p>
          <button onClick={() => navigate('/user')} className="w-full bg-[#10AFA5] text-white py-4 rounded-xl font-semibold hover:bg-[#0c8e86] transition-colors">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><FiArrowLeft className="text-xl" /></button>
          <h1 className="text-lg font-bold text-gray-800">UI/UX Design</h1>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><FiHeart className="text-xl" /></button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><FiShare2 className="text-xl" /></button>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex-1">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm"><FiLayout className="text-2xl text-[#10AFA5]" /></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Crafting Digital Experiences</h2>
            <p className="text-gray-600 text-sm max-w-sm">Stunning UI/UX Design that engages users and brings your digital products to life.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1: Client Info */}
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
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="WhatsApp / Phone *" />
              </div>
              <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="City / Location *" />
            </div>
          </div>

          {/* Section 2: Design Project Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><FiBriefcase /></div>
              <h3 className="text-lg font-bold">2. Design Project Details</h3>
            </div>
            <div className="space-y-4">
              <select required name="designType" value={formData.designType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Design Type *</option>
                {designTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input required type="text" name="projectTitle" value={formData.projectTitle} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Project Title / Name *" />
              <textarea required name="projectDescription" value={formData.projectDescription} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Project Description — What is this design for? *"></textarea>
              <textarea required name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Target Audience — Who will use this? *"></textarea>
              <select required name="pagesCount" value={formData.pagesCount} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Number of Pages / Screens to Design *</option>
                {pagesCounts.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Section 3: Branding & Style */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><FiImage /></div>
              <h3 className="text-lg font-bold">3. Branding & Style</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Do you have a logo? *</label>
                  <select required name="hasLogo" value={formData.hasLogo} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Need logo design too">Need logo design too</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Have brand colors & fonts? *</label>
                  <select required name="hasBrandColors" value={formData.hasBrandColors} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>
              <select required name="designStyle" value={formData.designStyle} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Design Style Preference *</option>
                {designStyles.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="text" name="colorTheme" value={formData.colorTheme} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Color Theme Preference (e.g. blue & white, earthy tones)" />
              <input type="text" name="referenceWebsites" value={formData.referenceWebsites} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Reference Websites / Apps you like (Optional)" />
              <input type="text" name="excludeDesignElements" value={formData.excludeDesignElements} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="What do you NOT want in the design? (Optional)" />
            </div>
          </div>

          {/* Section 4: Content & Assets */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><FiFileText /></div>
              <h3 className="text-lg font-bold">4. Content & Assets</h3>
            </div>
            <div className="space-y-4">
              <select required name="provideContent" value={formData.provideContent} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Will you provide content (text / copy)? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Need content writing too">Need content writing too</option>
              </select>
              <select required name="provideImages" value={formData.provideImages} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Will you provide images / photos? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Need stock images">Need stock images</option>
              </select>
              <select required name="hasDesignFiles" value={formData.hasDesignFiles} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Do you have existing design files? *</option>
                <option value="Yes — Figma/PSD/XD">Yes — Figma/PSD/XD</option>
                <option value="No">No</option>
              </select>
              <select required name="needIcons" value={formData.needIcons} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Do you need icons / illustrations? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
          </div>

          {/* Section 5: Deliverables */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600"><FiBox /></div>
              <h3 className="text-lg font-bold">5. Deliverables</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Required Design Format (Select multiple)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {formats.map(s => (
                    <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.requiredFormat.includes(s) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={formData.requiredFormat.includes(s)} onChange={() => toggleArrayItem('requiredFormat', s)} className="w-4 h-4 text-[#10AFA5] rounded focus:ring-[#10AFA5]" />
                      <span className={`ml-3 text-sm ${formData.requiredFormat.includes(s) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Responsive Design Needed? *</label>
                  <select required name="responsiveDesign" value={formData.responsiveDesign} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Desktop only">Desktop only</option>
                    <option value="Mobile only">Mobile only</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Interactive Prototype? *</label>
                  <select required name="interactivePrototype" value={formData.interactivePrototype} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Design Handoff for Developer? *</label>
                <select required name="developerHandoff" value={formData.developerHandoff} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 6: Timeline & Budget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600"><FiCalendar /></div>
              <h3 className="text-lg font-bold">6. Timeline & Budget</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Expected Delivery Date (Optional)</label>
                  <input type="date" name="expectedDeliveryDate" value={formData.expectedDeliveryDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Urgency *</label>
                  <select required name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select Urgency</option>
                    {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <select required name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Budget Range *</option>
                {budgets.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select required name="source" value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">How did you hear about us? *</option>
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Section 7: Attachments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><FiUploadCloud /></div>
              <h3 className="text-lg font-bold">7. Attachments (Optional)</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Upload Logo / Brand Assets, Reference Screenshots, Design Files, or Content Documents.</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative" onClick={() => document.getElementById('file-upload').click()}>
              <FiUploadCloud className="mx-auto text-3xl text-[#10AFA5] mb-2" />
              <p className="text-sm text-gray-600">Tap to upload files (Max 5)</p>
              <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex items-center text-sm text-gray-700 truncate"><FiFileText className="mr-2 text-[#10AFA5]" /> {file.name}</div>
                    <button type="button" onClick={() => removeFile(index)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"><FiX /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 pb-8">
            <button type="submit" disabled={isSubmitting || uploading} className="w-full bg-[#10AFA5] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#0c8e86] shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2">
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
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default DesignEnquiry;
