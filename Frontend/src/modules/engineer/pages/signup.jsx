import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLock, FiCheckCircle, FiArrowRight, FiArrowLeft, FiChevronLeft, FiUpload, FiX, FiBriefcase, FiTool, FiCalendar, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { engineerAuthService } from '../../../services/authService';
import Logo from '../../../components/common/Logo';

// Constants for Dropdowns
const PRIMARY_SKILLS = [
  'CCTV / Surveillance Systems', 'Access Control Systems', 'Fire Alarm & Safety',
  'Networking & Structured Cabling', 'ATM Service & Banking Equipment', 'UPS / Battery Systems',
  'Diesel Generator Service', 'AC / HVAC Systems', 'Electrical / Panel Work',
  'Biomedical Equipment', 'EV Charging Systems', 'POS / Barcode / Peripherals',
  'Software / IT Support', 'Other'
];

const EXPERIENCE_LEVELS = ['Fresher (0–1 year)', 'Junior (1–3 years)', 'Mid-level (3–6 years)', 'Senior (6–10 years)', 'Expert (10+ years)'];
const EDUCATION_LEVELS = ['10th Pass', '12th Pass', 'ITI / Diploma', 'B.Tech / B.E.', 'B.Sc / B.Com / B.A.', 'M.Tech / M.E.', 'MBA / MCA', 'Other'];
const REGISTRATION_TYPES = ['Individual Engineer / Technician', 'Company / Firm Employee', 'Freelancer'];
const HEARD_ABOUT = ['Social Media', 'Company / Employer referred', 'Friend / Colleague', 'Google Search', 'Other'];

export default function EngineerSignup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // === ENGINEER STATE ===
  const [engData, setEngData] = useState({
    name: '', profilePhoto: null, dob: '', gender: '',
    phone: '', isPhoneVerified: false, whatsappNumber: '', emergencyContactNumber: '',
    email: '', isEmailVerified: false,
    city: '', state: '', pincode: '',
    registrationType: 'Individual Engineer / Technician',
    companyDetails: { companyName: '', companyRegNumber: '', employeeId: '', designation: '', reportingManager: '', companyContact: '', companyEmailDomain: '', companyId: null },
    primarySkill: '', secondarySkills: [], totalExperienceYears: '', experienceLevel: '',
    canWorkIndependently: true, willingToTravel: true, preferredWorkType: 'Both',
    aadhaarNumber: '', aadhaarFront: null, aadhaarBack: null,
    panNumber: '', panPhoto: null, highestEducation: '', fieldOfStudy: '',
    skillCertificates: [], governmentCertifications: [],
    username: '', password: '', confirmPassword: '', preferredLoginMethod: 'Both',
    referralCode: '', heardAboutWbi: '',
    acceptTerms: false
  });


  // Handlers for Engineer Form
  const handleEngChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEngData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEngCompanyChange = (e) => {
    const { name, value } = e.target;
    setEngData(prev => ({ ...prev, companyDetails: { ...prev.companyDetails, [name]: value } }));
  };

  const handleEngFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEngData(prev => ({ ...prev, [field]: reader.result }));
    reader.readAsDataURL(file);
  };

  const addCertificate = () => {
    setEngData(prev => ({
      ...prev,
      skillCertificates: [...prev.skillCertificates, { name: '', issuingAuthority: '', issueDate: '', expiryDate: '', documentUrl: null }]
    }));
  };

  const updateCertificate = (index, field, value) => {
    const newCerts = [...engData.skillCertificates];
    newCerts[index][field] = value;
    setEngData(prev => ({ ...prev, skillCertificates: newCerts }));
  };

  const uploadCertificateDoc = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateCertificate(index, 'documentUrl', reader.result);
    reader.readAsDataURL(file);
  };

  // OTP Verification Logic
  const verifyPhone = async () => {
    if (!engData.phone || engData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await engineerAuthService.sendOTP(engData.phone);
      if (res.success) {
        toast.success('OTP sent successfully');
        setShowOtpField(true);
      } else {
        toast.error(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const confirmOtp = async () => {
    if (!otpValue || otpValue.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await engineerAuthService.verifyLogin({ phone: engData.phone, otp: otpValue });
      if (res.success) {
        toast.success('Phone verified successfully');
        setEngData(prev => ({ ...prev, isPhoneVerified: true }));
        setShowOtpField(false);
      } else {
        toast.error(res.message || 'Invalid OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Mock for email until email OTP is supported backend
  const verifyEmail = () => { toast.success('Email verified'); setEngData(prev => ({ ...prev, isEmailVerified: true })); };

  // Validation
  const validateStep = (step) => {
    if (step === 1) {
      if (!engData.name || !engData.dob || !engData.phone || !engData.email || !engData.city || !engData.emergencyContactNumber) return false;
      if (!engData.isPhoneVerified || !engData.isEmailVerified) {
        toast.error("Please verify Phone and Email first");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!engData.primarySkill || !engData.totalExperienceYears || !engData.experienceLevel) return false;
      return true;
    }
    if (step === 3) {
      if (!engData.aadhaarNumber || !engData.aadhaarFront || !engData.aadhaarBack || !engData.panNumber || !engData.panPhoto) return false;
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
    else toast.error("Please fill all mandatory fields.");
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  // Submission
  const submitEngineer = async () => {
    if (!engData.acceptTerms) return toast.error("Please accept Terms & Privacy Policy");
    if (engData.password !== engData.confirmPassword) return toast.error("Passwords do not match");
    if (engData.password.length < 8) return toast.error("Password must be at least 8 characters");

    setIsSubmitting(true);
    try {
      // Build payload matching backend
      const payload = {
        name: engData.name, email: engData.email, phone: engData.phone, password: engData.password,
        dob: engData.dob, gender: engData.gender,
        registrationType: engData.registrationType,
        companyDetails: engData.companyDetails,
        whatsappNumber: engData.whatsappNumber,
        emergencyContactNumber: engData.emergencyContactNumber,
        address: { city: engData.city, state: engData.state, pincode: engData.pincode },
        primarySkill: engData.primarySkill,
        secondarySkills: engData.secondarySkills,
        totalExperienceYears: parseInt(engData.totalExperienceYears),
        experienceLevel: engData.experienceLevel,
        canWorkIndependently: engData.canWorkIndependently,
        willingToTravel: engData.willingToTravel,
        preferredWorkType: engData.preferredWorkType,
        panNumber: engData.panNumber,
        highestEducation: engData.highestEducation,
        fieldOfStudy: engData.fieldOfStudy,
        skillCertificates: engData.skillCertificates,
        governmentCertifications: engData.governmentCertifications,
        username: engData.username || engData.name.toLowerCase().replace(/\s+/g, ''),
        preferredLoginMethod: engData.preferredLoginMethod,
        referralCode: engData.referralCode,
        heardAboutWbi: engData.heardAboutWbi,
        uploadedDocuments: [
          { key: 'Aadhaar Card Front', url: engData.aadhaarFront, backUrl: engData.aadhaarBack },
          { key: 'PAN Card Photo', url: engData.panPhoto }
        ]
      };

      const res = await engineerAuthService.register(payload);
      if (res.success) {
        toast.success("Registration Successful!");
        navigate('/engineer', { replace: true });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Registration failed";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white px-6 py-4 border-b flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <Logo />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => navigate('/worker/signup')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all text-gray-500 hover:text-gray-700`}
          >
            Worker
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white text-[#4F46E5] shadow-sm`}
          >
            Engineer
          </button>
        </div>
        <Link to="/engineer/login" className="text-sm font-semibold text-[#4F46E5] hover:text-[#4338ca]">Sign In</Link>
      </nav>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${currentStep >= step ? 'bg-[#4F46E5] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {step}
                  </div>
                  {step < 4 && <div className={`w-10 sm:w-20 h-1 mx-2 rounded-full ${currentStep > step ? 'bg-[#4F46E5]' : 'bg-gray-100'}`} />}
                </div>
              ))}
            </div>

            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <h2 className="text-xl font-bold">Step 1: Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                    <input name="name" value={engData.name} onChange={handleEngChange} type="text" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth * (18+)</label>
                    <input name="dob" value={engData.dob} onChange={handleEngChange} type="date" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  
                  {/* Phone with inline verification */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Primary Phone *</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input name="phone" value={engData.phone} onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setEngData(prev => ({ ...prev, phone: val, isPhoneVerified: false }));
                          setShowOtpField(false);
                        }} type="tel" className="w-full border rounded-lg p-2 text-sm" disabled={engData.isPhoneVerified} placeholder="10-digit number" />
                        {!engData.isPhoneVerified && !showOtpField && <button onClick={verifyPhone} disabled={otpLoading} className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap disabled:opacity-50">{otpLoading ? 'Sending...' : 'Verify'}</button>}
                        {engData.isPhoneVerified && <span className="text-green-500 flex items-center"><FiCheckCircle/></span>}
                      </div>
                      
                      {showOtpField && !engData.isPhoneVerified && (
                        <div className="flex gap-2 mt-1 animate-fadeIn">
                          <input 
                            type="text" 
                            value={otpValue} 
                            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                            placeholder="Enter OTP" 
                            className="w-full border rounded-lg p-2 text-sm border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20" 
                          />
                          <button onClick={confirmOtp} disabled={otpLoading} className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap disabled:opacity-50">
                            {otpLoading ? 'Verifying...' : 'Confirm'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Email with inline verification */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
                    <div className="flex gap-2">
                      <input name="email" value={engData.email} onChange={handleEngChange} type="email" className="w-full border rounded-lg p-2 text-sm" disabled={engData.isEmailVerified} />
                      {!engData.isEmailVerified && <button onClick={verifyEmail} className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">Verify</button>}
                      {engData.isEmailVerified && <span className="text-green-500 flex items-center"><FiCheckCircle/></span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <input name="whatsappNumber" value={engData.whatsappNumber} onChange={handleEngChange} type="text" className="w-full border rounded-lg p-2 text-sm" placeholder="Same as primary if empty" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Emergency Contact Number *</label>
                    <input name="emergencyContactNumber" value={engData.emergencyContactNumber} onChange={handleEngChange} type="tel" className="w-full border rounded-lg p-2 text-sm" placeholder="For field emergencies" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
                    <select name="gender" value={engData.gender} onChange={handleEngChange} className="w-full border rounded-lg p-2 text-sm">
                      <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                    <input name="city" value={engData.city} onChange={handleEngChange} type="text" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
                    <input name="state" value={engData.state} onChange={handleEngChange} type="text" className="w-full border rounded-lg p-2 text-sm" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Registration Type *</label>
                    <select name="registrationType" value={engData.registrationType} onChange={handleEngChange} className="w-full border rounded-lg p-2 text-sm bg-blue-50 border-blue-200">
                      {REGISTRATION_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                    </select>
                  </div>
                </div>

                {/* Conditional Company Fields */}
                {engData.registrationType === 'Company / Firm Employee' && (
                  <div className="bg-gray-50 p-4 rounded-xl border space-y-4">
                    <h3 className="font-semibold text-gray-800 text-sm">Company Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input name="companyName" value={engData.companyDetails.companyName} onChange={handleEngCompanyChange} placeholder="Company / Firm Name" className="w-full border rounded-lg p-2 text-sm" />
                      <input name="employeeId" value={engData.companyDetails.employeeId} onChange={handleEngCompanyChange} placeholder="Employee ID / Staff Code" className="w-full border rounded-lg p-2 text-sm" />
                      <input name="designation" value={engData.companyDetails.designation} onChange={handleEngCompanyChange} placeholder="Designation" className="w-full border rounded-lg p-2 text-sm" />
                      <input name="companyContact" value={engData.companyDetails.companyContact} onChange={handleEngCompanyChange} placeholder="Company Contact Number" className="w-full border rounded-lg p-2 text-sm" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Skills */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <h2 className="text-xl font-bold">Step 2: Skills & Experience</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Primary Skill / Trade *</label>
                    <select name="primarySkill" value={engData.primarySkill} onChange={handleEngChange} className="w-full border rounded-lg p-2 text-sm">
                      <option value="">Select Primary Skill</option>
                      {PRIMARY_SKILLS.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Total Years of Experience *</label>
                    <input name="totalExperienceYears" value={engData.totalExperienceYears} onChange={handleEngChange} type="number" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Experience Level *</label>
                    <select name="experienceLevel" value={engData.experienceLevel} onChange={handleEngChange} className="w-full border rounded-lg p-2 text-sm">
                      <option value="">Select Level</option>
                      {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Secondary Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {PRIMARY_SKILLS.map(skill => {
                        const isSelected = engData.secondarySkills.includes(skill);
                        if(skill === engData.primarySkill) return null; // Can't be primary and secondary
                        return (
                          <span 
                            key={skill}
                            onClick={() => {
                              setEngData(prev => ({
                                ...prev,
                                secondarySkills: isSelected 
                                  ? prev.secondarySkills.filter(s => s !== skill)
                                  : [...prev.secondarySkills, skill]
                              }))
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all border font-medium ${isSelected ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                          >
                            {skill}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="canWorkIndependently" checked={engData.canWorkIndependently} onChange={handleEngChange} /> Can work independently?</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="willingToTravel" checked={engData.willingToTravel} onChange={handleEngChange} /> Willing to travel for site visits?</label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Preferred work type</label>
                    <select name="preferredWorkType" value={engData.preferredWorkType} onChange={handleEngChange} className="w-full border rounded-lg p-2 text-sm">
                      <option>On-site</option><option>Remote</option><option>Both</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-bold">Step 3: Documents</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aadhaar */}
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Aadhaar Card *</label>
                    <input name="aadhaarNumber" value={engData.aadhaarNumber} onChange={handleEngChange} placeholder="12-digit Aadhaar Number" maxLength="12" className="w-full border rounded-lg p-2 text-sm mb-3" />
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Front Photo</label>
                        <input type="file" onChange={(e) => handleEngFileUpload(e, 'aadhaarFront')} className="text-xs w-full" accept="image/*" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Back Photo</label>
                        <input type="file" onChange={(e) => handleEngFileUpload(e, 'aadhaarBack')} className="text-xs w-full" accept="image/*" />
                      </div>
                    </div>
                  </div>

                  {/* PAN */}
                  <div className="bg-gray-50 p-4 rounded-xl border">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">PAN Card *</label>
                    <input name="panNumber" value={engData.panNumber} onChange={handleEngChange} placeholder="PAN Number" className="w-full border rounded-lg p-2 text-sm mb-3 uppercase" />
                    <input type="file" onChange={(e) => handleEngFileUpload(e, 'panPhoto')} className="text-xs w-full" accept="image/*" />
                  </div>

                  {/* Education */}
                  <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Highest Education Qualification *</label>
                      <select name="highestEducation" value={engData.highestEducation} onChange={handleEngChange} className="w-full border rounded-lg p-2 text-sm">
                        <option value="">Select Education</option>
                        {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Field of Study / Branch</label>
                      <input name="fieldOfStudy" value={engData.fieldOfStudy} onChange={handleEngChange} placeholder="e.g. Electronics, Mechanical" className="w-full border rounded-lg p-2 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Certificates */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Skill / Trade Certificates</h3>
                    <button onClick={addCertificate} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-medium">+ Add Certificate</button>
                  </div>
                  {engData.skillCertificates.map((cert, index) => (
                    <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-white p-3 border rounded-lg relative">
                      <button onClick={() => setEngData(p => ({ ...p, skillCertificates: p.skillCertificates.filter((_, i) => i !== index)}))} className="absolute top-2 right-2 text-red-500"><FiX/></button>
                      <input value={cert.name} onChange={e => updateCertificate(index, 'name', e.target.value)} placeholder="Certificate Name" className="border rounded px-2 py-1 text-xs" />
                      <input value={cert.issuingAuthority} onChange={e => updateCertificate(index, 'issuingAuthority', e.target.value)} placeholder="Issuing Authority" className="border rounded px-2 py-1 text-xs" />
                      <input type="date" value={cert.issueDate} onChange={e => updateCertificate(index, 'issueDate', e.target.value)} title="Issue Date" className="border rounded px-2 py-1 text-xs" />
                      <input type="file" onChange={e => uploadCertificateDoc(index, e)} className="text-xs" accept="image/*,.pdf" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Account Setup */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fadeIn">
                <h2 className="text-xl font-bold">Step 4: Account Setup</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Username (auto-suggested) *</label>
                    <input name="username" value={engData.username || engData.name.toLowerCase().replace(/\s+/g, '')} onChange={handleEngChange} type="text" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Login Method</label>
                    <select name="preferredLoginMethod" value={engData.preferredLoginMethod} onChange={handleEngChange} className="w-full border rounded-lg p-2 text-sm">
                      <option>Both</option><option>Phone OTP</option><option>Password</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                    <input name="password" value={engData.password} onChange={handleEngChange} type="password" placeholder="Min 8 characters" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <input name="confirmPassword" value={engData.confirmPassword} onChange={handleEngChange} type="password" placeholder="Confirm Password" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Referral Code (Optional)</label>
                    <input name="referralCode" value={engData.referralCode} onChange={handleEngChange} type="text" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">How did you hear about WBI?</label>
                    <select name="heardAboutWbi" value={engData.heardAboutWbi} onChange={handleEngChange} className="w-full border rounded-lg p-2 text-sm">
                      <option value="">Select Option</option>
                      {HEARD_ABOUT.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 pt-4 border-t space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" name="acceptTerms" checked={engData.acceptTerms} onChange={handleEngChange} className="rounded text-indigo-600 focus:ring-indigo-500" />
                      I accept the <a href="#" className="text-indigo-600 hover:underline">Terms & Conditions</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a> *
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation */}
            <div className="flex justify-between mt-8 pt-4 border-t">
              {currentStep > 1 ? (
                <button onClick={prevStep} className="px-6 py-2 border rounded-xl font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                  <FiChevronLeft /> Back
                </button>
              ) : <div></div>}

              {currentStep < 4 ? (
                <button onClick={nextStep} className="px-8 py-2 bg-[#4F46E5] text-white rounded-xl font-medium shadow-md hover:bg-[#4338ca] flex items-center gap-2">
                  Continue <FiArrowRight />
                </button>
              ) : (
                <button onClick={submitEngineer} disabled={isSubmitting} className="px-8 py-2 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 flex items-center gap-2">
                  {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                </button>
              )}
            </div>

          </div>
      </main>
    </div>
  );
}
