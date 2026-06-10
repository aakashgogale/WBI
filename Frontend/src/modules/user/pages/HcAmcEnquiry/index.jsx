import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiMaximize, FiTool, FiClock, FiFileText, FiShield, FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const HcAmcEnquiry = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '', organizationName: '', designation: '', email: '', phone: '', alternateContact: '', city: '', siteAddress: '',
    facilityType: '', facilitySize: '', departmentsCount: '', branchesCount: '', isAccredited: '', totalEquipmentCount: '',
    equipmentCategory: [], equipmentBrands: '', equipmentAgeRange: '', inventoryAvailable: '', equipmentNotWorking: '',
    amcTypeRequired: '', coverageRequired: [], responseTimeExpected: '', pmVisitsPerYear: '',
    haveExistingAmc: '', currentAmcProvider: '', amcExpiryDate: '', whySwitching: '', maintainedByOem: '', pendingBreakdowns: '', breakdownCallsLastYear: '',
    needNabhRecords: '', needCalibrationCertificates: '', needSafetyTestCertificates: '', needEquipmentHistory: '', needMisReports: '', needDedicatedEngineer: '',
    preferredAmcStartDate: '', amcDurationRequired: '', preAmcInspectionNeeded: '',
    annualAmcBudget: '', paymentPreference: '', howDidYouHear: '', additionalNotes: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
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
    if (formData.equipmentCategory.length === 0) {
      toast.error('Please select at least one equipment category');
      return;
    }
    if (formData.coverageRequired.length === 0) {
      toast.error('Please select at least one coverage requirement');
      return;
    }
    setIsSubmitting(true);
    try {
      const attachmentUrls = await uploadFiles();
      const finalData = { ...formData, attachments: attachmentUrls };

      const res = await api.post('/public/hcamc-enquiries', finalData);
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
          <div className="w-20 h-20 bg-[#E8F5F1] rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-4xl text-[#10AFA5]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Received!</h2>
          <p className="text-gray-600 mb-8">Our AMC team will contact you to discuss your contract requirements.</p>
          <button onClick={() => navigate('/user')} className="w-full bg-[#10AFA5] text-white py-4 rounded-xl font-semibold hover:bg-[#0c8e86] transition-colors">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><FiArrowLeft className="text-xl" /></button>
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">Annual Maintenance Contract</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><FiFileText className="text-2xl text-[#10AFA5]" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Annual Maintenance Contract</h2>
            <p className="text-gray-600 text-sm">Comprehensive AMC for all medical equipment.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8F5F1] p-6 border-l-4 border-l-[#10AFA5]">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiMapPin className="text-[#10AFA5]" /> 1. Client Info</h3>
            <div className="space-y-4">
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Full Name *" />
              <input required type="text" name="organizationName" value={formData.organizationName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Hospital / Clinic / Organization Name *" />
              <input required type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Designation *" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Email Address *" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Phone / WhatsApp *" />
              </div>
              <input type="tel" name="alternateContact" value={formData.alternateContact} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Alternate Contact Number" />
              <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="City / Location *" />
              <input required type="text" name="siteAddress" value={formData.siteAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Complete Facility Address *" />
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiShield className="text-[#10AFA5]" /> 2. Facility Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="facilityType" value={formData.facilityType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Facility Type *</option>
                {['Government Hospital', 'Private Hospital', 'Nursing Home', 'Diagnostic Center', 'Dental', 'Research Center', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select required name="facilitySize" value={formData.facilitySize} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Facility Size *</option>
                {['Below 20 beds', '20–100 beds', '100–300 beds', '300+ beds', 'No beds'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input required type="number" name="departmentsCount" value={formData.departmentsCount} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Number of Departments *" />
              <input required type="text" name="branchesCount" value={formData.branchesCount} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Number of Branches / Locations *" />
              <select required name="isAccredited" value={formData.isAccredited} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Is facility NABH / NABL accredited? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="In process">In process</option>
              </select>
              <input required type="number" name="totalEquipmentCount" value={formData.totalEquipmentCount} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Total number of medical equipment *" />
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiMaximize className="text-[#10AFA5]" /> 3. Equipment to be Covered Under AMC</h3>
            <p className="text-sm font-medium text-gray-700 mb-2">Equipment Category *</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {['All Medical Equipment', 'Diagnostic & Imaging', 'Life Support & Monitoring', 'OT Equipment', 'Laboratory Equipment', 'Sterilization', 'Ward Equipment', 'Other'].map(s => (
                <label key={s} className="flex items-start gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" value={s} checked={formData.equipmentCategory.includes(s)} onChange={(e) => handleCheckboxChange(e, 'equipmentCategory')} className="mt-1 text-[#10AFA5] focus:ring-[#10AFA5] rounded" />
                  <span className="text-sm text-gray-700">{s}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" name="equipmentBrands" value={formData.equipmentBrands} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Major Equipment Brands *" />
              <select required name="equipmentAgeRange" value={formData.equipmentAgeRange} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Equipment Age Range *</option>
                {['Mostly New (0-2 yrs)', 'Mixed (2-5 yrs)', 'Mostly Old (5+ yrs)', 'Various ages'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select required name="inventoryAvailable" value={formData.inventoryAvailable} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Is complete inventory list available? *</option>
                <option value="Yes">Yes</option>
                <option value="No - Needs assessment">No - Needs assessment</option>
              </select>
              <select required name="equipmentNotWorking" value={formData.equipmentNotWorking} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Any equipment currently NOT working? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiTool className="text-[#10AFA5]" /> 4. AMC Type & Coverage</h3>
            <select required name="amcTypeRequired" value={formData.amcTypeRequired} onChange={handleInputChange} className="w-full mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
              <option value="">AMC Type Required *</option>
              {['Comprehensive AMC (CAMC - Includes Spares)', 'Non-Comprehensive AMC (NAMC - Excludes Spares)', 'Labor Only AMC', 'Need suggestion / quote for both'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <p className="text-sm font-medium text-gray-700 mb-2">Coverage Required *</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {['Preventive Maintenance Visits', 'Unlimited Breakdown Calls', 'Calibration & Certification', 'Electrical Safety Testing', 'Software Updates', 'Resident / Dedicated Engineer on-site', 'Consumables management', '24x7 Support'].map(s => (
                <label key={s} className="flex items-start gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" value={s} checked={formData.coverageRequired.includes(s)} onChange={(e) => handleCheckboxChange(e, 'coverageRequired')} className="mt-1 text-[#10AFA5] focus:ring-[#10AFA5] rounded" />
                  <span className="text-sm text-gray-700">{s}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="responseTimeExpected" value={formData.responseTimeExpected} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Response Time Expected *</option>
                {['Within 4 hours', 'Same Day', 'Next Business Day', 'Within 48 hours'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select required name="pmVisitsPerYear" value={formData.pmVisitsPerYear} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Number of PM visits per year *</option>
                {['2 Visits', '3 Visits', '4 Visits (Quarterly)', 'Monthly', 'As per OEM guidelines'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiClock className="text-[#10AFA5]" /> 5. Current AMC Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="haveExistingAmc" value={formData.haveExistingAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Do you have an existing AMC? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {formData.haveExistingAmc === 'Yes' && (
                <>
                  <input type="text" name="currentAmcProvider" value={formData.currentAmcProvider} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Current AMC Provider Name" />
                  <input type="text" name="amcExpiryDate" value={formData.amcExpiryDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="AMC Expiry Date" />
                  <input type="text" name="whySwitching" value={formData.whySwitching} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Reason for switching" />
                </>
              )}
              <select required name="maintainedByOem" value={formData.maintainedByOem} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Was equipment maintained by OEM so far? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Mix of OEM & Third party">Mix of OEM & Third party</option>
              </select>
              <select required name="pendingBreakdowns" value={formData.pendingBreakdowns} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Any pending breakdown calls? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <input required type="text" name="breakdownCallsLastYear" value={formData.breakdownCallsLastYear} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Number of breakdown calls last year (approx) *" />
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiFileText className="text-[#10AFA5]" /> 6. Compliance & Documentation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="needNabhRecords" value={formData.needNabhRecords} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need NABH compliant records? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needCalibrationCertificates" value={formData.needCalibrationCertificates} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need calibration certificates? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needSafetyTestCertificates" value={formData.needSafetyTestCertificates} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need electrical safety test certificates? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needEquipmentHistory" value={formData.needEquipmentHistory} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need equipment-wise service history? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needMisReports" value={formData.needMisReports} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need MIS / Uptime reports? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needDedicatedEngineer" value={formData.needDedicatedEngineer} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need dedicated biomedical engineer on-site? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Section 7 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiClock className="text-[#10AFA5]" /> 7. AMC Duration & Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block px-1">Preferred AMC Start Date *</label>
                <input required type="date" name="preferredAmcStartDate" value={formData.preferredAmcStartDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" />
              </div>
              <select required name="amcDurationRequired" value={formData.amcDurationRequired} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none mt-5">
                <option value="">AMC Duration Required *</option>
                {['1 Year', '2 Years', '3 Years', '5 Years'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select required name="preAmcInspectionNeeded" value={formData.preAmcInspectionNeeded} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Pre-AMC inspection needed? *</option>
                <option value="Yes">Yes</option>
                <option value="No - quote based on list">No - quote based on list</option>
              </select>
            </div>
          </div>

          {/* Section 8 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiFileText className="text-[#10AFA5]" /> 8. Budget & Additional Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="annualAmcBudget" value={formData.annualAmcBudget} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Annual AMC Budget *</option>
                {['Below ₹50,000', '₹50,000 – ₹2 Lakhs', '₹2 Lakhs – ₹5 Lakhs', '₹5 Lakhs – ₹10 Lakhs', 'Above ₹10 Lakhs', 'To be discussed'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select required name="paymentPreference" value={formData.paymentPreference} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Payment Preference *</option>
                {['100% Advance', '50% Advance, 50% End of year', 'Quarterly Payments', 'To be discussed'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select required name="howDidYouHear" value={formData.howDidYouHear} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">How did you hear about us? *</option>
                {['Social Media', 'Referral', 'Google', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="2" className="w-full mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Additional Notes"></textarea>
          </div>

          {/* Section 9 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><FiUploadCloud className="text-[#10AFA5]" /> 9. Attachments (optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Upload Equipment Inventory, Existing AMC Contract, NABH Checklist.</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => document.getElementById('file-upload').click()}>
              <FiUploadCloud className="mx-auto text-3xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Tap to upload files (Max 5)</p>
              <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button type="button" onClick={() => removeFile(index)} className="text-red-500 p-1"><FiX /></button>
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

export default HcAmcEnquiry;
