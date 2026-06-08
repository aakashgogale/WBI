import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiBox, FiSettings, FiTool, 
  FiCalendar, FiDollarSign, FiShare2, FiHeart, FiShield, FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const InstallationEnquiry = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Client Info
    fullName: '', companyName: '', email: '', phone: '', designation: '', city: '', siteAddress: '',
    
    // Site Details
    siteType: '', siteSize: '', numberOfFloors: '', isSiteOccupied: '', accessRestrictions: '',
    
    // Equipment Details
    equipmentType: [], totalDevices: '', equipmentBrand: '', equipmentPurchased: '', equipmentCondition: '',
    
    // Installation Requirements
    typeOfWork: [], cablingDone: '', powerSupplyAvailable: '', networkAvailable: '', civilWorkNeeded: '', installationHeight: '', installationLocation: '',
    
    // Dismantling Requirements
    removeOldEquipment: '', disposalPlan: '', multipleSites: '',
    
    // Visit & Timeline
    preferredVisitDate: '', preferredTimeSlot: '', siteContactName: '', siteContactNumber: '', expectedStartDate: '', urgency: '',
    
    // Budget & Additional
    budgetRange: '', needAmc: '', brandPreference: '', source: '', additionalNotes: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Options Options Options
  const siteTypes = ['Office / Corporate', 'Warehouse / Godown', 'Residential / Society', 'Hospital / Clinic', 'Bank / ATM', 'School / College', 'Retail Shop / Mall', 'Factory / Plant', 'Government / PSU', 'Other'];
  const siteSizes = ['Small — below 1,000 sq ft', 'Medium — 1,000 – 5,000 sq ft', 'Large — 5,000 – 20,000 sq ft', 'Very Large — 20,000+ sq ft', 'Not sure'];
  const equipmentTypes = ['CCTV Cameras', 'DVR / NVR System', 'Access Control System', 'Biometric / Attendance Machine', 'Boom Barrier / Flap Barrier', 'Fire Alarm Panel', 'Intrusion Alarm System', 'Video Door Phone', 'PA / Intercom System', 'Network / Structured Cabling', 'Other (specify)'];
  const typesOfWork = ['Fresh Installation (new setup)', 'Dismantling Only (remove old equipment)', 'Dismantling + Reinstallation (shift to new location)', 'Upgrade / Replacement (old out, new in)'];
  const disposalPlans = ['Client will keep it', 'Vendor to dispose', 'Reinstall at another location', 'Not applicable'];
  const timeSlots = ['Morning 9–12', 'Afternoon 12–4', 'Evening 4–7'];
  const urgencies = ['Emergency — within 24–48 hrs', 'Within 1 week', 'Within 2 weeks', 'Within 1 month', 'Flexible'];
  const budgets = ['Below ₹10,000', '₹10,000 – ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', 'Above ₹1,00,000', 'To be discussed'];

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
      if (!finalData.preferredVisitDate) delete finalData.preferredVisitDate;

      const res = await api.post('/public/installation-enquiries', finalData);
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

  const needsDismantling = formData.typeOfWork.some(t => t.includes('Dismantling') || t.includes('Replacement'));

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 pb-24">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-4xl text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enquiry Received!</h2>
          <p className="text-gray-600 mb-8">Our Security Operations Team will review your site requirements and contact you within 24 hours.</p>
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
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">Installation & Dismantle</h1>
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
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm"><FiShield className="text-2xl text-[#10AFA5]" /></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Professional Setup</h2>
            <p className="text-gray-600 text-sm max-w-sm">Expert installation and dismantling services for all your security systems.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1: Client Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><FiMapPin /></div>
              <h3 className="text-lg font-bold">1. Client Info</h3>
            </div>
            <div className="space-y-4">
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Full Name *" />
              <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Company / Organization Name" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Email Address *" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="WhatsApp / Phone *" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Designation (e.g. IT Head, Owner) *" />
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="City / Location *" />
              </div>
              <textarea required name="siteAddress" value={formData.siteAddress} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Complete Site Address *"></textarea>
            </div>
          </div>

          {/* Section 2: Site Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><FiBox /></div>
              <h3 className="text-lg font-bold">2. Site Details</h3>
            </div>
            <div className="space-y-4">
              <select required name="siteType" value={formData.siteType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Site Type *</option>
                {siteTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select required name="siteSize" value={formData.siteSize} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">Site Size / Area *</option>
                {siteSizes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Floors *</label>
                  <input required type="number" min="1" name="numberOfFloors" value={formData.numberOfFloors} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="e.g. 3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Is site currently occupied? *</label>
                  <select required name="isSiteOccupied" value={formData.isSiteOccupied} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <input required type="text" name="accessRestrictions" value={formData.accessRestrictions} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Any access restrictions at site? (Yes / No) *" />
            </div>
          </div>

          {/* Section 3: Equipment Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><FiSettings /></div>
              <h3 className="text-lg font-bold">3. Equipment Details</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Type of Equipment (Select multiple)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {equipmentTypes.map(s => (
                    <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.equipmentType.includes(s) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={formData.equipmentType.includes(s)} onChange={() => toggleArrayItem('equipmentType', s)} className="w-4 h-4 text-[#10AFA5] rounded focus:ring-[#10AFA5]" />
                      <span className={`ml-3 text-sm ${formData.equipmentType.includes(s) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Total Number of Devices *</label>
                  <input required type="number" min="1" name="totalDevices" value={formData.totalDevices} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Total Units" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Equipment Brand (Optional)</label>
                  <input type="text" name="equipmentBrand" value={formData.equipmentBrand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="e.g. Hikvision, CP Plus" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Is equipment already purchased? *</label>
                <select required name="equipmentPurchased" value={formData.equipmentPurchased} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Need vendor to supply">Need vendor to supply</option>
                </select>
              </div>

              {formData.equipmentPurchased === 'Yes' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Equipment Condition</label>
                  <select name="equipmentCondition" value={formData.equipmentCondition} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select Condition</option>
                    <option value="Brand new / unboxed">Brand new / unboxed</option>
                    <option value="Used / existing">Used / existing</option>
                    <option value="Mix of both">Mix of both</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Installation Requirements */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><FiTool /></div>
              <h3 className="text-lg font-bold">4. Installation Requirements</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Type of Work (Select multiple)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {typesOfWork.map(s => (
                    <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.typeOfWork.includes(s) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={formData.typeOfWork.includes(s)} onChange={() => toggleArrayItem('typeOfWork', s)} className="w-4 h-4 text-[#10AFA5] rounded focus:ring-[#10AFA5]" />
                      <span className={`ml-3 text-sm ${formData.typeOfWork.includes(s) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Is cabling/wiring done? *</label>
                  <select required name="cablingDone" value={formData.cablingDone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Power supply available? *</label>
                  <select required name="powerSupplyAvailable" value={formData.powerSupplyAvailable} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Network/Internet available? *</label>
                  <select required name="networkAvailable" value={formData.networkAvailable} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Civil work needed? *</label>
                  <select required name="civilWorkNeeded" value={formData.civilWorkNeeded} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Yes">Yes (drilling, conduits)</option>
                    <option value="No">No</option>
                    <option value="Not Sure">Not Sure</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Indoor / Outdoor? *</label>
                  <select required name="installationLocation" value={formData.installationLocation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select</option>
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Height of Install (Optional)</label>
                  <input type="text" name="installationHeight" value={formData.installationHeight} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="e.g. 10 ft" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Dismantling Requirements */}
          {needsDismantling && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600"><FiTrash2 /></div>
                <h3 className="text-lg font-bold">5. Dismantling Requirements</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Remove old equipment? *</label>
                    <select required name="removeOldEquipment" value={formData.removeOldEquipment} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Disposal Plan *</label>
                    <select required name="disposalPlan" value={formData.disposalPlan} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                      <option value="">Select Plan</option>
                      {disposalPlans.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <input type="text" name="multipleSites" value={formData.multipleSites} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Multiple sites for dismantling? (Yes — how many / No)" />
              </div>
            </div>
          )}

          {/* Section 6: Visit & Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600"><FiCalendar /></div>
              <h3 className="text-lg font-bold">{needsDismantling ? '6' : '5'}. Visit & Timeline</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Site Visit Date (Optional)</label>
                  <input type="date" name="preferredVisitDate" value={formData.preferredVisitDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Time Slot *</label>
                  <select required name="preferredTimeSlot" value={formData.preferredTimeSlot} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                    <option value="">Select Slot</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="siteContactName" value={formData.siteContactName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Site Contact Person (If diff)" />
                <input type="tel" name="siteContactNumber" value={formData.siteContactNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Site Contact Phone" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="expectedStartDate" value={formData.expectedStartDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Expected Start Date *" />
                <select required name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                  <option value="">Project Urgency *</option>
                  {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 7: Budget & Additional Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600"><FiDollarSign /></div>
              <h3 className="text-lg font-bold">{needsDismantling ? '7' : '6'}. Budget & Additional</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select required name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                  <option value="">Budget Range *</option>
                  {budgets.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select required name="needAmc" value={formData.needAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                  <option value="">Need AMC after install? *</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Want to discuss">Want to discuss</option>
                </select>
              </div>
              <input type="text" name="brandPreference" value={formData.brandPreference} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Any specific brand preference? (Optional)" />
              <select required name="source" value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none">
                <option value="">How did you hear about us? *</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Google">Google</option>
                <option value="Other">Other</option>
              </select>
              <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] focus:border-transparent transition-all outline-none" placeholder="Additional Notes / Special Requirements (Optional)"></textarea>
            </div>
          </div>

          {/* Section 8: Attachments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><FiUploadCloud /></div>
              <h3 className="text-lg font-bold">{needsDismantling ? '8' : '7'}. Attachments (Optional)</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Upload Site Photos, Layout Plans, Existing System Details, or any reference document.</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors relative" onClick={() => document.getElementById('file-upload').click()}>
              <FiUploadCloud className="mx-auto text-3xl text-[#10AFA5] mb-2" />
              <p className="text-sm text-gray-600">Tap to upload files (Max 5)</p>
              <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex items-center text-sm text-gray-700 truncate"><FiUploadCloud className="mr-2 text-[#10AFA5]" /> {file.name}</div>
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
                  Submit Enquiry — Our team will reach out within 24 hours
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

export default InstallationEnquiry;
