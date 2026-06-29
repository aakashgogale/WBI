import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLock, FiCheckCircle, FiShield, FiHeadphones, FiZap, FiAward, FiEye, FiEyeOff, FiUpload, FiX, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { register, sendOTP as sendVendorOTP, verifyLogin } from '../services/authService';
import LogoLoader from '../../../components/common/LogoLoader';
import Logo from '../../../components/common/Logo';
import { compressImage } from '../../../utils/imageCompression';

const VendorSignup = () => {
  const navigate = useNavigate();
  // flowState can be: 'form', 'otp'
  const [flowState, setFlowState] = useState('form'); 
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP States
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [verificationToken, setVerificationToken] = useState(() => {
    return sessionStorage.getItem('vendorSignupVerificationToken') || '';
  });
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRefs = useRef([]);

  // Persist verification token
  useEffect(() => {
    if (verificationToken) {
      sessionStorage.setItem('vendorSignupVerificationToken', verificationToken);
    } else {
      sessionStorage.removeItem('vendorSignupVerificationToken');
    }
  }, [verificationToken]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    accountType: '', // 'Company/Firm' or 'Individual Professional'
    businessName: '',
    gstin: '',
    aadhar: '',
    pan: '',
    categories: [], // Storing category IDs or Slugs
    skills: [], // Storing sub-service IDs or Slugs
    documents: []
  });

  const [documentPreview, setDocumentPreview] = useState({});
  const [uploadingDocs, setUploadingDocs] = useState({});

  // Dynamic Services State
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubServices, setAvailableSubServices] = useState({}); // mapped by categoryId
  const [loadingServices, setLoadingServices] = useState(false);

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingServices(true);
      try {
        const { default: api } = await import('../../../services/api');
        const res = await api.get('/public/service-categories');
        if (res.data?.success) {
          setAvailableCategories(res.data.categories || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subservices when a category is selected
  const fetchSubServices = async (categoryId, slug) => {
    if (availableSubServices[categoryId]) return; // already fetched
    try {
      const { default: api } = await import('../../../services/api');
      const res = await api.get(`/public/service-categories/${slug}/services`);
      if (res.data?.success) {
        setAvailableSubServices(prev => ({ ...prev, [categoryId]: res.data.data || [] }));
      }
    } catch (err) {
      console.error('Failed to fetch subservices:', err);
    }
  };

  const handleCategoryToggle = (categoryId, slug) => {
    setFormData(prev => {
      const current = prev.categories || [];
      const isSelected = current.includes(categoryId);
      if (!isSelected) {
        fetchSubServices(categoryId, slug);
        return { ...prev, categories: [...current, categoryId] };
      } else {
        // Remove category and its subservices from skills
        const categorySubServiceIds = (availableSubServices[categoryId] || []).map(s => s._id);
        const newSkills = (prev.skills || []).filter(skillId => !categorySubServiceIds.includes(skillId));
        return { ...prev, categories: current.filter(id => id !== categoryId), skills: newSkills };
      }
    });
  };

  const handleSkillToggle = (subServiceId) => {
    setFormData(prev => {
      const current = prev.skills || [];
      if (current.includes(subServiceId)) {
        return { ...prev, skills: current.filter(id => id !== subServiceId) };
      }
      return { ...prev, skills: [...current, subServiceId] };
    });
  };

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (flowState === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0].focus(), 100);
    }
  }, [flowState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size should be less than 15MB');
      return;
    }

    setUploadingDocs(prev => ({ ...prev, [type]: true }));
    const loadingToast = toast.loading("Processing file...");

    try {
      let fileToUpload = file;
      let previewUrl = '';

      if (file.type.startsWith('image/')) {
        try {
          fileToUpload = await compressImage(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.8 });
        } catch (err) { console.error("Compression failed", err); }
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        previewUrl = reader.result;
        setFormData(prev => ({
          ...prev,
          documents: [...prev.documents.filter(d => d.type !== type), { type, file: fileToUpload, url: previewUrl }]
        }));
        setDocumentPreview(prev => ({ ...prev, [type]: previewUrl }));
        setUploadingDocs(prev => ({ ...prev, [type]: false }));
        toast.dismiss(loadingToast);
        toast.success("Document uploaded!");
      };
      reader.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error("Failed to read file");
        setUploadingDocs(prev => ({ ...prev, [type]: false }));
      };
      reader.readAsDataURL(fileToUpload);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to process file");
      setUploadingDocs(prev => ({ ...prev, [type]: false }));
    }
  };

  const removeDocument = (type) => {
    setFormData(prev => ({ ...prev, documents: prev.documents.filter(d => d.type !== type) }));
    setDocumentPreview(prev => {
      const newPreview = { ...prev };
      delete newPreview[type];
      return newPreview;
    });
  };

  // Step Navigations
  const handleNextStep1 = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name || !emailRegex.test(formData.email) || formData.phoneNumber.length !== 10 || formData.password.length < 8) {
      toast.error("Please fill all details correctly. Provide a valid email and 8+ char password.");
      return;
    }
    
    setIsLoading(true);
    let retryCount = 0;
    
    const trySendOTP = async () => {
      try {
        const response = await sendVendorOTP(formData.phoneNumber);
        if (response.success) {
          setOtpToken(response.token);
          setResendTimer(120);
          setFlowState('otp');
          toast.success('OTP sent to your phone number');
        } else {
          toast.error(response.message || 'Failed to send OTP');
        }
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          if (retryCount < 1) {
            retryCount++;
            console.log('Timeout on sendOTP, retrying automatically...');
            await trySendOTP(); // Retry once
          } else {
            toast.error('Server is taking too long to respond, please try again');
          }
        } else {
          toast.error(error.response?.data?.message || 'Failed to send OTP');
        }
      }
    };
    
    await trySendOTP();
    setIsLoading(false);
  };

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);
    if (cleanValue && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Auto verify OTP
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === 6 && flowState === 'otp' && !isLoading) {
      handleVerifyOTP(otpValue);
    }
  }, [otp]);

  const handleVerifyOTP = async (otpValue) => {
    setIsLoading(true);
    try {
      // Actually, we can use verify-login for OTP verify!
      const response = await verifyLogin({ phone: formData.phoneNumber, otp: otpValue });
      if (response.success && response.isNewUser) {
        console.log('[SIGNUP_DEBUG] verifyLogin succeeded (new user). Storing token:', response.verificationToken);
        setVerificationToken(response.verificationToken);
        setFlowState('form');
        setStep(2); // Move to Account Type step
        toast.success('Phone verified successfully!');
      } else if (response.success && !response.isNewUser) {
        // First check if this is an already pending vendor response
        if (response.vendor && response.vendor.adminApproval === 'pending') {
          toast.success('Your account is currently under review. Please wait for admin approval.');
          navigate('/vendor/login');
          return;
        }

        // Cross-role registration: check if user already has the vendor role
        const roleStr = response.role || response.user?.role || response.vendor?.role || '';
        const roles = response.roles || response.user?.roles || [roleStr];
        
        if (!roles.includes('vendor') && response.accessToken) {
          const finalToken = response.verificationToken || response.accessToken;
          console.log('[SIGNUP_DEBUG] verifyLogin succeeded (cross-role). Storing token:', finalToken);
          setVerificationToken(finalToken);
          setFlowState('form');
          setStep(2);
          toast.success('User found. Please complete your Vendor Profile!');
        } else {
          toast.error('Vendor Account already exists! Please login.');
          navigate('/vendor/login');
        }
      } else {
        toast.error(response.message || 'OTP verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep2 = () => {
    if (!formData.accountType) {
      toast.error("Please select an Account Type");
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = () => {
    if (formData.accountType === 'Company/Firm' && (!formData.businessName || !formData.gstin)) {
      toast.error("Please enter Business Name and GSTIN");
      return;
    }
    if (formData.aadhar.length !== 12 || formData.pan.length !== 10) {
      toast.error("Please enter valid Aadhar and PAN");
      return;
    }
    setStep(4);
  };

  const handleNextStep4 = () => {
    if (!formData.categories || formData.categories.length === 0) {
      toast.error("Please select at least one service category");
      return;
    }
    if (!formData.skills || formData.skills.length === 0) {
      toast.error("Please select at least one specific service/skill");
      return;
    }
    setStep(5);
  };

  const handleNextStep5 = () => {
    if (!documentPreview.aadhar || !documentPreview.aadharBack || !documentPreview.pan) {
      toast.error("Please upload all mandatory documents");
      return;
    }
    setStep(6);
  };

  const handleFinalSubmit = async () => {
    if (isLoading) {
      console.log('[SIGNUP_DEBUG] Submission already in progress, ignoring duplicate click.');
      return;
    }
    setIsLoading(true);

    // b) Log before building payload
    console.log('[SIGNUP_DEBUG] Final submit clicked. Current verificationToken state:', verificationToken);
    
    // Safety fallback: read directly from sessionStorage in case of stale closure
    const currentToken = verificationToken || sessionStorage.getItem('vendorSignupVerificationToken');
    console.log('[SIGNUP_DEBUG] Token being used for payload:', currentToken);

    if (!currentToken) {
      setIsLoading(false);
      toast.error('Your verification expired, please refresh and verify your phone again.', { duration: 5000 });
      return;
    }
    
    try {
      const aadharDoc = formData.documents.find(d => d.type === 'aadhar')?.url;
      const aadharBackDoc = formData.documents.find(d => d.type === 'aadharBack')?.url;
      const panDoc = formData.documents.find(d => d.type === 'pan')?.url;

      const registerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phoneNumber,
        password: formData.password,
        accountType: formData.accountType,
        businessName: formData.businessName,
        gstin: formData.gstin,
        aadhar: formData.aadhar,
        pan: formData.pan,
        categories: formData.categories,
        skills: formData.skills,
        aadharDocument: aadharDoc,
        aadharBackDocument: aadharBackDoc,
        panDocument: panDoc,
        verificationToken: currentToken
      };

      // c) Log payload
      console.log('[SIGNUP_DEBUG] Actual payload sent to register API:', { ...registerData, password: '***', documentsLength: formData.documents.length });

      const response = await register(registerData);
      if (response.success) {
        toast.success(
          <div className="flex flex-col">
            <span className="font-bold">Application Submitted!</span>
            <span className="text-xs">Your account is pending admin approval.</span>
          </div>,
          { icon: <FiCheckCircle className="text-[#0D8A72]" />, duration: 5000 }
        );
        navigate('/vendor/login');
      } else {
        toast.error(response.message || 'Registration failed');
        // Dynamic redirect if already exists
        if (response.message && response.message.toLowerCase().includes('already exists')) {
          setTimeout(() => navigate('/vendor/login'), 2000);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
      // Dynamic redirect if already exists
      if (errorMsg.toLowerCase().includes('already exists')) {
        setTimeout(() => navigate('/vendor/login'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const brandColor = themeColors.brand?.teal || '#0D8A72';

  return (
    <div className="h-[100dvh] w-full bg-gray-50 flex flex-col font-sans overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-8 xl:p-12 bg-white border-r border-gray-100 relative overflow-hidden">
          <div className="flex items-center gap-2 relative z-10 shrink-0">
            <Logo className="h-8 w-auto" />
            <span className="text-xl font-bold text-gray-800 tracking-tight">Vendor Portal</span>
          </div>

          <div className="relative z-10 mt-8 xl:mt-12 flex-1 shrink-0">
            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Welcome to <br />
              <span style={{ color: brandColor }}>WBI Vendor Portal</span>
            </h1>
            <p className="text-gray-600 text-sm xl:text-base mb-8 max-w-md leading-relaxed">
              Connect with businesses, manage services, and grow your professional network with WBI.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-teal-50 text-teal-600 shrink-0"><FiZap className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base xl:text-lg">Grow Your Business</h3>
                  <p className="text-gray-500 text-xs xl:text-sm mt-0.5">Get more projects and expand your reach across multiple cities.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-blue-50 text-blue-600 shrink-0"><FiShield className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base xl:text-lg">Manage Everything</h3>
                  <p className="text-gray-500 text-xs xl:text-sm mt-0.5">Projects, teams, invoices, and earnings all in one secure place.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-orange-50 text-orange-600 shrink-0"><FiAward className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base xl:text-lg">Trusted by Thousands</h3>
                  <p className="text-gray-500 text-xs xl:text-sm mt-0.5">Join a premier network of verified vendors and professionals.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-24 relative bg-gray-50 overflow-y-auto overflow-x-hidden py-6">
          <div className="lg:hidden text-center mb-6 shrink-0">
            <Logo className="h-10 w-auto mx-auto mb-2" />
            <span className="text-xl font-bold text-gray-800">Vendor Portal</span>
          </div>

          <div className="bg-white p-6 sm:p-8 xl:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 w-full max-w-[500px] mx-auto shrink-0 my-auto">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
              <p className="text-gray-500 mt-2 text-sm">Join WBI Vendor Network</p>
            </div>

            {/* Stepper Logic (Visible when not in OTP mode) */}
            {flowState === 'form' && (
              <div className="mb-8">
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-200 z-0"></div>
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <div key={s} className="relative z-10 flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${step >= s ? 'bg-[#0D8A72] text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {step > s ? <FiCheck className="w-3 h-3" /> : s}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-500">
                  <span className={step >= 1 ? "text-[#0D8A72]" : ""}>Basic</span>
                  <span className={step >= 2 ? "text-[#0D8A72]" : ""}>Account</span>
                  <span className={step >= 3 ? "text-[#0D8A72]" : ""}>Business</span>
                  <span className={step >= 4 ? "text-[#0D8A72]" : ""}>Services</span>
                  <span className={step >= 5 ? "text-[#0D8A72]" : ""}>Docs</span>
                  <span className={step >= 6 ? "text-[#0D8A72]" : ""}>Review</span>
                </div>
              </div>
            )}

            {/* Content Rendering based on Flow & Step */}
            
            {/* OTP VERIFICATION VIEW */}
            {flowState === 'otp' && (
              <div className="animate-fade-in text-center">
                <div className="mb-6 flex justify-center text-[#0D8A72]">
                   <FiShield className="w-16 h-16 opacity-20 absolute" />
                   <FiCheckCircle className="w-10 h-10 relative z-10 mt-3" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Your Phone</h3>
                <p className="text-gray-500 text-sm mb-8">Enter the OTP sent to <br/><span className="font-bold text-[#0D8A72]">+91 {formData.phoneNumber}</span></p>

                <div className="flex justify-center gap-2 sm:gap-4 mb-8">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D8A72]"
                    />
                  ))}
                </div>

                <div className="mb-8">
                  <button
                    onClick={async () => {
                      if (resendTimer > 0) return;
                      const response = await sendVendorOTP(formData.phoneNumber);
                      if(response.success) { setResendTimer(120); toast.success('New OTP sent'); }
                    }}
                    disabled={resendTimer > 0}
                    className="text-sm font-semibold text-[#0D8A72] hover:text-[#0a6b58] disabled:opacity-50"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <button onClick={() => setFlowState('form')} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                    &larr; Back
                  </button>
                  <button
                    onClick={() => handleVerifyOTP(otp.join(''))}
                    disabled={isLoading || otp.join('').length !== 6}
                    className="py-3 px-8 rounded-xl text-white font-bold bg-[#0D8A72] hover:bg-[#0a6b58] disabled:opacity-50 transition-colors flex items-center shadow-lg"
                  >
                    {isLoading ? <LogoLoader inline size="w-5 h-5"/> : 'Verify & Continue'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: Basic Info */}
            {flowState === 'form' && step === 1 && (
              <div className="animate-fade-in space-y-4">
                <h3 className="font-bold text-gray-900 text-base mb-2">Basic Information</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-gray-400" />
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all text-sm" placeholder="Enter your full name" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-gray-400" />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all text-sm" placeholder="Enter your email address" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3 text-gray-400" />
                    <input type="tel" name="phoneNumber" maxLength={10} value={formData.phoneNumber} onChange={(e)=>setFormData(p=>({...p, phoneNumber: e.target.value.replace(/\D/g, '')}))} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all text-sm" placeholder="Enter your phone number" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all text-sm" placeholder="Create a strong password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={handleNextStep1} disabled={isLoading} className="w-full py-3 rounded-xl text-white text-sm font-bold bg-[#0D8A72] hover:bg-[#0a6b58] transition-colors shadow-lg flex justify-center items-center">
                    {isLoading ? <LogoLoader inline size="w-4 h-4"/> : 'Continue & Verify Phone &rarr;'}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-3">Already have an account? <Link to="/vendor/login" className="text-[#0D8A72] font-bold hover:underline">Login</Link></p>
                </div>
              </div>
            )}

            {/* STEP 2: Account Type */}
            {flowState === 'form' && step === 2 && (
              <div className="animate-fade-in space-y-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2">Choose Your Account Type</h3>
                <p className="text-sm text-gray-500 mb-6">Select the type that best describes you</p>

                <div className="space-y-4">
                  <label className={`cursor-pointer block border-2 rounded-xl p-5 transition-all ${formData.accountType === 'Company/Firm' ? 'border-[#0D8A72] bg-teal-50 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-full mr-4 ${formData.accountType === 'Company/Firm' ? 'bg-[#0D8A72] text-white' : 'bg-gray-100 text-gray-500'}`}>
                           <FiAward className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">Company / Firm</h4>
                          <p className="text-sm text-gray-500">Register your company or firm with a team of professionals</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.accountType === 'Company/Firm' ? 'border-[#0D8A72] bg-[#0D8A72]' : 'border-gray-300'}`}>
                         {formData.accountType === 'Company/Firm' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <input type="radio" name="accountType" value="Company/Firm" className="hidden" onChange={handleInputChange} />
                  </label>

                  <label className={`cursor-pointer block border-2 rounded-xl p-5 transition-all ${formData.accountType === 'Individual Professional' ? 'border-[#0D8A72] bg-teal-50 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-full mr-4 ${formData.accountType === 'Individual Professional' ? 'bg-[#0D8A72] text-white' : 'bg-gray-100 text-gray-500'}`}>
                           <FiUser className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">Individual Professional</h4>
                          <p className="text-sm text-gray-500">Register as an independent professional or consultant</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.accountType === 'Individual Professional' ? 'border-[#0D8A72] bg-[#0D8A72]' : 'border-gray-300'}`}>
                         {formData.accountType === 'Individual Professional' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <input type="radio" name="accountType" value="Individual Professional" className="hidden" onChange={handleInputChange} />
                  </label>
                </div>

                <div className="pt-8 flex justify-between">
                  <button onClick={() => setStep(1)} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors px-4 py-2">&larr; Back</button>
                  <button onClick={handleNextStep2} className="py-3 px-8 rounded-xl text-white font-bold bg-[#0D8A72] hover:bg-[#0a6b58] transition-colors shadow-lg">
                    Continue &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Business Info */}
            {flowState === 'form' && step === 3 && (
              <div className="animate-fade-in space-y-5">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Business Information</h3>

                {formData.accountType === 'Company/Firm' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business / Company Name</label>
                      <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all" placeholder="M/s ABC Enterprises" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">GSTIN Number (Optional)</label>
                      <input type="text" name="gstin" value={formData.gstin} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all uppercase" placeholder="22AAAAA0000A1Z5" />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Aadhar Number</label>
                  <input type="text" name="aadhar" maxLength={12} value={formData.aadhar} onChange={(e)=>setFormData(p=>({...p, aadhar: e.target.value.replace(/\D/g, '')}))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all tracking-widest" placeholder="1234 5678 9012" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">PAN Number</label>
                  <input type="text" name="pan" maxLength={10} value={formData.pan} onChange={(e)=>setFormData(p=>({...p, pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')}))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0D8A72] outline-none transition-all tracking-widest uppercase" placeholder="ABCDE1234F" />
                </div>

                <div className="pt-8 flex justify-between">
                  <button onClick={() => setStep(2)} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors px-4 py-2">&larr; Back</button>
                  <button onClick={handleNextStep3} className="py-3 px-8 rounded-xl text-white font-bold bg-[#0D8A72] hover:bg-[#0a6b58] transition-colors shadow-lg">
                    Continue &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Services & Skills */}
            {flowState === 'form' && step === 4 && (
              <div className="animate-fade-in space-y-6">
                <h3 className="font-bold text-gray-900 text-lg mb-2">What Services Do You Provide?</h3>
                <p className="text-sm text-gray-500 mb-4">Select the categories and specific services you offer.</p>

                {loadingServices ? (
                  <div className="flex justify-center py-10"><LogoLoader size="w-8 h-8" /></div>
                ) : availableCategories.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 py-4">No categories available at the moment.</div>
                ) : (
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Categories Selection */}
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-3">1. Select Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map(cat => {
                          const isSelected = formData.categories?.includes(cat._id);
                          return (
                            <button
                              key={cat._id}
                              onClick={() => handleCategoryToggle(cat._id, cat.slug)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                isSelected 
                                  ? 'bg-teal-50 border-[#0D8A72] text-[#0D8A72]' 
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-[#0D8A72]'
                              }`}
                            >
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sub-Services Selection based on selected categories */}
                    {(formData.categories || []).length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 mb-3">2. Select Specific Services</p>
                        <div className="space-y-4">
                          {formData.categories.map(categoryId => {
                            const category = availableCategories.find(c => c._id === categoryId);
                            const subServices = availableSubServices[categoryId] || [];
                            
                            if (subServices.length === 0) return null;

                            return (
                              <div key={categoryId} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">{category?.name}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {subServices.map(sub => {
                                    const isSelected = formData.skills?.includes(sub._id);
                                    return (
                                      <label key={sub._id} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                                        isSelected ? 'bg-white border-[#0D8A72] shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'
                                      }`}>
                                        <div className="flex items-center h-5">
                                          <input 
                                            type="checkbox" 
                                            checked={isSelected}
                                            onChange={() => handleSkillToggle(sub._id)}
                                            className="w-4 h-4 text-[#0D8A72] border-gray-300 rounded focus:ring-[#0D8A72]"
                                          />
                                        </div>
                                        <div className="ml-3 text-sm flex-1">
                                          <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{sub.name}</span>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-6 flex justify-between">
                  <button onClick={() => setStep(3)} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors px-4 py-2">&larr; Back</button>
                  <button onClick={handleNextStep4} className="py-3 px-8 rounded-xl text-white font-bold bg-[#0D8A72] hover:bg-[#0a6b58] transition-colors shadow-lg">
                    Continue &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Documents */}
            {flowState === 'form' && step === 5 && (
              <div className="animate-fade-in space-y-5">
                <h3 className="font-bold text-gray-900 text-lg mb-2">Upload Documents</h3>
                <p className="text-sm text-gray-500 mb-6">Clear photos help us verify your profile faster.</p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Aadhar Front */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Aadhar Front</p>
                    {documentPreview.aadhar ? (
                      <div className="relative rounded-xl overflow-hidden group border">
                        <img fetchPriority="low" loading="lazy" src={documentPreview.aadhar} className="w-full h-28 object-cover" alt="Aadhar Front" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button onClick={() => removeDocument('aadhar')} className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50"><FiX/></button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#0D8A72] transition-colors relative">
                        {uploadingDocs.aadhar ? <LogoLoader inline size="w-6 h-6"/> : (
                          <>
                            <div className="p-2 bg-teal-50 text-[#0D8A72] rounded-full mb-1"><FiUpload /></div>
                            <span className="text-xs text-gray-500 font-medium">Upload Image</span>
                          </>
                        )}
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleDocumentUpload(e, 'aadhar')} disabled={uploadingDocs.aadhar} />
                      </label>
                    )}
                  </div>

                  {/* Aadhar Back */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Aadhar Back</p>
                    {documentPreview.aadharBack ? (
                      <div className="relative rounded-xl overflow-hidden group border">
                        <img fetchPriority="low" loading="lazy" src={documentPreview.aadharBack} className="w-full h-28 object-cover" alt="Aadhar Back" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button onClick={() => removeDocument('aadharBack')} className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50"><FiX/></button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#0D8A72] transition-colors relative">
                        {uploadingDocs.aadharBack ? <LogoLoader inline size="w-6 h-6"/> : (
                          <>
                            <div className="p-2 bg-teal-50 text-[#0D8A72] rounded-full mb-1"><FiUpload /></div>
                            <span className="text-xs text-gray-500 font-medium">Upload Image</span>
                          </>
                        )}
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleDocumentUpload(e, 'aadharBack')} disabled={uploadingDocs.aadharBack} />
                      </label>
                    )}
                  </div>

                  {/* PAN Card */}
                  <div className="space-y-2 col-span-2">
                    <p className="text-xs font-semibold text-gray-600">PAN Card</p>
                    {documentPreview.pan ? (
                      <div className="relative rounded-xl overflow-hidden group border w-1/2">
                        <img fetchPriority="low" loading="lazy" src={documentPreview.pan} className="w-full h-28 object-cover" alt="PAN" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button onClick={() => removeDocument('pan')} className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50"><FiX/></button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#0D8A72] transition-colors relative">
                        {uploadingDocs.pan ? <LogoLoader inline size="w-6 h-6"/> : (
                          <>
                            <div className="p-2 bg-teal-50 text-[#0D8A72] rounded-full mb-1"><FiUpload /></div>
                            <span className="text-xs text-gray-500 font-medium">Upload Image</span>
                          </>
                        )}
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleDocumentUpload(e, 'pan')} disabled={uploadingDocs.pan} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="pt-8 flex justify-between">
                  <button onClick={() => setStep(4)} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors px-4 py-2">&larr; Back</button>
                  <button onClick={handleNextStep5} className="py-3 px-8 rounded-xl text-white font-bold bg-[#0D8A72] hover:bg-[#0a6b58] transition-colors shadow-lg">
                    Review Details &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Review & Submit */}
            {flowState === 'form' && step === 6 && (
              <div className="animate-fade-in space-y-6">
                <div className="text-center">
                   <div className="w-16 h-16 bg-teal-50 text-[#0D8A72] rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheckCircle className="w-8 h-8" />
                   </div>
                   <h3 className="font-bold text-gray-900 text-xl">Almost Done!</h3>
                   <p className="text-sm text-gray-500 mt-1">Please review your details before submitting.</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3 text-sm">
                   <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Name</span>
                      <span className="font-semibold text-gray-900">{formData.name}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-semibold text-gray-900">+91 {formData.phoneNumber}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Account Type</span>
                      <span className="font-semibold text-gray-900">{formData.accountType}</span>
                   </div>
                   <div className="flex justify-between pb-1">
                      <span className="text-gray-500">Documents Attached</span>
                      <span className="font-semibold text-green-600">3 Files Ready</span>
                   </div>
                </div>

                <p className="text-xs text-gray-500 text-center px-4">
                  By submitting this application, you agree to WBI's Vendor Terms and Conditions.
                </p>

                <div className="pt-4 flex justify-between">
                  <button onClick={() => setStep(5)} disabled={isLoading} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors px-4 py-2">&larr; Back</button>
                  <button onClick={handleFinalSubmit} disabled={isLoading} className="py-3 px-8 rounded-xl text-white font-bold bg-[#0D8A72] hover:bg-[#0a6b58] transition-colors shadow-lg shadow-[#0D8A72]/30 flex items-center">
                    {isLoading ? <LogoLoader inline size="w-5 h-5"/> : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSignup;
