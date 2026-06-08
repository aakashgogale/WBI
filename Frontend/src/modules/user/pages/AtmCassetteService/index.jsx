import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiArchive, FiTool, FiDollarSign, FiClock, FiFileText
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const AtmCassetteService = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Section 1
    fullName: '', organizationName: '', employeeId: '', designation: '', email: '', phone: '', alternateContact: '', city: '', branchAddress: '',
    // Section 2
    atmBrand: '', atmModelNumber: '', atmTerminalId: '', numberOfCassettes: '', cassetteDenominations: [],
    // Section 3
    serviceRequired: '', cassetteStatus: '', errorCode: '', issueDescription: '',
    // Section 4
    cashLoadingRequired: '', cashAmount: '', cashProvider: '', craAgencyName: '', verificationNeeded: '',
    // Section 5
    preferredVisitDate: '', preferredTimeSlot: '', urgency: '', siteContactName: '', siteContactNumber: '', securityAvailable: '',
    // Section 6
    needBalancingReport: '', needReconciliation: '', interestedInContract: '', source: '', additionalNotes: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Dropdowns
  const atmBrands = ['NCR', 'Diebold Nixdorf', 'Wincor', 'GRG Banking', 'Nautilus Hyosung', 'Other'];
  const cassetteCounts = ['1', '2', '3', '4', 'More than 4'];
  const denominations = ['₹100', '₹200', '₹500', '₹2000', 'Reject Cassette', 'Retract Cassette'];
  const services = ['Cassette Loading / Replenishment', 'Cassette Repair / Replacement', 'Cassette Jamming Issue', 'Cassette Counting Error Fix', 'Cassette Alignment / Calibration', 'Cassette Cleaning', 'Full Cassette Replacement (new)', 'Cassette Balancing & Reconciliation'];
  const statuses = ['Empty — needs loading', 'Jammed — cash stuck', 'Showing error / miscount', 'Physically damaged', 'Working fine — routine service'];
  const timeSlots = ['Morning 9–12', 'Afternoon 12–4', 'Evening 4–7', 'Anytime'];
  const urgencies = ['Emergency — ATM completely empty / down', 'Same day', 'Within 24 hours', 'Scheduled — as per plan', 'Flexible'];
  const cashProviders = ['Bank', 'CRA Agency', 'Other'];

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

      const res = await api.post('/public/atmcassette-enquiries', finalData);
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
          <p className="text-gray-600 mb-8">Our ATM Cassette operations team will contact you within 1 hour.</p>
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
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">ATM Cassette Service</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><FiArchive className="text-2xl text-[#10AFA5]" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cassette Operations</h2>
            <p className="text-gray-600 text-sm">Professional loading, maintenance, and repair of ATM cassettes.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto p-4 -mt-4 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1: Client Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8F5F1] p-6 border-l-4 border-l-[#10AFA5]">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiMapPin className="text-[#10AFA5]" /> 1. Client Info</h3>
            <div className="space-y-4">
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Full Name *" />
              <input type="text" name="organizationName" value={formData.organizationName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Bank / Organization Name" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Employee ID / Staff Code (optional)" />
                <input required type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Designation (e.g. CRA) *" />
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

          {/* Section 2: ATM Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiArchive className="text-[#10AFA5]" /> 2. ATM & Cassette Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select required name="atmBrand" value={formData.atmBrand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">ATM Brand / OEM *</option>
                {atmBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <input type="text" name="atmModelNumber" value={formData.atmModelNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="ATM Model Number (optional)" />
              <input required type="text" name="atmTerminalId" value={formData.atmTerminalId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="ATM ID / Terminal ID *" />
              <select required name="numberOfCassettes" value={formData.numberOfCassettes} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Number of Cassettes *</option>
                {cassetteCounts.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">Cassette Denomination used (Select multiple)</label>
              <div className="grid grid-cols-2 gap-2">
                {denominations.map(s => (
                  <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.cassetteDenominations.includes(s) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={formData.cassetteDenominations.includes(s)} onChange={() => toggleArrayItem('cassetteDenominations', s)} className="w-4 h-4 text-[#10AFA5] rounded focus:ring-[#10AFA5]" />
                    <span className={`ml-3 text-sm ${formData.cassetteDenominations.includes(s) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{s}</span>
                  </label>
                ))}
              </div>
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
              <select required name="cassetteStatus" value={formData.cassetteStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Current Cassette Status *</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="text" name="errorCode" value={formData.errorCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Error Code shown (if any)" />
              <textarea name="issueDescription" value={formData.issueDescription} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Issue Description"></textarea>
            </div>
          </div>

          {/* Section 4: Cash Details */}
          {formData.serviceRequired.includes('Loading') && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiDollarSign className="text-[#10AFA5]" /> 4. Cash Details (For Loading)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select required name="cashLoadingRequired" value={formData.cashLoadingRequired} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">Cash loading required? *</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <input type="text" name="cashAmount" value={formData.cashAmount} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none" placeholder="Cash amount to be loaded (optional)" />
                <select required name="cashProvider" value={formData.cashProvider} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">Who will provide cash for loading? *</option>
                  {cashProviders.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {formData.cashProvider === 'CRA Agency' && (
                  <input type="text" name="craAgencyName" value={formData.craAgencyName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none animate-fade-in" placeholder="CRA Agency Name *" required />
                )}
                <select required name="verificationNeeded" value={formData.verificationNeeded} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                  <option value="">Is cash counting / verification needed before loading? *</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          )}

          {/* Section 5: Visit */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiClock className="text-[#10AFA5]" /> {formData.serviceRequired.includes('Loading') ? '5' : '4'}. Visit & Urgency</h3>
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
              <select required name="securityAvailable" value={formData.securityAvailable} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Security / Custodian available at time of visit? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Section 6: Additional */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiFileText className="text-[#10AFA5]" /> {formData.serviceRequired.includes('Loading') ? '6' : '5'}. Additional Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="needBalancingReport" value={formData.needBalancingReport} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Do you need cassette balancing report? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needReconciliation" value={formData.needReconciliation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Do you need reconciliation document? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="interestedInContract" value={formData.interestedInContract} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
                <option value="">Interested in regular cassette maintenance contract? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Already have">Already have</option>
              </select>
              <select required name="source" value={formData.source} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10AFA5] outline-none">
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
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><FiUploadCloud className="text-[#10AFA5]" /> {formData.serviceRequired.includes('Loading') ? '7' : '6'}. Attachments (optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Upload Cassette Error Screenshots, ATM Journal/Log, or Previous Cassette Reports.</p>
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
            <p className="text-center text-xs text-gray-500 mt-3">Our team will contact you within 1 hour.</p>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default AtmCassetteService;
