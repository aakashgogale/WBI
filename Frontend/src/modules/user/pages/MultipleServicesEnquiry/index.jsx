import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheckCircle, FiUploadCloud, FiX, 
  FiMapPin, FiBox, FiLayers, FiCpu, FiClock, FiDollarSign
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../../services/api';
import BottomNav from '../../components/layout/BottomNav';

const MultipleServicesEnquiry = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Section 1
    fullName: '', companyName: '', email: '', phone: '', designation: '', city: '', siteAddress: '',
    // Section 2
    servicesNeeded: [], priorityService: '', servicesDescription: '',
    // Section 3
    siteType: '', numberOfSites: '', siteSize: '', numberOfFloors: '', siteOperational: '',
    // Section 4
    equipmentInvolved: [], approximateTotalDevices: '', equipmentBrand: '',
    // Section 5
    preferredSiteVisitDate: '', preferredTimeSlot: '', siteContactName: '', siteContactNumber: '', projectUrgency: '',
    // Section 6
    budgetRange: '', needCombinedAmc: '', needSinglePointOfContact: '', source: '', additionalNotes: ''
  });

  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState(false);

  // Dropdowns
  const availableServices = ['Installation & Dismantle', 'Preventive Maintenance', 'Breakdown Call / Emergency Repair', 'Site Testing', 'Panel Installation', 'Automated Power Monitoring'];
  const priorities = ['Installation & Dismantle', 'Preventive Maintenance', 'Breakdown Call', 'Site Testing', 'Panel Installation', 'Automated Power Monitoring', 'All equally urgent'];
  
  const siteTypes = ['Office / Corporate', 'Warehouse / Godown', 'Residential / Society', 'Hospital / Clinic', 'Bank / ATM', 'School / College', 'Factory / Plant', 'Government / PSU', 'Other'];
  const equipments = ['CCTV / DVR / NVR', 'Access Control / Biometric', 'Fire Alarm Panel', 'Intrusion Alarm', 'Boom Barrier', 'Network / Cabling', 'Power Panels', 'Other (specify)'];
  
  const timeSlots = ['Morning 9–12', 'Afternoon 12–4', 'Evening 4–7'];
  const urgencies = ['Emergency — within 48 hrs', 'Within 1 week', 'Within 1 month', 'Flexible / phased execution'];
  const budgets = ['Below ₹25,000', '₹25,000 – ₹75,000', '₹75,000 – ₹2,00,000', 'Above ₹2,00,000', 'To be discussed'];

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

      const res = await api.post('/public/multipleservices-enquiries', finalData);
      if (res.data.success) {
        setSuccess(true);
        toast.success('Multiple Services Enquiry submitted successfully!');
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
          <p className="text-gray-600 mb-8">Our multi-service coordination team will contact you shortly to align all your security requirements.</p>
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
          <h1 className="text-lg font-bold text-gray-800 truncate px-2">Multiple Services</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#E8F5F1] to-[#D1EBE5] px-6 py-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm"><FiLayers className="text-2xl text-[#10AFA5]" /></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Comprehensive Solutions</h2>
            <p className="text-gray-600 text-sm">Bundle multiple security services into a single, cohesive request.</p>
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
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiLayers className="text-blue-500" /> 2. Services Required</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select All Services Needed *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableServices.map(s => (
                  <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.servicesNeeded.includes(s) ? 'border-[#10AFA5] bg-[#F4FBFB]' : 'border-gray-200'}`}>
                    <input type="checkbox" checked={formData.servicesNeeded.includes(s)} onChange={() => toggleArrayItem('servicesNeeded', s)} className="w-4 h-4 text-[#10AFA5] rounded" />
                    <span className={`ml-3 text-sm ${formData.servicesNeeded.includes(s) ? 'font-medium text-[#10AFA5]' : 'text-gray-700'}`}>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <select required name="priorityService" value={formData.priorityService} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Priority Service (Most urgent) *</option>
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <textarea name="servicesDescription" value={formData.servicesDescription} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Brief description of each service needed..."></textarea>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiBox className="text-purple-500" /> 3. Site Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="siteType" value={formData.siteType} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Site Type *</option>
                {siteTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input required type="text" name="numberOfSites" value={formData.numberOfSites} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Number of Sites (Single/Multiple/How many?) *" />
              <input required type="text" name="siteSize" value={formData.siteSize} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Site Size / Area *" />
              <input required type="number" name="numberOfFloors" value={formData.numberOfFloors} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Number of Floors *" />
              <select required name="siteOperational" value={formData.siteOperational} onChange={handleInputChange} className="w-full md:col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Is site currently operational? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiCpu className="text-orange-500" /> 4. Equipment Overview</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Equipment involved *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {equipments.map(s => (
                  <label key={s} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${formData.equipmentInvolved.includes(s) ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                    <input type="checkbox" checked={formData.equipmentInvolved.includes(s)} onChange={() => toggleArrayItem('equipmentInvolved', s)} className="w-4 h-4 text-orange-500 rounded" />
                    <span className={`ml-3 text-sm ${formData.equipmentInvolved.includes(s) ? 'font-medium text-orange-800' : 'text-gray-700'}`}>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="number" name="approximateTotalDevices" value={formData.approximateTotalDevices} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Approx. total number of devices *" />
              <input type="text" name="equipmentBrand" value={formData.equipmentBrand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Equipment Brand / Make" />
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiClock className="text-red-500" /> 5. Visit & Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Preferred Visit Date</label>
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
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600 block mb-1">Overall Project Urgency *</label>
                <select required name="projectUrgency" value={formData.projectUrgency} onChange={handleInputChange} className="w-full px-4 py-3 bg-red-50 text-red-900 border border-red-300 rounded-xl font-bold focus:ring-[#10AFA5] outline-none">
                  <option value="">Select Urgency</option>
                  {urgencies.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2"><FiDollarSign className="text-green-500" /> 6. Budget & Additional Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required name="budgetRange" value={formData.budgetRange} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Overall Budget Range *</option>
                {budgets.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select required name="needCombinedAmc" value={formData.needCombinedAmc} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Need combined AMC for all services? *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Want to discuss">Want to discuss</option>
              </select>
              <select required name="needSinglePointOfContact" value={formData.needSinglePointOfContact} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none">
                <option value="">Need single point of contact? *</option>
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
            <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="2" className="w-full mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#10AFA5] outline-none" placeholder="Additional Notes / Special Requirements"></textarea>
          </div>

          {/* Section 7 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><FiUploadCloud className="text-gray-500" /> 7. Attachments (optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Upload Site Layouts, Equipment Lists, Photos, or Reference Docs.</p>
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
                <><FiLayers className="text-xl" /> Submit Enquiry</>
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

export default MultipleServicesEnquiry;
