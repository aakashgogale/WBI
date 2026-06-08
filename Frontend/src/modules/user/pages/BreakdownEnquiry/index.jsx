import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiAlertTriangle, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiBox, FiActivity, FiTool, FiClock, FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const BreakdownEnquiry = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Section 1
    fullName: '', companyName: '', email: '', phone: '', designation: '', alternateContact: '', city: '', siteAddress: '',
    // Section 2
    siteType: '', siteOperational: '', highSecurity: '', floorsAffected: '',
    // Section 3
    equipmentType: [], equipmentBrand: '', devicesAffectedCount: '', faultDescription: '', typeOfIssue: '', breakdownTime: '', beforeBreakdown: '', visibleDamage: '', powerSupplyStatus: '',
    // Section 4
    devicesAffectedCategory: '', systemDownStatus: '', affectingBusiness: '', securityRisk: '', riskDescription: '', happenedBefore: '',
    // Section 5
    existingAmc: '', amcProviderName: '', amcContractNumber: '', whyNotContactingAmc: '', installedByWbi: '', underWarranty: '', lastServiceDate: '',
    // Section 6
    urgency: '', preferredVisitDate: '', preferredTimeSlot: '', siteContactName: '', siteContactNumber: '', accessRestrictions: '', someoneAvailable: '',
    // Section 7
    expectedOutcome: '', okayWithSpareCost: '', needJobReport: '', needPhotographs: '',
    // Section 8
    expectedBudget: '', interestedInAmc: '', source: '', additionalNotes: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Dropdown options
  const siteTypes = ['Office / Corporate', 'Warehouse / Godown', 'Residential / Society', 'Hospital / Clinic', 'Bank / ATM', 'School / College', 'Retail Shop / Mall', 'Factory / Plant', 'Government / PSU', 'Other'];
  const equipmentTypes = ['CCTV Cameras', 'DVR / NVR System', 'Access Control System', 'Biometric / Attendance Machine', 'Boom Barrier / Flap Barrier', 'Fire Alarm Panel', 'Intrusion Alarm System', 'Video Door Phone', 'PA / Intercom System', 'Network / Cabling', 'Other (specify)'];
  const issueTypes = ['Device not turning on / no power', 'No video / blank screen', 'Device showing error / blinking', 'Physical damage (broken, fallen)', 'Network / connectivity issue', 'Software / firmware issue', 'Access denied / door not opening', 'Alarm not triggering / false alarm', 'Recording not working', 'Remote access not working', 'Multiple issues', 'Not sure — need diagnosis'];
  const breakdownTimes = ['Just now', 'Today', 'Yesterday', '2 – 3 days ago', 'More than a week ago'];
  const beforeBreakdowns = ['Sudden stop — no warning', 'Was showing errors before', 'After power cut / fluctuation', 'After rain / water damage', 'After physical damage / hit', 'After software update', 'Don\'t know'];
  const deviceCategories = ['1 device', '2 – 5 devices', '6 – 10 devices', 'Full system down'];
  const urgencies = ['Emergency — need engineer within 2–4 hours', 'Urgent — same day visit needed', 'High — within 24 hours', 'Normal — within 2–3 days', 'Flexible — schedule as available'];
  const expectedOutcomes = ['Repair existing equipment', 'Replace faulty parts only', 'Full replacement if needed', 'Just diagnosis / report first', 'Not sure — engineer to decide'];
  const expectedBudgets = ['Below ₹2,000', '₹2,000 – ₹5,000', '₹5,000 – ₹15,000', '₹15,000 – ₹30,000', 'Above ₹30,000', 'To be discussed on-site'];
  const timeSlots = ['Morning 9–12', 'Afternoon 12–4', 'Evening 4–7', 'Anytime'];

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
      if (!finalData.lastServiceDate) delete finalData.lastServiceDate;

      const res = await api.post('/public/breakdown-enquiries', finalData);
      if (res.data.success) {
        setSuccess(true);
        toast.success('Breakdown Enquiry submitted successfully!');
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
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-4xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Emergency Request Received!</h2>
          <p className="text-gray-600 mb-8">Our Breakdown Response Team has been alerted and will contact you within 1 hour.</p>
          <button onClick={() => navigate('/user')} className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 transition-colors">Back to Home</button>
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
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">Breakdown Calls</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#FFEBEB] to-[#FFD6D6] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><FiAlertTriangle className="text-2xl text-red-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Emergency Repair</h2>
            <p className="text-gray-600 text-sm">Fast response for critical security system breakdowns.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-50 p-6 border-l-4 border-l-red-500">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiMapPin className="text-red-500" /> 1. Client Info (Emergency Contact)</h3>
            <div className="space-y-4">
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Full Name *" />
              <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Company / Organization Name" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Email Address *" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Phone Number *" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Designation *" />
                <input required type="tel" name="alternateContact" value={formData.alternateContact} onChange={handleInputChange} className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Urgent Alternate Contact *" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="City / Location *" />
                <input required type="text" name="siteAddress" value={formData.siteAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Complete Site Address *" />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiBox className="text-purple-500" /> 2. Site Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="siteType" value={formData.siteType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Site Type *</option>
                {siteTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select required name="siteOperational" value={formData.siteOperational} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Is business currently running? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="highSecurity" value={formData.highSecurity} onChange={handleInputChange} className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl focus:ring-red-400 outline-none text-red-800">
                <option value="">Is this a high-security/critical site? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <input required type="number" min="1" name="floorsAffected" value={formData.floorsAffected} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Number of Floors Affected *" />
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiActivity className="text-orange-500" /> 3. Breakdown Details</h3>
            <label className="block text-sm font-medium mb-2">Equipment Type facing breakdown *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {equipmentTypes.map(s => (
                <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.equipmentType.includes(s) ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={formData.equipmentType.includes(s)} onChange={() => toggleArrayItem('equipmentType', s)} className="w-4 h-4 text-red-500 rounded" />
                  <span className={`ml-3 text-sm ${formData.equipmentType.includes(s) ? 'font-medium text-red-600' : 'text-gray-700'}`}>{s}</span>
                </label>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input required type="text" name="equipmentBrand" value={formData.equipmentBrand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Equipment Brand / Make *" />
              <input required type="number" name="devicesAffectedCount" value={formData.devicesAffectedCount} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Number of units affected *" />
            </div>
            
            <textarea required name="faultDescription" value={formData.faultDescription} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none mb-4" placeholder="Describe the fault / issue exactly as it's happening *"></textarea>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="typeOfIssue" value={formData.typeOfIssue} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Type of Issue *</option>
                {issueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select required name="breakdownTime" value={formData.breakdownTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">When did the breakdown occur? *</option>
                {breakdownTimes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select required name="beforeBreakdown" value={formData.beforeBreakdown} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">What was happening before breakdown? *</option>
                {beforeBreakdowns.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input required type="text" name="visibleDamage" value={formData.visibleDamage} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Visible physical damage? (Yes-describe / No) *" />
              <select required name="powerSupplyStatus" value={formData.powerSupplyStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Power supply available? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Fluctuating">Fluctuating</option>
              </select>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiShield className="text-red-500" /> 4. Impact Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="devicesAffectedCategory" value={formData.devicesAffectedCategory} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">How many devices affected? *</option>
                {deviceCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select required name="systemDownStatus" value={formData.systemDownStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">System status *</option>
                <option value="Entire system">Entire system down</option>
                <option value="Partial">Partial down</option>
                <option value="Single device">Single device down</option>
              </select>
              <select required name="affectingBusiness" value={formData.affectingBusiness} onChange={handleInputChange} className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Affecting business operations? *</option>
                <option value="Yes — critically">Yes — critically</option>
                <option value="Yes — partially">Yes — partially</option>
                <option value="No">No</option>
              </select>
              <select required name="securityRisk" value={formData.securityRisk} onChange={handleInputChange} className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Safety / security risk right now? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            
            {formData.securityRisk === 'Yes' && (
              <textarea name="riskDescription" value={formData.riskDescription} onChange={handleInputChange} className="w-full mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Describe the safety/security risk..."></textarea>
            )}

            <input required type="text" name="happenedBefore" value={formData.happenedBefore} onChange={handleInputChange} className="w-full mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Has this happened before? (Yes-count / No) *" />
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiTool className="text-indigo-500" /> 5. Service Details</h3>
            <div className="space-y-4">
              <select required name="existingAmc" value={formData.existingAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Have an AMC/Contract with any vendor? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              
              {formData.existingAmc === 'Yes' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in border p-4 rounded-xl border-orange-100 bg-orange-50">
                  <input type="text" name="amcProviderName" value={formData.amcProviderName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" placeholder="AMC Provider Name" />
                  <input type="text" name="amcContractNumber" value={formData.amcContractNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" placeholder="Contract Number" />
                  <select name="whyNotContactingAmc" value={formData.whyNotContactingAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl">
                    <option value="">Why not contacting AMC vendor?</option>
                    <option value="AMC expired">AMC expired</option>
                    <option value="No response">No response</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select required name="installedByWbi" value={formData.installedByWbi} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                  <option value="">Installed by WBI? *</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Not sure">Not sure</option>
                </select>
                <select required name="underWarranty" value={formData.underWarranty} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                  <option value="">Equipment under warranty? *</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiClock className="text-purple-500" /> 6. Urgency & Visit</h3>
            <div className="space-y-4">
              <select required name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full px-4 py-3 bg-red-50 text-red-900 border border-red-300 rounded-xl font-bold focus:ring-red-400 outline-none">
                <option value="">How urgent is this? *</option>
                {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Preferred Visit Date</label>
                  <input type="date" name="preferredVisitDate" value={formData.preferredVisitDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Time Slot *</label>
                  <select required name="preferredTimeSlot" value={formData.preferredTimeSlot} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                    <option value="">Select Time Slot</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="accessRestrictions" value={formData.accessRestrictions} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Access Restrictions? (Yes-describe / No) *" />
                <select required name="someoneAvailable" value={formData.someoneAvailable} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                  <option value="">Someone available to assist engineer? *</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 7 & 8 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiBox className="text-blue-500" /> 7. Expectations & Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <select required name="expectedOutcome" value={formData.expectedOutcome} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Expected Outcome *</option>
                {expectedOutcomes.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <select required name="okayWithSpareCost" value={formData.okayWithSpareCost} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Okay with spare parts cost? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Depends on cost — need quote first">Depends on cost</option>
              </select>
              <select required name="needJobReport" value={formData.needJobReport} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Need job completion report? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needPhotographs" value={formData.needPhotographs} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Need photos of fault & repair? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            
            <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="expectedBudget" value={formData.expectedBudget} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">Expected repair budget *</option>
                {expectedBudgets.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select required name="interestedInAmc" value={formData.interestedInAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">After repair, interested in AMC? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Maybe">Maybe</option>
              </select>
              <select required name="source" value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none">
                <option value="">How did you hear about us? *</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Google">Google</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="2" className="w-full mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-red-400 outline-none" placeholder="Additional Notes / Emergency Details"></textarea>
          </div>

          {/* Section 9 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><FiUploadCloud className="text-gray-500" /> Attachments (Important for fast diagnosis)</h3>
            <p className="text-sm text-gray-500 mb-4">Upload Photos/Videos of Faulty Equipment or Error Screenshots.</p>
            <div className="border-2 border-dashed border-red-200 rounded-xl p-6 text-center cursor-pointer hover:bg-red-50 transition-colors" onClick={() => document.getElementById('file-upload').click()}>
              <FiUploadCloud className="mx-auto text-3xl text-red-500 mb-2" />
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
            <button type="submit" disabled={isSubmitting || uploading} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all flex justify-center items-center gap-2">
              {isSubmitting || uploading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {uploading ? 'Uploading...' : 'Submitting...'}</>
              ) : (
                <><FiAlertTriangle className="text-xl" /> Submit Breakdown Call</>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-3">Our engineer will contact you within 1 hour.</p>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default BreakdownEnquiry;
