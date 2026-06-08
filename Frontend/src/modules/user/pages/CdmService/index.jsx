import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiCpu, FiTool, FiActivity, FiClock, FiFileText
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const CdmService = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Section 1
    fullName: '', organizationName: '', branchNameCode: '', designation: '', email: '', phone: '', alternateContact: '', city: '', branchAddress: '',
    // Section 2
    cdmBrand: '', cdmModelNumber: '', terminalId: '', cdmType: '', numberOfMachines: '',
    // Section 3
    serviceRequired: '', machineStatus: '', errorCode: '', issueDescription: '', issueStartTime: '',
    // Section 4
    cashStuck: '', cashAmountStuck: '', lastReconciliation: '', lastMaintenance: '', existingAmc: '', amcProviderDetails: '', underWarranty: '',
    // Section 5
    preferredVisitDate: '', preferredTimeSlot: '', urgency: '', siteContactName: '', siteContactNumber: '', securityAvailable: '',
    // Section 6
    needCompletionReport: '', needReconciliationDoc: '', interestedInAmc: '', budgetRange: '', source: '', additionalNotes: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Dropdowns
  const brands = ['NCR', 'Diebold Nixdorf', 'Wincor', 'GRG Banking', 'Hitachi', 'Other (specify)'];
  const types = ['Cash Deposit Machine (CDM)', 'Cash Recycler Machine (CRM)', 'Bulk Note Acceptor (BNA)', 'Coin Deposit Machine', 'Other'];
  const services = ['Breakdown / Machine not working', 'Cash jammed inside machine', 'Note rejection issue', 'Counting / reconciliation error', 'Receipt printer issue', 'Screen / display issue', 'Network / connectivity issue', 'Preventive maintenance', 'Hardware replacement', 'Software / firmware update', 'New machine installation', 'Machine relocation', 'Decommissioning', 'AMC'];
  const statuses = ['In service', 'Out of service', 'Intermittent'];
  const startTimes = ['Just now', 'Today', 'Yesterday', '2–3 days ago', 'More than a week'];
  const timeSlots = ['Morning 9–12', 'Afternoon 12–4', 'Evening 4–7', 'Anytime'];
  const urgencies = ['Emergency — cash stuck / branch operations affected', 'Same day', 'Within 24 hours', 'Within 2–3 days', 'Flexible'];
  const budgets = ['To be discussed', 'Below ₹10,000', '₹10,000–₹30,000', 'Above ₹30,000'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

      const res = await api.post('/public/cdmservice-enquiries', finalData);
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
          <p className="text-gray-600 mb-8">Our CDM service engineer will contact you within 1 hour.</p>
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
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">CDM / CRM Service</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><FiCpu className="text-2xl text-[#10AFA5]" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cash Deposit Machine</h2>
            <p className="text-gray-600 text-sm">Expert repair, jam clearance, and AMC for all CDMs & CRMs.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1: Client Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8F5F1] p-6 border-l-4 border-l-[#10AFA5]">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiMapPin className="text-[#10AFA5]" /> 1. Client & Branch Info</h3>
            <div className="space-y-4">
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Full Name *" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="organizationName" value={formData.organizationName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Bank / Organization Name *" />
                <input required type="text" name="branchNameCode" value={formData.branchNameCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Branch Name & Code *" />
              </div>
              <input required type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Designation (e.g. Branch Manager / Cash Custodian) *" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Email Address *" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Phone / WhatsApp *" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="tel" name="alternateContact" value={formData.alternateContact} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Alternate Contact" />
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="City / Location *" />
              </div>
              <input required type="text" name="branchAddress" value={formData.branchAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Branch / Site Address *" />
            </div>
          </div>

          {/* Section 2: CDM Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiCpu className="text-[#10AFA5]" /> 2. Machine Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="cdmBrand" value={formData.cdmBrand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Brand / OEM *</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select required name="cdmType" value={formData.cdmType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Machine Type *</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input required type="text" name="terminalId" value={formData.terminalId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Terminal ID / Machine ID *" />
              <input type="text" name="cdmModelNumber" value={formData.cdmModelNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Model Number (optional)" />
              <input required type="number" name="numberOfMachines" value={formData.numberOfMachines} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Number of machines at location *" />
            </div>
          </div>

          {/* Section 3: Service Requirements */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiTool className="text-[#10AFA5]" /> 3. Service Type Required</h3>
            <div className="space-y-4">
              <select required name="serviceRequired" value={formData.serviceRequired} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Service Required *</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select required name="machineStatus" value={formData.machineStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">Current Machine Status *</option>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select required name="issueStartTime" value={formData.issueStartTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">When did issue start? *</option>
                  {startTimes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <input type="text" name="errorCode" value={formData.errorCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Error code shown (if any)" />
              <textarea required name="issueDescription" value={formData.issueDescription} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Issue Description *"></textarea>
            </div>
          </div>

          {/* Section 4: Machine Status (Cash/History) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiActivity className="text-[#10AFA5]" /> 4. Machine Status & History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="cashStuck" value={formData.cashStuck} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Is cash stuck inside machine? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {formData.cashStuck === 'Yes' && (
                <input type="text" name="cashAmountStuck" value={formData.cashAmountStuck} onChange={handleInputChange} className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none animate-fade-in placeholder-red-400" placeholder="Approx cash amount stuck (optional)" />
              )}
              
              <div>
                <label className="text-xs text-gray-500 mb-1 block px-1">Last reconciliation done</label>
                <input type="date" name="lastReconciliation" value={formData.lastReconciliation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" />
                <button type="button" onClick={() => setFormData(p => ({ ...p, lastReconciliation: "Don't remember" }))} className="text-xs text-[#10AFA5] mt-1 ml-1 hover:underline">Set to "Don't remember"</button>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block px-1">Last maintenance done</label>
                <input type="date" name="lastMaintenance" value={formData.lastMaintenance} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" />
                <button type="button" onClick={() => setFormData(p => ({ ...p, lastMaintenance: "Don't remember" }))} className="text-xs text-[#10AFA5] mt-1 ml-1 hover:underline">Set to "Don't remember"</button>
              </div>

              <select required name="existingAmc" value={formData.existingAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Existing AMC? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {formData.existingAmc === 'Yes' && (
                <input type="text" name="amcProviderDetails" value={formData.amcProviderDetails} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none animate-fade-in" placeholder="Provider Name & Expiry Date *" required />
              )}

              <select required name="underWarranty" value={formData.underWarranty} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Under warranty? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
          </div>

          {/* Section 5: Visit */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiClock className="text-[#10AFA5]" /> 5. Visit & Logistics</h3>
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
              <input required type="text" name="siteContactName" value={formData.siteContactName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Person Name *" />
              <input required type="tel" name="siteContactNumber" value={formData.siteContactNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Number *" />
              <select required name="securityAvailable" value={formData.securityAvailable} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Security / custodian available? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Section 6: Additional */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiFileText className="text-[#10AFA5]" /> 6. Additional Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="needCompletionReport" value={formData.needCompletionReport} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need job completion report? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needReconciliationDoc" value={formData.needReconciliationDoc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Need cash reconciliation document? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="interestedInAmc" value={formData.interestedInAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Interested in AMC? *</option>
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

          {/* Section 7: Attachments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><FiUploadCloud className="text-[#10AFA5]" /> 7. Attachments (optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Upload Error Screenshots, Photos/Videos of issue, or AMC Documents.</p>
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

export default CdmService;
