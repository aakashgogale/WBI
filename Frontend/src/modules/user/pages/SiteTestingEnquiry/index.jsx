import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiBox, FiCrosshair, FiFileText, FiClock, FiDollarSign, FiSearch
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const SiteTestingEnquiry = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Section 1
    fullName: '', companyName: '', email: '', phone: '', designation: '', city: '', siteAddress: '',
    // Section 2
    siteType: '', siteSize: '', numberOfFloors: '', siteOperational: '', installationType: '',
    // Section 3
    testingType: [], totalPointsToTest: '', equipmentBrand: '', purposeOfTesting: '',
    // Section 4
    installedBy: '', systemWorkingStatus: '', focusArea: '', needBlindSpotAnalysis: '', needNetworkTesting: '', needRemoteAccessTesting: '', needNightVisionTesting: '',
    // Section 5
    needWrittenReport: '', reportFormat: '', needPhotoEvidence: '', needPassFailStatus: '', needRecommendations: '', reportForCompliance: '',
    // Section 6
    preferredVisitDate: '', preferredTimeSlot: '', siteContactName: '', siteContactNumber: '', accessRestrictions: '', someoneAvailable: '', projectUrgency: '',
    // Section 7
    budgetRange: '', interestedInAmc: '', source: '', additionalNotes: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Dropdowns
  const siteTypes = ['Office / Corporate', 'Warehouse / Godown', 'Residential / Society', 'Hospital / Clinic', 'Bank / ATM', 'School / College', 'Retail Shop / Mall', 'Factory / Plant', 'Government / PSU', 'Other'];
  const siteSizes = ['Small — below 1,000 sq ft', 'Medium — 1,000 – 5,000 sq ft', 'Large — 5,000 – 20,000 sq ft', 'Very Large — 20,000+ sq ft', 'Not sure'];
  const testTypes = ['CCTV Coverage & Angle Testing', 'DVR / NVR Recording Test', 'Access Control Functionality Test', 'Biometric Device Testing', 'Fire Alarm System Test', 'Intrusion Alarm Test', 'Network / LAN Cable Testing', 'Power Supply & UPS Testing', 'Boom Barrier / Flap Barrier Test', 'Video Door Phone Test', 'Remote Access / Mobile View Test', 'Full System Integration Test', 'Not sure — need expert assessment'];
  const testPurposes = ['New Installation Verification', 'Routine Checkup / Audit', 'Compliance / Certification', 'Before AMC Renewal', 'Performance Issue Check', 'Handover Inspection', 'Insurance / Legal Requirement', 'Other'];
  const timeSlots = ['Morning 9–12', 'Afternoon 12–4', 'Evening 4–7'];
  const urgencies = ['ASAP', 'Within 1 week', 'Within 2 weeks', 'Flexible'];
  const budgets = ['Below ₹3,000', '₹3,000 – ₹8,000', '₹8,000 – ₹20,000', 'Above ₹20,000', 'To be discussed'];

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

      const res = await api.post('/public/sitetesting-enquiries', finalData);
      if (res.data.success) {
        setSuccess(true);
        toast.success('Site Testing Enquiry submitted successfully!');
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
          <p className="text-gray-600 mb-8">Our testing & audit team will contact you within 24 hours to schedule the visit.</p>
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
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">Site Testing & Audit</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><FiCrosshair className="text-2xl text-[#10AFA5]" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Site Testing</h2>
            <p className="text-gray-600 text-sm">Comprehensive assessment and health checks for your security systems.</p>
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
                <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Designation / Role" />
                <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="City / Location *" />
              </div>
              <input required type="text" name="siteAddress" value={formData.siteAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Complete Site Address *" />
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
                <option value="">Site Size / Area *</option>
                {siteSizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input required type="number" name="numberOfFloors" value={formData.numberOfFloors} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Number of Floors *" />
              <select required name="siteOperational" value={formData.siteOperational} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Is site currently operational? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="installationType" value={formData.installationType} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Is this a new installation or existing setup? *</option>
                <option value="New">New Installation</option>
                <option value="Existing">Existing Setup</option>
                <option value="Both">Both (Expanding existing setup)</option>
              </select>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiCrosshair className="text-red-500" /> 3. Testing Requirements</h3>
            <label className="block text-sm font-medium mb-2">Type of Testing Required *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {testTypes.map(s => (
                <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.testingType.includes(s) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={formData.testingType.includes(s)} onChange={() => toggleArrayItem('testingType', s)} className="w-4 h-4 text-[#10AFA5] rounded" />
                  <span className={`ml-3 text-sm ${formData.testingType.includes(s) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{s}</span>
                </label>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input required type="number" name="totalPointsToTest" value={formData.totalPointsToTest} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Total Number of Points / Devices to Test *" />
              <input required type="text" name="equipmentBrand" value={formData.equipmentBrand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Equipment Brand / Make *" />
            </div>

            <select required name="purposeOfTesting" value={formData.purposeOfTesting} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
              <option value="">Purpose of Testing *</option>
              {testPurposes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiSearch className="text-[#10AFA5]" /> 4. Testing Scope</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="installedBy" value={formData.installedBy} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Who installed the current system? *</option>
                <option value="WBI">WBI</option>
                <option value="Other vendor">Other vendor</option>
                <option value="In-house">In-house</option>
                <option value="Not sure">Not sure</option>
              </select>
              <select required name="systemWorkingStatus" value={formData.systemWorkingStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Is system currently working? *</option>
                <option value="Yes fully">Yes fully</option>
                <option value="Partial issues">Partial issues</option>
                <option value="No">No</option>
              </select>
            </div>
            
            <textarea name="focusArea" value={formData.focusArea} onChange={handleInputChange} rows="2" className="w-full mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Any specific area / zone to focus on? (e.g. entrance gate, server room, parking)"></textarea>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <select required name="needBlindSpotAnalysis" value={formData.needBlindSpotAnalysis} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Do you need blind spot / gap analysis? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needNetworkTesting" value={formData.needNetworkTesting} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Do you need network performance testing? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select required name="needRemoteAccessTesting" value={formData.needRemoteAccessTesting} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Do you need remote access testing? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not applicable">Not applicable</option>
              </select>
              <select required name="needNightVisionTesting" value={formData.needNightVisionTesting} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Do you need night vision / IR testing? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not applicable">Not applicable</option>
              </select>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiFileText className="text-blue-500" /> 5. Report Requirements</h3>
            <div className="space-y-4">
              <select required name="needWrittenReport" value={formData.needWrittenReport} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Do you need a written test report? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              
              {formData.needWrittenReport === 'Yes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in border p-4 rounded-xl border-blue-100 bg-blue-50">
                  <select required name="reportFormat" value={formData.reportFormat} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl">
                    <option value="">Report format required *</option>
                    <option value="Soft copy — PDF / Email">Soft copy — PDF / Email</option>
                    <option value="Hard copy — printed">Hard copy — printed</option>
                    <option value="Both">Both</option>
                    <option value="Not required">Not required</option>
                  </select>
                  <select required name="needPhotoEvidence" value={formData.needPhotoEvidence} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl">
                    <option value="">Need photographic evidence? *</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <select required name="needPassFailStatus" value={formData.needPassFailStatus} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl">
                    <option value="">Need pass / fail status per device? *</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <select required name="needRecommendations" value={formData.needRecommendations} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl">
                    <option value="">Need recommendations for improvements? *</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <select required name="reportForCompliance" value={formData.reportForCompliance} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl md:col-span-2">
                    <option value="">Is report needed for compliance / audit submission? *</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiClock className="text-purple-500" /> 6. Visit & Timeline</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="siteContactName" value={formData.siteContactName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Person Name" />
                <input type="text" name="siteContactNumber" value={formData.siteContactNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Site Contact Number" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" name="accessRestrictions" value={formData.accessRestrictions} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Access Restrictions? (Yes-describe / No) *" />
                <select required name="someoneAvailable" value={formData.someoneAvailable} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                  <option value="">Someone available to assist during testing? *</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <select required name="projectUrgency" value={formData.projectUrgency} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F4FBFB] text-gray-900 border border-gray-200 rounded-xl font-bold focus:ring-[#10AFA5] outline-none">
                <option value="">Project Urgency *</option>
                {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
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
              <select required name="interestedInAmc" value={formData.interestedInAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">After testing — interested in AMC? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Maybe">Maybe</option>
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
            <p className="text-sm text-gray-500 mb-4">Upload Floor Plans, Existing System Details, Previous Test Reports, or Compliance Docs.</p>
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
                <><FiCrosshair className="text-xl" /> Submit Enquiry</>
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

export default SiteTestingEnquiry;
