import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiCpu, FiTool, FiActivity, FiClock, FiDollarSign
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const AtmServiceEnquiry = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Section 1
    fullName: '', organizationName: '', employeeId: '', designation: '', email: '', phone: '', alternateContact: '', city: '', branchAddress: '',
    // Section 2
    atmType: '', atmBrand: '', atmModelNumber: '', atmTerminalId: '', atmSerialNumber: '', numberOfAtms: '',
    // Section 3
    serviceRequired: '', isAtmWorking: '', issueDescription: '', errorCode: '', typeOfFault: '',
    // Section 4
    issueStartTime: '', atmServiceStatus: '', isCashLoaded: '', lastMaintenanceDone: '', existingAmc: '', contractProviderName: '', contractExpiryDate: '', underWarranty: '',
    // Section 5
    preferredVisitDate: '', preferredTimeSlot: '', urgency: '', siteContactName: '', siteContactNumber: '', siteSecurityAvailable: '', specialEntryRequirement: '',
    // Section 6
    needCompletionReport: '', needSpareParts: '', interestedInAmc: '', budgetRange: '', source: '', additionalNotes: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Dropdowns
  const atmTypes = ['Onsite ATM (inside branch)', 'Offsite ATM (outside branch)', 'White Label ATM', 'Cash Recycler Machine (CRM)', 'Other'];
  const atmBrands = ['NCR', 'Diebold Nixdorf', 'Wincor', 'GRG Banking', 'Nautilus Hyosung', 'Euronet', 'Other (specify)'];
  const serviceTypes = ['Preventive Maintenance (scheduled)', 'Breakdown / Emergency Repair', 'First Level Maintenance (FLM)', 'Second Level Maintenance (SLM)', 'Software / Firmware Update', 'Hardware Replacement', 'Full ATM Relocation', 'New ATM Installation', 'Decommissioning / Removal', 'Annual Maintenance Contract (AMC)'];
  const faultTypes = ['Card reader issue', 'Cash dispenser jam', 'Receipt printer issue', 'Screen / display issue', 'Network / connectivity issue', 'Power issue', 'Safe / vault issue', 'Software / OS issue', 'Multiple issues', 'Not sure — need diagnosis'];
  const issueStarts = ['Just now', 'Today', 'Yesterday', '2–3 days ago', 'More than a week'];
  const timeSlots = ['Morning 9–12', 'Afternoon 12–4', 'Evening 4–7', 'Anytime'];
  const urgencies = ['Emergency — within 2–4 hours', 'Same day', 'Within 24 hours', 'Within 2–3 days', 'Flexible'];
  const budgets = ['To be discussed', 'Below ₹5,000', '₹5,000 – ₹15,000', '₹15,000 – ₹50,000', 'Above ₹50,000'];

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
      if (!finalData.contractExpiryDate) delete finalData.contractExpiryDate;

      const res = await api.post('/public/atmservice-enquiries', finalData);
      if (res.data.success) {
        setSuccess(true);
        toast.success('ATM Service Enquiry submitted successfully!');
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
          <p className="text-gray-600 mb-8">Our ATM Service engineer will contact you within 1 hour.</p>
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
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">ATM Service</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><FiCpu className="text-2xl text-[#10AFA5]" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">ATM Maintenance & Repair</h2>
            <p className="text-gray-600 text-sm">Fast, reliable FLM & SLM services for ATM networks.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-[#10AFA5]">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiMapPin className="text-[#10AFA5]" /> 1. Client Info</h3>
            <div className="space-y-4">
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Full Name *" />
              <input type="text" name="organizationName" value={formData.organizationName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Bank / Organization Name" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Employee ID / Staff Code (optional)" />
                <input required type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Designation *" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Email Address *" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Phone / WhatsApp *" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="tel" name="alternateContact" value={formData.alternateContact} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Alternate Contact Number" />
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="City / Location *" />
              </div>
              <input required type="text" name="branchAddress" value={formData.branchAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Branch / Site Address *" />
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiCpu className="text-[#10AFA5]" /> 2. ATM Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="atmType" value={formData.atmType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">ATM Type *</option>
                {atmTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select required name="atmBrand" value={formData.atmBrand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">ATM Brand / OEM *</option>
                {atmBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <input type="text" name="atmModelNumber" value={formData.atmModelNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="ATM Model Number (optional)" />
              <input required type="text" name="atmTerminalId" value={formData.atmTerminalId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="ATM ID / Terminal ID *" />
              <input type="text" name="atmSerialNumber" value={formData.atmSerialNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="ATM Serial Number (optional)" />
              <input required type="number" name="numberOfAtms" value={formData.numberOfAtms} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Number of ATMs at location *" />
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiTool className="text-[#10AFA5]" /> 3. Service Type Required</h3>
            <div className="space-y-4">
              <select required name="serviceRequired" value={formData.serviceRequired} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Service Required *</option>
                {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select required name="isAtmWorking" value={formData.isAtmWorking} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">Is ATM currently working? *</option>
                  <option value="Yes">Yes</option>
                  <option value="Partial">Partial</option>
                  <option value="No — completely down">No — completely down</option>
                </select>
                <select required name="typeOfFault" value={formData.typeOfFault} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">Type of Fault *</option>
                  {faultTypes.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <textarea required name="issueDescription" value={formData.issueDescription} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Issue / Fault Description *"></textarea>
              <input type="text" name="errorCode" value={formData.errorCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Error Code shown on ATM (if any)" />
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiActivity className="text-[#10AFA5]" /> 4. ATM Status & History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="issueStartTime" value={formData.issueStartTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">When did the issue start? *</option>
                {issueStarts.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <select required name="atmServiceStatus" value={formData.atmServiceStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">ATM Status *</option>
                <option value="In service">In service</option>
                <option value="Out of service">Out of service</option>
                <option value="Intermittent">Intermittent</option>
              </select>
              <select required name="isCashLoaded" value={formData.isCashLoaded} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Is cash loaded in ATM currently? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="underWarranty" value={formData.underWarranty} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Under warranty? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </select>
              
              <div>
                <label className="text-xs text-gray-500 mb-1 block px-1">Last Maintenance Done</label>
                <input type="date" name="lastMaintenanceDone" value={formData.lastMaintenanceDone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" />
              </div>
              <select required name="existingAmc" value={formData.existingAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none self-end">
                <option value="">Existing AMC / Service contract? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {formData.existingAmc === 'Yes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in">
                <input type="text" name="contractProviderName" value={formData.contractProviderName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Contract Provider Name" />
                <div>
                  <label className="text-xs text-gray-500 mb-1 block px-1">Contract Expiry Date</label>
                  <input type="date" name="contractExpiryDate" value={formData.contractExpiryDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" />
                </div>
              </div>
            )}
          </div>

          {/* Section 5 */}
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
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <select required name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-[#E8F5F1] text-[#10AFA5] border border-[#10AFA5] font-bold rounded-xl outline-none">
                <option value="">Urgency *</option>
                {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input type="text" name="siteContactName" value={formData.siteContactName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Person Name" />
              <input type="tel" name="siteContactNumber" value={formData.siteContactNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Number" />
              <select required name="siteSecurityAvailable" value={formData.siteSecurityAvailable} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Security / access available at site? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <input required type="text" name="specialEntryRequirement" value={formData.specialEntryRequirement} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Any special entry requirement? (Yes-describe / No) *" />
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiDollarSign className="text-[#10AFA5]" /> 6. Additional Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="needCompletionReport" value={formData.needCompletionReport} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Do you need job completion report? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needSpareParts" value={formData.needSpareParts} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need spare parts replacement if required? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Depends on cost">Depends on cost</option>
              </select>
              <select required name="interestedInAmc" value={formData.interestedInAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Interested in AMC after service? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Already have">Already have</option>
              </select>
              <select required name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Budget Range *</option>
                {budgets.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select required name="source" value={formData.source} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">How did you hear about us? *</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Google">Google</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="2" className="w-full mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Additional Notes"></textarea>
          </div>

          {/* Section 7 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><FiUploadCloud className="text-[#10AFA5]" /> 7. Attachments (optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Upload ATM Error Screenshots, Photos/Videos, AMC Contract, or Warranty Cards.</p>
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
            <p className="text-center text-xs text-gray-500 mt-3">Our engineer will contact you within 1 hour.</p>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default AtmServiceEnquiry;
