import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiMaximize, FiTool, FiClock, FiFileText, FiPower, FiAlertTriangle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const DcPowerService = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '', organizationName: '', designation: '', email: '', phone: '', city: '', siteAddress: '',
    siteType: '', isSiteRemote: '', isSiteCritical: '',
    dcSystemType: [], equipmentBrand: '', dcVoltageSystem: '', systemCapacity: '', numberOfRectifiers: '', equipmentAge: '', batteryBankConnected: '', batteryTypeAndCapacity: '',
    serviceRequired: [], currentStatus: '', faultDescription: '', alarmCode: '', issueStartTime: '',
    isNetworkDown: '', sitesAffectedCount: '', estimatedDowntime: '', isBatteryBackupRunning: '', estimatedBatteryRemaining: '',
    preferredVisitDate: '', preferredTimeSlot: '', urgency: '', siteContactName: '', siteContactNumber: '', siteAccessAvailable: '',
    budgetRange: '', needServiceReport: '', needRemoteMonitoring: '', interestedInAmc: '', source: '', additionalNotes: ''
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
    if (formData.serviceRequired.length === 0 || formData.dcSystemType.length === 0) {
      toast.error('Please select at least one service and one system type');
      return;
    }
    setIsSubmitting(true);
    try {
      const attachmentUrls = await uploadFiles();
      const finalData = { ...formData, attachments: attachmentUrls };
      if (!finalData.preferredVisitDate) delete finalData.preferredVisitDate;

      const res = await api.post('/public/dcpowerservice-enquiries', finalData);
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
          <p className="text-gray-600 mb-8">Our Telecom/DC Power engineer will contact you shortly.</p>
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
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">DC Power System Service</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><FiPower className="text-2xl text-[#10AFA5]" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">DC Power Plants</h2>
            <p className="text-gray-600 text-sm">Telecom BTS, Rectifiers, and DC Distribution services.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8F5F1] p-6 border-l-4 border-l-[#10AFA5]">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiMapPin className="text-[#10AFA5]" /> 1. Client & Site Info</h3>
            <div className="space-y-4">
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Full Name *" />
              <input required type="text" name="organizationName" value={formData.organizationName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Company / Organization Name *" />
              <input required type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Designation *" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Email Address *" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Phone / WhatsApp *" />
              </div>
              <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="City / Location *" />
              <input required type="text" name="siteAddress" value={formData.siteAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Complete Site Address *" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <select required name="siteType" value={formData.siteType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">Site Type *</option>
                  {['Telecom Tower / BTS Site', 'Data Center', 'Bank / ATM Site', 'Hospital', 'Office / Corporate', 'Industrial / Factory', 'Railway / Metro', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select required name="isSiteRemote" value={formData.isSiteRemote} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">Is site remote / unmanned? *</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <select required name="isSiteCritical" value={formData.isSiteCritical} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">Is site critical / 24x7? *</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiMaximize className="text-[#10AFA5]" /> 2. DC Power System Details</h3>
            <p className="text-sm font-medium text-gray-700 mb-2">Select DC System Type *</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {['DC Power Plant (48V / 24V system)', 'Rectifier Module', 'DC Distribution Board (DCDB)', 'Battery Charger / Charge Controller', 'DC UPS', 'Solar DC System', 'SMPS (Switch Mode Power Supply)', 'Other'].map(s => (
                <label key={s} className="flex items-start gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" value={s} checked={formData.dcSystemType.includes(s)} onChange={(e) => handleCheckboxChange(e, 'dcSystemType')} className="mt-1 text-[#10AFA5] focus:ring-[#10AFA5] rounded" />
                  <span className="text-sm text-gray-700">{s}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="equipmentBrand" value={formData.equipmentBrand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Equipment Brand *</option>
                {['Emerson / Vertiv', 'Delta', 'Eltek', 'Huawei', 'ZTE', 'Ericsson', 'Other'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select required name="dcVoltageSystem" value={formData.dcVoltageSystem} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">DC Voltage System *</option>
                {['48V', '24V', '12V', 'Other'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <input type="text" name="systemCapacity" value={formData.systemCapacity} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="System Capacity (Ampere rating)" />
              <input required type="number" name="numberOfRectifiers" value={formData.numberOfRectifiers} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Number of Rectifier Modules *" />
              <select required name="equipmentAge" value={formData.equipmentAge} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Equipment Age *</option>
                {['Less than 1 yr', '1–3 yrs', '3–5 yrs', 'More than 5 yrs'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select required name="batteryBankConnected" value={formData.batteryBankConnected} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Battery bank connected? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {formData.batteryBankConnected === 'Yes' && <input type="text" name="batteryTypeAndCapacity" value={formData.batteryTypeAndCapacity} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Battery type & capacity" />}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiTool className="text-[#10AFA5]" /> 3. Service Required</h3>
            <p className="text-sm font-medium text-gray-700 mb-2">Select Services Required *</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {['Breakdown / system failure', 'Rectifier module failure', 'DC voltage fluctuation', 'Battery not charging', 'Overheating / overload', 'Controller / alarm card issue', 'Preventive maintenance', 'Rectifier module replacement', 'System capacity upgrade', 'Remote monitoring setup', 'New DC plant installation', 'AMC'].map(s => (
                <label key={s} className="flex items-start gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" value={s} checked={formData.serviceRequired.includes(s)} onChange={(e) => handleCheckboxChange(e, 'serviceRequired')} className="mt-1 text-[#10AFA5] focus:ring-[#10AFA5] rounded" />
                  <span className="text-sm text-gray-700">{s}</span>
                </label>
              ))}
            </div>
            <div className="space-y-4">
              <select required name="currentStatus" value={formData.currentStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Current System Status *</option>
                {['Working', 'Not working', 'Partial failure', 'Intermittent'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea required name="faultDescription" value={formData.faultDescription} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Fault / Issue Description *"></textarea>
              <input type="text" name="alarmCode" value={formData.alarmCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Alarm / error code shown (if any)" />
              <select required name="issueStartTime" value={formData.issueStartTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">When did issue start? *</option>
                {['Just now', 'Today', 'Yesterday', '2–3 days', 'More than a week'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiAlertTriangle className="text-[#10AFA5]" /> 4. Impact Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="isNetworkDown" value={formData.isNetworkDown} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Is telecom / network down due to this? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <input type="number" name="sitesAffectedCount" value={formData.sitesAffectedCount} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="How many sites affected?" />
              <input type="text" name="estimatedDowntime" value={formData.estimatedDowntime} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Estimated downtime so far (hours)" />
              <select required name="isBatteryBackupRunning" value={formData.isBatteryBackupRunning} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Is battery backup running currently? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <input type="text" name="estimatedBatteryRemaining" value={formData.estimatedBatteryRemaining} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Estimated battery backup remaining (hours - optional)" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiClock className="text-[#10AFA5]" /> 5. Visit & Urgency</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block px-1">Preferred Visit Date</label>
                <input type="date" name="preferredVisitDate" value={formData.preferredVisitDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block px-1">Preferred Time Slot *</label>
                <select required name="preferredTimeSlot" value={formData.preferredTimeSlot} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">Select Slot</option>
                  {['Morning 9–12', 'Afternoon 12–4', 'Evening 4–7', 'Anytime'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <select required name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-[#E8F5F1] text-[#10AFA5] border border-[#10AFA5] font-bold rounded-xl outline-none">
                <option value="">Urgency *</option>
                {['Emergency — system down / battery critical', 'Same day', 'Within 24 hours', 'Within 2–3 days', 'Flexible'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input required type="text" name="siteContactName" value={formData.siteContactName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Person Name *" />
              <input required type="tel" name="siteContactNumber" value={formData.siteContactNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Number *" />
              <select required name="siteAccessAvailable" value={formData.siteAccessAvailable} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Site access / key available? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiFileText className="text-[#10AFA5]" /> 6. Budget & Additional Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Budget Range *</option>
                {['Below ₹5,000', '₹5,000–₹20,000', '₹20,000–₹75,000', 'Above ₹75,000', 'TBD'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select required name="needServiceReport" value={formData.needServiceReport} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need service report? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needRemoteMonitoring" value={formData.needRemoteMonitoring} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need remote monitoring setup? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Already have">Already have</option>
              </select>
              <select required name="interestedInAmc" value={formData.interestedInAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Interested in AMC? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Already have">Already have</option>
              </select>
              <select required name="source" value={formData.source} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">How did you hear about us? *</option>
                {['Social Media', 'Referral', 'Google', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="2" className="w-full mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Additional Notes"></textarea>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><FiUploadCloud className="text-[#10AFA5]" /> 7. Attachments (optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Upload System Photos, Alarm Screenshots, or Diagrams.</p>
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

export default DcPowerService;
