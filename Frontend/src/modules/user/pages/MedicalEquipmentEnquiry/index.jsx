import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiMaximize, FiTool, FiClock, FiFileText, FiShield, FiAlertTriangle, FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const MedicalEquipmentEnquiry = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '', organizationName: '', designation: '', email: '', phone: '', alternateContact: '', city: '', siteAddress: '',
    facilityType: '', facilitySize: '', departmentsCount: '', isOperational24x7: '',
    equipmentCategory: [], equipmentName: '', equipmentBrand: '', equipmentModel: '', equipmentSerial: '', numberOfUnits: '', equipmentAge: '', purchasedFrom: '',
    serviceRequired: [], currentStatus: '', faultDescription: '', errorCode: '', issueStartDate: '',
    isRoomReady: '', isPowerReady: '', specialPowerNeeded: '', plumbingGasNeeded: '', civilPreparationNeeded: '', itConnectivityNeeded: '',
    needInstallationCertificate: '', needNabhDocumentation: '', needUserTraining: '', needOperatorManual: '',
    preferredVisitDate: '', preferredTimeSlot: '', urgency: '', siteContactName: '', siteContactNumber: '', departmentLocation: '', accessRestriction: '',
    budgetRange: '', sparePartsReplacement: '', interestedInAmc: '', howDidYouHear: '', additionalNotes: ''
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
    if (formData.serviceRequired.length === 0) {
      toast.error('Please select at least one service required');
      return;
    }
    setIsSubmitting(true);
    try {
      const attachmentUrls = await uploadFiles();
      const finalData = { ...formData, attachments: attachmentUrls };
      if (!finalData.preferredVisitDate) delete finalData.preferredVisitDate;

      const res = await api.post('/public/medicalequipment-enquiries', finalData);
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
          <p className="text-gray-600 mb-8">Our biomedical engineer will contact you within 24 hours.</p>
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
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">Medical Equipment</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><FiActivity className="text-2xl text-[#10AFA5]" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Medical Equipment Services</h2>
            <p className="text-gray-600 text-sm">Installation, repair, and maintenance of medical devices.</p>
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
              <input required type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Designation (Doctor / Biomedical Engineer / Admin) *" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Email Address *" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Phone / WhatsApp *" />
              </div>
              <input type="tel" name="alternateContact" value={formData.alternateContact} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Alternate Contact Number" />
              <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="City / Location *" />
              <input required type="text" name="siteAddress" value={formData.siteAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Complete Site / Facility Address *" />
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiShield className="text-[#10AFA5]" /> 2. Facility Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="facilityType" value={formData.facilityType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Facility Type *</option>
                {['Government Hospital', 'Private Hospital', 'Nursing Home / Clinic', 'Diagnostic Center / Lab', 'Dental Clinic', 'Physiotherapy Center', 'Eye Care Center', 'Veterinary Clinic', 'Medical College / Research Center', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <select required name="facilitySize" value={formData.facilitySize} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Facility Size *</option>
                {['Small — below 20 beds', 'Medium — 20–100 beds', 'Large — 100–300 beds', 'Very Large — 300+ beds', 'No beds (diagnostic / lab only)'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input required type="number" name="departmentsCount" value={formData.departmentsCount} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Number of departments / floors *" />
              <select required name="isOperational24x7" value={formData.isOperational24x7} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Is facility operational 24x7? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiMaximize className="text-[#10AFA5]" /> 3. Equipment Details</h3>
            <p className="text-sm font-medium text-gray-700 mb-2">Equipment Category *</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {['Diagnostic Imaging (X-Ray / CT Scan / MRI / Ultrasound)', 'Patient Monitoring (ECG / Pulse Oximeter / BP Monitor)', 'Life Support (Ventilator / Anesthesia Machine)', 'Laboratory Equipment (Analyzer / Centrifuge)', 'Surgical Equipment (OT Light / Surgical Table)', 'Sterilization Equipment (Autoclave)', 'Rehabilitation Equipment', 'Dental Equipment', 'ICU / Critical Care Equipment', 'Radiology Equipment', 'Other'].map(s => (
                <label key={s} className="flex items-start gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" value={s} checked={formData.equipmentCategory.includes(s)} onChange={(e) => handleCheckboxChange(e, 'equipmentCategory')} className="mt-1 text-[#10AFA5] focus:ring-[#10AFA5] rounded" />
                  <span className="text-sm text-gray-700">{s}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" name="equipmentName" value={formData.equipmentName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Equipment Name / Type *" />
              <input required type="text" name="equipmentBrand" value={formData.equipmentBrand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Equipment Brand / Make (e.g. Philips) *" />
              <input type="text" name="equipmentModel" value={formData.equipmentModel} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Equipment Model Number" />
              <input type="text" name="equipmentSerial" value={formData.equipmentSerial} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Equipment Serial Number" />
              <input required type="number" name="numberOfUnits" value={formData.numberOfUnits} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Number of Units *" />
              <select required name="equipmentAge" value={formData.equipmentAge} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Equipment Age *</option>
                {['Less than 1 yr', '1–3 yrs', '3–5 yrs', 'More than 5 yrs'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select required name="purchasedFrom" value={formData.purchasedFrom} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Equipment purchased from? *</option>
                {['Original Manufacturer', 'Local Dealer', 'Import', 'Other'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiTool className="text-[#10AFA5]" /> 4. Service Type Required</h3>
            <p className="text-sm font-medium text-gray-700 mb-2">Service Required *</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {['New Equipment Installation & Commissioning', 'Breakdown / Emergency Repair', 'Calibration & Alignment', 'Software / Firmware Update', 'Hardware Component Replacement', 'Equipment Relocation', 'Equipment Decommissioning', 'Post-warranty repair', 'Demo / Trial Setup'].map(s => (
                <label key={s} className="flex items-start gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" value={s} checked={formData.serviceRequired.includes(s)} onChange={(e) => handleCheckboxChange(e, 'serviceRequired')} className="mt-1 text-[#10AFA5] focus:ring-[#10AFA5] rounded" />
                  <span className="text-sm text-gray-700">{s}</span>
                </label>
              ))}
            </div>
            <div className="space-y-4">
              <select required name="currentStatus" value={formData.currentStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Current Equipment Status *</option>
                {['Not working at all', 'Working partially / intermittent', 'Giving wrong / inaccurate readings', 'Making abnormal noise', 'Error / alarm showing', 'Physical damage', 'Working — new installation needed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea name="faultDescription" value={formData.faultDescription} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Fault / Issue Description"></textarea>
              <input type="text" name="errorCode" value={formData.errorCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Error Code / Alarm shown (if any)" />
              <select name="issueStartDate" value={formData.issueStartDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">When did issue start?</option>
                {['Just now', 'Today', 'Yesterday', '2–3 days', 'More than a week'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiAlertTriangle className="text-[#10AFA5]" /> 5. Installation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="isRoomReady" value={formData.isRoomReady} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Is room / space ready for installation?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Under preparation">Under preparation</option>
              </select>
              <select name="isPowerReady" value={formData.isPowerReady} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Is power supply ready?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select name="specialPowerNeeded" value={formData.specialPowerNeeded} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Special power requirement needed?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </select>
              <select name="plumbingGasNeeded" value={formData.plumbingGasNeeded} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Is plumbing / gas line needed?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not applicable">Not applicable</option>
              </select>
              <select name="civilPreparationNeeded" value={formData.civilPreparationNeeded} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Do you need civil / room preparation?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select name="itConnectivityNeeded" value={formData.itConnectivityNeeded} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Is IT / network connectivity needed?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiFileText className="text-[#10AFA5]" /> 6. Compliance & Certification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="needInstallationCertificate" value={formData.needInstallationCertificate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need installation certificate?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select name="needNabhDocumentation" value={formData.needNabhDocumentation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need NABH / NABL documentation?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select name="needUserTraining" value={formData.needUserTraining} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need user training after installation?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select name="needOperatorManual" value={formData.needOperatorManual} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need operator manual / documentation?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Section 7 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiClock className="text-[#10AFA5]" /> 7. Visit & Urgency</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block px-1">Preferred Visit Date *</label>
                <input required type="date" name="preferredVisitDate" value={formData.preferredVisitDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block px-1">Preferred Time Slot *</label>
                <select required name="preferredTimeSlot" value={formData.preferredTimeSlot} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">Select Slot</option>
                  {['Morning 9–12', 'Afternoon 12–4', 'Evening 4–7'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <select required name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-[#E8F5F1] text-[#10AFA5] border border-[#10AFA5] font-bold rounded-xl outline-none">
                <option value="">Urgency *</option>
                {['Emergency — patient care affected', 'Same day', 'Within 24 hours', 'Within 2–3 days', 'Scheduled / planned', 'Flexible'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input required type="text" name="siteContactName" value={formData.siteContactName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Person Name *" />
              <input required type="tel" name="siteContactNumber" value={formData.siteContactNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Number *" />
              <input required type="text" name="departmentLocation" value={formData.departmentLocation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Department / Floor *" />
              <input required type="text" name="accessRestriction" value={formData.accessRestriction} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Any access / entry restriction? *" />
            </div>
          </div>

          {/* Section 8 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiFileText className="text-[#10AFA5]" /> 8. Budget & Additional Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Budget Range *</option>
                {['Below ₹6,999', '₹6,999 – ₹20,000', '₹20,000 – ₹50,000', '₹50,000 – ₹1,00,000', 'Above ₹1,00,000', 'To be discussed'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select name="sparePartsReplacement" value={formData.sparePartsReplacement} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Spare parts replacement if needed?</option>
                {['Yes', 'No', 'Depends on cost'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select required name="interestedInAmc" value={formData.interestedInAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Interested in AMC after service? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Already have">Already have</option>
              </select>
              <select required name="howDidYouHear" value={formData.howDidYouHear} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">How did you hear about us? *</option>
                {['Social Media', 'Referral', 'Google', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="2" className="w-full mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Additional Notes"></textarea>
          </div>

          {/* Section 9 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><FiUploadCloud className="text-[#10AFA5]" /> 9. Attachments (optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Upload Equipment Photos, Errors, Manual, or Previous reports.</p>
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

export default MedicalEquipmentEnquiry;
