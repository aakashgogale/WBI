import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiBox, FiActivity, FiZap, FiWifi, FiClock, FiDollarSign, FiCpu
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const PowerMonitoringEnquiry = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Section 1
    fullName: '', companyName: '', email: '', phone: '', designation: '', city: '', siteAddress: '',
    // Section 2
    facilityType: '', siteSize: '', numberOfFloors: '', numberOfLocations: '',
    // Section 3
    totalConnectedLoad: '', powerSupplyType: [], existingMeteringSystem: '', existingBMS: '', existingMonitoringSoftware: '', currentMajorIssues: [],
    // Section 4
    typeOfMonitoringNeeded: [], alertPreference: [], alertRecipients: '', reportingFrequency: '',
    // Section 5
    integrationNeeded: [], needLoadShedding: '', needPredictiveMaintenance: '', needEnergyAudit: '', cloudOrOnPremise: '',
    // Section 6
    preferredSiteVisitDate: '', preferredTimeSlot: '', siteContactName: '', siteContactNumber: '', expectedProjectStartDate: '', projectUrgency: '',
    // Section 7
    budgetRange: '', needAmcAfterInstall: '', needStaffTraining: '', source: '', additionalNotes: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Dropdowns
  const facilityTypes = ['Office / Corporate', 'Factory / Manufacturing Plant', 'Hospital / Healthcare', 'Data Center / Server Room', 'Warehouse / Godown', 'Retail Chain / Mall', 'School / College', 'Government / PSU', 'Residential Society', 'Other'];
  const siteSizes = ['Small — below 1,000 sq ft', 'Medium — 1,000 – 5,000 sq ft', 'Large — 5,000 – 20,000 sq ft', 'Very Large — 20,000+ sq ft'];
  const locationCounts = ['Single site', '2 – 5 sites', '5 – 10 sites', '10+ sites'];
  
  const loadCapacities = ['Below 10 KW', '10 – 50 KW', '50 – 200 KW', '200 – 500 KW', 'Above 500 KW', 'Not sure'];
  const powerSupplies = ['Grid / EB Supply', 'DG Set / Generator', 'Solar / Renewable', 'UPS System', 'Combination of above'];
  const meteringSystems = ['Basic energy meter only', 'Sub-meters at department level', 'Smart meters already installed', 'No metering currently', 'Not sure'];
  const majorIssues = ['High electricity bills', 'Frequent power failures', 'No visibility on consumption', 'Power theft / leakage', 'Overloading issues', 'Uneven load distribution', 'No real-time alerts', 'None — proactive setup'];

  const monitoringTypes = ['Real-time energy consumption dashboard', 'Department / zone-wise sub-metering', 'Overload & fault alerts', 'Remote monitoring via mobile / web', 'Automated reports & analytics', 'Power quality monitoring (voltage, frequency, harmonics)', 'Peak demand management', 'Generator / DG monitoring', 'Solar energy monitoring', 'Carbon footprint tracking', 'Full automation & control', 'Not sure — need expert consultation'];
  const alertPreferences = ['SMS alerts', 'WhatsApp alerts', 'Email alerts', 'Mobile app push notifications', 'Dashboard alarm'];
  const alertRecipients = ['Owner / Top management only', 'Facility / maintenance team', 'Multiple stakeholders', 'Custom hierarchy'];
  const reportingFrequencies = ['Real-time live dashboard', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Custom schedule'];

  const integrationTypes = ['BMS (Building Management System)', 'SCADA', 'ERP / SAP', 'Solar MPPT / Inverter', 'DG Controller', 'Fire & Safety System', 'No integration needed', 'Not sure'];

  const timeSlots = ['Morning 9–12', 'Afternoon 12–4', 'Evening 4–7'];
  const urgencies = ['ASAP', 'Within 1 month', '1 – 3 months', 'Flexible'];
  const budgets = ['Below ₹50,000', '₹50,000 – ₹1,00,000', '₹1,00,000 – ₹3,00,000', '₹3,00,000 – ₹5,00,000', 'Above ₹5,00,000', 'To be discussed'];

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
      if (!finalData.preferredSiteVisitDate) delete finalData.preferredSiteVisitDate;
      if (!finalData.expectedProjectStartDate) delete finalData.expectedProjectStartDate;

      const res = await api.post('/public/powermonitoring-enquiries', finalData);
      if (res.data.success) {
        setSuccess(true);
        toast.success('Power Monitoring Enquiry submitted successfully!');
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
          <p className="text-gray-600 mb-8">Our power automation engineers will contact you within 24 hours to initiate your smart monitoring project.</p>
          <button onClick={() => navigate('/user')} className="w-full bg-[#10AFA5] text-white py-4 rounded-xl font-semibold hover:bg-[#10AFA5] transition-colors">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><FiArrowLeft className="text-xl" /></button>
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">Power Monitoring Setup</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><FiZap className="text-2xl text-[#10AFA5]" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Automated Power Monitoring</h2>
            <p className="text-gray-600 text-sm">Smart tracking, real-time alerts, and energy optimization.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8F5F1] p-6 border-l-4 border-l-transparent">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiMapPin className="text-[#10AFA5]" /> 1. Client Info</h3>
            <div className="space-y-4">
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Full Name *" />
              <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Company / Organization Name" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Email Address *" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Phone / WhatsApp *" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Designation / Role *" />
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="City / Location *" />
              </div>
              <input required type="text" name="siteAddress" value={formData.siteAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Complete Site Address *" />
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiBox className="text-[#10AFA5]" /> 2. Site & Facility Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="facilityType" value={formData.facilityType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Facility Type *</option>
                {facilityTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select required name="siteSize" value={formData.siteSize} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Site Size / Area *</option>
                {siteSizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input required type="number" name="numberOfFloors" value={formData.numberOfFloors} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Number of Floors *" />
              <select required name="numberOfLocations" value={formData.numberOfLocations} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Number of Locations *</option>
                {locationCounts.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiActivity className="text-orange-500" /> 3. Current Power Setup</h3>
            <div className="space-y-4">
              <select required name="totalConnectedLoad" value={formData.totalConnectedLoad} onChange={handleInputChange} className="w-full px-4 py-3 bg-orange-50 text-orange-900 border border-orange-200 rounded-xl font-medium focus:ring-[#10AFA5] outline-none">
                <option value="">Total Connected Load / Capacity *</option>
                {loadCapacities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <div>
                <label className="block text-sm font-medium mb-2">Power Supply Type *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {powerSupplies.map(s => (
                    <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.powerSupplyType.includes(s) ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                      <input type="checkbox" checked={formData.powerSupplyType.includes(s)} onChange={() => toggleArrayItem('powerSupplyType', s)} className="w-4 h-4 text-orange-500 rounded" />
                      <span className={`ml-3 text-sm ${formData.powerSupplyType.includes(s) ? 'font-medium text-orange-700' : 'text-gray-700'}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <select required name="existingMeteringSystem" value={formData.existingMeteringSystem} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Existing Metering System *</option>
                {meteringSystems.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="existingBMS" value={formData.existingBMS} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Existing BMS / SCADA? (Yes-brand / No) *" />
                <input required type="text" name="existingMonitoringSoftware" value={formData.existingMonitoringSoftware} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Any existing power software? (Yes / No) *" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current major power issues *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {majorIssues.map(s => (
                    <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.currentMajorIssues.includes(s) ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                      <input type="checkbox" checked={formData.currentMajorIssues.includes(s)} onChange={() => toggleArrayItem('currentMajorIssues', s)} className="w-4 h-4 text-red-500 rounded" />
                      <span className={`ml-3 text-sm ${formData.currentMajorIssues.includes(s) ? 'font-medium text-red-700' : 'text-gray-700'}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiZap className="text-yellow-500" /> 4. Monitoring Requirements</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Type of Monitoring Needed *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {monitoringTypes.map(s => (
                  <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.typeOfMonitoringNeeded.includes(s) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                    <input type="checkbox" checked={formData.typeOfMonitoringNeeded.includes(s)} onChange={() => toggleArrayItem('typeOfMonitoringNeeded', s)} className="w-4 h-4 text-yellow-500 rounded" />
                    <span className={`ml-3 text-sm ${formData.typeOfMonitoringNeeded.includes(s) ? 'font-medium text-yellow-800' : 'text-gray-700'}`}>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Alert / Notification Preference *</label>
              <div className="flex flex-wrap gap-2">
                {alertPreferences.map(s => (
                  <label key={s} className={`flex items-center px-4 py-2 rounded-full border cursor-pointer transition-colors ${formData.alertPreference.includes(s) ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                    <input type="checkbox" checked={formData.alertPreference.includes(s)} onChange={() => toggleArrayItem('alertPreference', s)} className="hidden" />
                    <span className="text-sm font-medium">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="alertRecipients" value={formData.alertRecipients} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Who should receive alerts? *</option>
                {alertRecipients.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select required name="reportingFrequency" value={formData.reportingFrequency} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Reporting Frequency *</option>
                {reportingFrequencies.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiCpu className="text-blue-500" /> 5. Integration & Automation</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Integration with existing systems needed?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {integrationTypes.map(s => (
                  <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.integrationNeeded.includes(s) ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
                    <input type="checkbox" checked={formData.integrationNeeded.includes(s)} onChange={() => toggleArrayItem('integrationNeeded', s)} className="w-4 h-4 text-blue-500 rounded" />
                    <span className={`ml-3 text-sm ${formData.integrationNeeded.includes(s) ? 'font-medium text-blue-700' : 'text-gray-700'}`}>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="needLoadShedding" value={formData.needLoadShedding} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Need automatic load shedding/control? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </select>
              <select required name="needPredictiveMaintenance" value={formData.needPredictiveMaintenance} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Need predictive maintenance alerts? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needEnergyAudit" value={formData.needEnergyAudit} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Do you need energy audit reports? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="cloudOrOnPremise" value={formData.cloudOrOnPremise} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Cloud-based or on-premise system? *</option>
                <option value="Cloud">Cloud-based</option>
                <option value="On-premise">On-premise</option>
                <option value="Hybrid">Hybrid</option>
                <option value="No preference">No preference</option>
              </select>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiClock className="text-purple-500" /> 6. Visit & Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Preferred Site Visit Date</label>
                <input type="date" name="preferredSiteVisitDate" value={formData.preferredSiteVisitDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Time Slot *</label>
                <select required name="preferredTimeSlot" value={formData.preferredTimeSlot} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                  <option value="">Select Time Slot</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <input type="text" name="siteContactName" value={formData.siteContactName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Person Name" />
              <input type="text" name="siteContactNumber" value={formData.siteContactNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Number" />
              <div>
                <label className="text-sm text-gray-600 block mb-1">Expected Project Start</label>
                <input type="date" name="expectedProjectStartDate" value={formData.expectedProjectStartDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Project Urgency *</label>
                <select required name="projectUrgency" value={formData.projectUrgency} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F4FBFB] text-gray-900 border border-gray-200 rounded-xl font-bold focus:ring-[#10AFA5] outline-none">
                  <option value="">Urgency</option>
                  {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 7 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiDollarSign className="text-green-500" /> 7. Budget & Additional Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Budget Range *</option>
                {budgets.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select required name="needAmcAfterInstall" value={formData.needAmcAfterInstall} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Need AMC after installation? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Want to discuss">Want to discuss</option>
              </select>
              <select required name="needStaffTraining" value={formData.needStaffTraining} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Need staff training? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="source" value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">How did you hear about us? *</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Google">Google</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="2" className="w-full mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Additional Notes"></textarea>
          </div>

          {/* Section 8 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><FiUploadCloud className="text-gray-500" /> 8. Attachments (optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Upload SLD, Electricity Bills (last 3 months), Floor Plan, or BMS Details.</p>
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
                <><FiZap className="text-xl" /> Submit Enquiry</>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-3">Our team will contact you within 24 hours.</p>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default PowerMonitoringEnquiry;
