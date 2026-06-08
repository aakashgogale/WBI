import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiBox, FiSettings, FiTool, FiActivity,
  FiCalendar, FiDollarSign, FiShare2, FiHeart, FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const MaintenanceEnquiry = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Client Info
    fullName: '', companyName: '', email: '', phone: '', designation: '', city: '', siteAddress: '',
    
    // Site Details
    siteType: '', siteSize: '', numberOfFloors: '', numberOfLocations: '',
    
    // Equipment Details
    equipmentType: [], totalDevices: '', equipmentBrand: '', equipmentAge: '', equipmentWorkingStatus: '', installedByUs: '',
    
    // Maintenance History
    maintenanceDoneBefore: '', lastMaintenanceDate: '', lastMaintenanceBy: '', existingAmc: '', amcExpiryDate: '', currentAmcProvider: '', pendingIssues: '',
    
    // Maintenance Requirements
    maintenanceNeeded: [], maintenanceFrequency: '', detailedReportNeeded: '', sparePartsReplacement: '',
    
    // AMC Requirement
    lookingForAmc: '', amcTypePreferred: '', amcDurationPreferred: '', expectedVisits: '',
    
    // Visit & Timeline
    preferredVisitDate: '', preferredTimeSlot: '', siteContactName: '', siteContactNumber: '', accessRestrictions: '', bestDayForVisits: '',
    
    // Budget & Additional
    budgetOneTime: '', budgetAnnualAmc: '', source: '', additionalNotes: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Form Data Options
  const siteTypes = ['Office / Corporate', 'Warehouse / Godown', 'Residential / Society', 'Hospital / Clinic', 'Bank / ATM', 'School / College', 'Retail Shop / Mall', 'Factory / Plant', 'Government / PSU', 'Other'];
  const siteSizes = ['Small — below 1,000 sq ft', 'Medium — 1,000 – 5,000 sq ft', 'Large — 5,000 – 20,000 sq ft', 'Very Large — 20,000+ sq ft', 'Not sure'];
  const locations = ['Single Site', '2 – 5 Sites', '5 – 10 Sites', '10+ Sites'];
  const equipmentTypes = ['CCTV Cameras', 'DVR / NVR System', 'Access Control System', 'Biometric / Attendance Machine', 'Boom Barrier / Flap Barrier', 'Fire Alarm Panel', 'Intrusion Alarm System', 'Video Door Phone', 'PA / Intercom System', 'Network / Structured Cabling', 'Other (specify)'];
  const maintenanceTasks = ['Cleaning & Dusting of devices', 'Camera lens & housing check', 'DVR/NVR health check & backup test', 'Cable & connector inspection', 'Power supply & battery check', 'Software / firmware update', 'Access control database backup', 'Sensor & detector testing', 'Full system health report', 'Not sure — need expert assessment'];
  const timeSlots = ['Morning 9–12', 'Afternoon 12–4', 'Evening 4–7'];

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
      if (!finalData.lastMaintenanceDate) delete finalData.lastMaintenanceDate;
      if (!finalData.amcExpiryDate) delete finalData.amcExpiryDate;

      const res = await api.post('/public/maintenance-enquiries', finalData);
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
          <p className="text-gray-600 mb-8">Our Maintenance Engineers will review your request and get back to you within 24 hours.</p>
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
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">Preventive Maintenance</h1>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><FiShare2 className="text-xl" /></button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><FiActivity className="text-2xl text-[#10AFA5]" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">System Health Check</h2>
            <p className="text-gray-600 text-sm">Keep your security systems running flawlessly.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiMapPin className="text-blue-500" /> 1. Client Info</h3>
            <div className="space-y-4">
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Full Name *" />
              <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Company / Organization Name" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Email Address *" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Phone Number *" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Designation / Role *" />
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="City / Location *" />
              </div>
              <textarea required name="siteAddress" value={formData.siteAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Complete Site Address *"></textarea>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiBox className="text-purple-500" /> 2. Site Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="siteType" value={formData.siteType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Site Type *</option>
                {siteTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select required name="siteSize" value={formData.siteSize} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Site Size *</option>
                {siteSizes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input required type="number" min="1" name="numberOfFloors" value={formData.numberOfFloors} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Number of Floors *" />
              <select required name="numberOfLocations" value={formData.numberOfLocations} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Locations / Branches *</option>
                {locations.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiSettings className="text-orange-500" /> 3. Equipment Details</h3>
            <label className="block text-sm font-medium mb-2">Type of Equipment *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {equipmentTypes.map(s => (
                <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.equipmentType.includes(s) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={formData.equipmentType.includes(s)} onChange={() => toggleArrayItem('equipmentType', s)} className="w-4 h-4 text-[#10AFA5] rounded" />
                  <span className={`ml-3 text-sm ${formData.equipmentType.includes(s) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{s}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="number" name="totalDevices" value={formData.totalDevices} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Total Devices *" />
              <input type="text" name="equipmentBrand" value={formData.equipmentBrand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Brand / Make" />
              <select required name="equipmentAge" value={formData.equipmentAge} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Equipment Age *</option>
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1 – 3 years">1 – 3 years</option>
                <option value="3 – 5 years">3 – 5 years</option>
                <option value="More than 5 years">More than 5 years</option>
                <option value="Not sure">Not sure</option>
              </select>
              <select required name="equipmentWorkingStatus" value={formData.equipmentWorkingStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Working Status? *</option>
                <option value="Yes — fully working">Yes — fully working</option>
                <option value="Partial — some issues">Partial — some issues</option>
                <option value="No — not working properly">No — not working properly</option>
              </select>
              <select required name="installedByUs" value={formData.installedByUs} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Installed by WBI? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiCalendar className="text-indigo-500" /> 4. Maintenance History</h3>
            <div className="space-y-4">
              <select required name="maintenanceDoneBefore" value={formData.maintenanceDoneBefore} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Has maintenance been done before? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              
              {formData.maintenanceDoneBefore === 'Yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Last Maintenance Date</label>
                    <input type="date" name="lastMaintenanceDate" value={formData.lastMaintenanceDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Last Maintenance By</label>
                    <select name="lastMaintenanceBy" value={formData.lastMaintenanceBy} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                      <option value="">Select Vendor Type</option>
                      <option value="Same vendor">Same vendor</option>
                      <option value="Different vendor">Different vendor</option>
                      <option value="In-house team">In-house team</option>
                    </select>
                  </div>
                </div>
              )}

              <select required name="existingAmc" value={formData.existingAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Existing AMC / Service Contract? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>

              {formData.existingAmc === 'Yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Contract Expiry Date</label>
                    <input type="date" name="amcExpiryDate" value={formData.amcExpiryDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Current AMC Provider</label>
                    <input type="text" name="currentAmcProvider" value={formData.currentAmcProvider} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Provider Name" />
                  </div>
                </div>
              )}
              
              <input type="text" name="pendingIssues" value={formData.pendingIssues} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Any pending issues / complaints right now?" />
            </div>
          </div>

          {/* Section 5 & 6 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiTool className="text-red-500" /> 5. Maintenance Requirements & AMC</h3>
            
            <label className="block text-sm font-medium mb-2">Type of Maintenance Needed</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {maintenanceTasks.map(s => (
                <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.maintenanceNeeded.includes(s) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={formData.maintenanceNeeded.includes(s)} onChange={() => toggleArrayItem('maintenanceNeeded', s)} className="w-4 h-4 text-[#10AFA5] rounded" />
                  <span className={`ml-3 text-sm ${formData.maintenanceNeeded.includes(s) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{s}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select required name="maintenanceFrequency" value={formData.maintenanceFrequency} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Maintenance Frequency Required *</option>
                <option value="One-time visit only">One-time visit only</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly (every 3 months)">Quarterly</option>
                <option value="Half-Yearly (every 6 months)">Half-Yearly</option>
                <option value="Yearly">Yearly</option>
                <option value="As per AMC schedule">As per AMC schedule</option>
              </select>
              <select required name="sparePartsReplacement" value={formData.sparePartsReplacement} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Need spare parts replacement if faulty? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Depends on cost">Depends on cost</option>
              </select>
            </div>
            
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
              <select required name="lookingForAmc" value={formData.lookingForAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Looking for an AMC contract? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Want to discuss">Want to discuss</option>
              </select>

              {formData.lookingForAmc === 'Yes' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                  <select name="amcTypePreferred" value={formData.amcTypePreferred} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                    <option value="">AMC Type</option>
                    <option value="Comprehensive AMC (parts + labour)">Comprehensive (parts + labour)</option>
                    <option value="Non-Comprehensive AMC (labour only)">Non-Comprehensive (labour only)</option>
                    <option value="Not sure — need guidance">Not sure</option>
                  </select>
                  <select name="amcDurationPreferred" value={formData.amcDurationPreferred} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                    <option value="">AMC Duration</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                    <option value="3 Years">3 Years</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                  <select name="expectedVisits" value={formData.expectedVisits} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                    <option value="">Visits Expected</option>
                    <option value="1 visit">1 visit</option>
                    <option value="2 visits">2 visits</option>
                    <option value="4 visits (quarterly)">4 visits (quarterly)</option>
                    <option value="6 visits (bi-monthly)">6 visits (bi-monthly)</option>
                    <option value="12 visits (monthly)">12 visits (monthly)</option>
                    <option value="As needed / on-call">As needed / on-call</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 7 & 8 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiDollarSign className="text-green-500" /> 7. Visit & Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Preferred Visit Date</label>
                <input type="date" name="preferredVisitDate" value={formData.preferredVisitDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Time Slot *</label>
                <select required name="preferredTimeSlot" value={formData.preferredTimeSlot} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                  <option value="">Select Time Slot</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <input required type="text" name="accessRestrictions" value={formData.accessRestrictions} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Access Restrictions? (Yes/No) *" />
              <select required name="bestDayForVisits" value={formData.bestDayForVisits} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Best day for regular visits *</option>
                <option value="Weekdays only">Weekdays only</option>
                <option value="Weekends only">Weekends only</option>
                <option value="Any day">Any day</option>
                <option value="As scheduled">As scheduled</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <select required name="budgetOneTime" value={formData.budgetOneTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Budget (One-Time Visit) *</option>
                <option value="Below ₹2,000">Below ₹2,000</option>
                <option value="₹2,000 – ₹5,000">₹2,000 – ₹5,000</option>
                <option value="₹5,000 – ₹10,000">₹5,000 – ₹10,000</option>
                <option value="Above ₹10,000">Above ₹10,000</option>
                <option value="To be discussed">To be discussed</option>
              </select>
              <select required name="budgetAnnualAmc" value={formData.budgetAnnualAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Annual AMC Budget *</option>
                <option value="Below ₹10,000">Below ₹10,000</option>
                <option value="₹10,000 – ₹25,000">₹10,000 – ₹25,000</option>
                <option value="₹25,000 – ₹50,000">₹25,000 – ₹50,000</option>
                <option value="₹50,000 – ₹1,00,000">₹50,000 – ₹1,00,000</option>
                <option value="Above ₹1,00,000">Above ₹1,00,000</option>
                <option value="To be discussed">To be discussed</option>
              </select>
              <select required name="source" value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">How did you hear about us? *</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Google">Google</option>
                <option value="Other">Other</option>
              </select>
              <select required name="detailedReportNeeded" value={formData.detailedReportNeeded} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Need detailed service report? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="2" className="w-full mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Additional Notes / Special Requirements"></textarea>
          </div>

          {/* Section 9: Attachments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><FiUploadCloud className="text-gray-500" /> Attachments (Optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Photos, existing AMC contracts, previous service reports.</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => document.getElementById('file-upload').click()}>
              <FiUploadCloud className="mx-auto text-3xl text-[#10AFA5] mb-2" />
              <p className="text-sm text-gray-600">Tap to upload files (Max 5)</p>
              <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== index))} className="text-red-500 p-1"><FiX /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 pb-8">
            <button type="submit" disabled={isSubmitting || uploading} className="w-full bg-[#10AFA5] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#0c8e86] shadow-lg shadow-teal-500/30 transition-all flex justify-center items-center gap-2">
              {isSubmitting || uploading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {uploading ? 'Uploading...' : 'Submitting...'}</>
              ) : (
                <><FiCheckCircle className="text-xl" /> Submit Enquiry</>
              )}
            </button>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default MaintenanceEnquiry;
