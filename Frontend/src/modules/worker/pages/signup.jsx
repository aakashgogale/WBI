import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiUser, FiMail, FiPhone, FiLock, FiCheckCircle, 
  FiArrowRight, FiChevronLeft, FiUpload, FiX, FiMapPin, FiBriefcase, FiTool,
  FiCalendar, FiClock, FiMap, FiCreditCard, FiTruck, FiArrowLeft
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { workerAuthService } from '../../../services/authService';
import Logo from '../../../components/common/Logo';
import LogoLoader from '../../../components/common/LogoLoader';
import { z } from "zod";

const WorkerSignup = () => {
  const navigate = useNavigate();
  
  // Registration Data
  const [config, setConfig] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Tabs for Role
  const [activeTab, setActiveTab] = useState('Worker'); // 'Worker' or 'Engineer'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    dob: '',
    gender: '',
    serviceCategories: [],
    skills: [],
    experience: '',
    workType: '',
    availableCities: [],
    workingDays: [],
    workingHours: { start: '09:00', end: '18:00' },
    availability: 'Full Time',
    emergencyService: false,
    address: { street: '', city: '', state: '', pincode: '' },
    workLocations: { primaryArea: '', serviceRadius: 10 },
    location: null,
    uploadedDocuments: [],
    bankDetails: { accountHolder: '', bankName: '', accountNumber: '', ifscCode: '', upiId: '' },
    workTools: { ownTools: false, vehicleAvailable: false, vehicleType: '', drivingLicense: '' },
    engineerDetails: { qualification: '', degree: '', specialization: '', projectExperience: '', portfolio: '', certifications: [], previousCompany: '', canHandleMilestones: false }
  });

  const [documentPreviews, setDocumentPreviews] = useState({});

  useEffect(() => {
    localStorage.removeItem('workerAccessToken');
    localStorage.removeItem('workerRefreshToken');
    localStorage.removeItem('workerData');
    
    const loadConfig = async () => {
      try {
        const response = await workerAuthService.getRegistrationConfig();
        if (response.success) {
          setConfig(response.config);
        } else {
          toast.error('Failed to load registration configuration');
        }
      } catch (err) {
        toast.error('Error connecting to server. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleNestedChange = (section, e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const isSelected = prev.serviceCategories.includes(categoryId);
      if (isSelected) {
        return { ...prev, serviceCategories: prev.serviceCategories.filter(id => id !== categoryId) };
      } else {
        return { ...prev, serviceCategories: [...prev.serviceCategories, categoryId] };
      }
    });
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => {
      const isSelected = prev.skills.includes(skillId);
      if (isSelected) {
        return { ...prev, skills: prev.skills.filter(id => id !== skillId) };
      } else {
        return { ...prev, skills: [...prev.skills, skillId] };
      }
    });
  };

  const toggleArrayItem = (arrayName, item) => {
    setFormData(prev => {
      const array = prev[arrayName] || [];
      const isSelected = array.includes(item);
      if (isSelected) {
        return { ...prev, [arrayName]: array.filter(i => i !== item) };
      } else {
        return { ...prev, [arrayName]: [...array, item] };
      }
    });
  };

  const fetchGPSLocation = () => {
    setIsFetchingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: { lat: position.coords.latitude, lng: position.coords.longitude }
          }));
          toast.success("Location fetched successfully!");
          setIsFetchingLocation(false);
        },
        (error) => {
          console.error(error);
          toast.error("Please allow location access to fetch GPS coordinates.");
          setIsFetchingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsFetchingLocation(false);
    }
  };

  const handleDocumentUpload = (e, docConfig, isBack = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      
      setFormData(prev => {
        const existingDocs = [...prev.uploadedDocuments];
        const docIndex = existingDocs.findIndex(d => d.key === docConfig.key);
        
        if (docIndex >= 0) {
          if (isBack) existingDocs[docIndex].backUrl = result;
          else existingDocs[docIndex].url = result;
        } else {
          existingDocs.push({
            key: docConfig.key,
            url: isBack ? null : result,
            backUrl: isBack ? result : null
          });
        }
        return { ...prev, uploadedDocuments: existingDocs };
      });

      setDocumentPreviews(prev => ({
        ...prev,
        [`${docConfig.key}_${isBack ? 'back' : 'front'}`]: result
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (docKey, isBack = false) => {
    setFormData(prev => {
      const existingDocs = [...prev.uploadedDocuments];
      const docIndex = existingDocs.findIndex(d => d.key === docKey);
      if (docIndex >= 0) {
        if (isBack) existingDocs[docIndex].backUrl = null;
        else existingDocs[docIndex].url = null;
        if (!existingDocs[docIndex].url && !existingDocs[docIndex].backUrl) {
          existingDocs.splice(docIndex, 1);
        }
      }
      return { ...prev, uploadedDocuments: existingDocs };
    });
    setDocumentPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[`${docKey}_${isBack ? 'back' : 'front'}`];
      return newPreviews;
    });
  };

  // Step names based on the mockup and role
  const stepTitles = activeTab === 'Engineer' 
    ? ["Basic", "Skills", "Documents", "Account"] 
    : ["Basic", "Services"];

  const validateCurrentStep = () => {
    if (currentStepIndex === 0) {
      const schema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      });
      const result = schema.safeParse(formData);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return false;
      }
      if (!formData.address.city) {
        toast.error("Please provide your Current City.");
        return false;
      }
      return true;
    }

    if (currentStepIndex === 1) {
      if (config?.categories?.length > 0 && formData.serviceCategories.length === 0) {
        toast.error("Please select at least one service category");
        return false;
      }
      return true;
    }

    if (isEngineer && currentStepIndex === 2) {
      let missingDoc = false;
      config?.documents?.forEach(doc => {
        if (doc.isRequired) {
          const uploaded = formData.uploadedDocuments.find(d => d.key === doc.key);
          if (!uploaded || !uploaded.url) {
            toast.error(`Please upload ${doc.title} (Front)`);
            missingDoc = true;
          }
          if (!missingDoc && doc.requiresFrontAndBack && (!uploaded || !uploaded.backUrl)) {
            toast.error(`Please upload ${doc.title} (Back)`);
            missingDoc = true;
          }
        }
      });
      return !missingDoc;
    }

    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setIsSubmitting(true);
    try {
      const categoryTitles = formData.serviceCategories.map(id => {
        const cat = config?.categories?.find(c => c.id === id);
        return cat ? cat.title : id;
      });

      const payload = {
        ...formData,
        roleType: activeTab,
        serviceCategories: categoryTitles,
      };

      const response = await workerAuthService.register(payload);
      if (response.success) {
        toast.success(
          <div className="flex flex-col">
            <span className="font-bold">Welcome Onboard!</span>
            <span className="text-xs">Your account is pending approval.</span>
          </div>,
          { icon: <FiCheckCircle className="text-green-500" /> }
        );
        navigate('/engineer', { replace: true });
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      if (error.response?.data?.errors?.length > 0) {
        toast.error(error.response.data.errors[0].msg || 'Validation failed');
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LogoLoader fullScreen={false} /></div>;

  const renderStepContent = () => {
    const isEngineer = activeTab === 'Engineer';

    // STEP 1: Basic
    if (currentStepIndex === 0) {
      return (
        <div className="space-y-6 animate-fade-in">
          
          {/* PERSONAL DETAILS */}
          <section>
            <h4 className="text-[11px] font-bold text-[#4F46E5] tracking-wider mb-3 uppercase flex items-center"><FiUser className="mr-1"/> Personal Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Full name <span className="text-red-500">*</span></label>
                <div className="relative rounded-xl shadow-sm">
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="block w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm placeholder-gray-400 transition-all" placeholder="e.g. Ramesh Sharma" />
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Mobile number <span className="text-red-500">*</span></label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none pr-2 border-r border-gray-200"><span className="text-gray-500 font-medium text-[13px]">+91</span></div>
                  <input type="tel" name="phone" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10)}))} className="block w-full pl-12 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm placeholder-gray-400 tracking-wider transition-all" placeholder="XXXXX XXXXX" />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative rounded-xl shadow-sm">
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="block w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm placeholder-gray-400 transition-all" placeholder="Create a strong password" />
                </div>
              </div>

              {isEngineer && (
                <>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Date of birth <span className="text-red-500">*</span></label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="block w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all" />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="block w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Email address <span className="text-gray-400 font-normal">(optional)</span></label>
                    <div className="relative rounded-xl shadow-sm">
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="block w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm placeholder-gray-400 transition-all" placeholder="ramesh@email.com" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* LOCATION */}
          <section>
            <h4 className="text-[11px] font-bold text-[#4F46E5] tracking-wider mb-3 uppercase flex items-center"><FiMapPin className="mr-1"/> Location</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Current city <span className="text-red-500">*</span></label>
                <input type="text" name="city" value={formData.address.city} onChange={(e) => handleNestedChange('address', e)} placeholder="e.g. Indore, MP" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm placeholder-gray-400 transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Pin code <span className="text-red-500">*</span></label>
                <input type="text" name="pincode" value={formData.address.pincode} onChange={(e) => handleNestedChange('address', e)} placeholder="452001" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm placeholder-gray-400 transition-all" />
              </div>
              
              {isEngineer && (
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Service radius <span className="text-red-500">*</span></label>
                  <select 
                    value={formData.workLocations.serviceRadius} 
                    onChange={(e) => setFormData(p => ({...p, workLocations: {...p.workLocations, serviceRadius: Number(e.target.value)}}))}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all"
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="20">20 km</option>
                    <option value="50">50 km</option>
                  </select>
                </div>
              )}
            </div>
            
            {isEngineer && (
              <div className="pt-3">
                <button 
                  type="button" 
                  onClick={fetchGPSLocation}
                  disabled={isFetchingLocation}
                  className="w-full flex items-center justify-center py-2.5 border border-dashed border-[#4F46E5]/50 text-[#4F46E5] bg-[#4F46E5]/5 rounded-xl transition-all font-semibold text-[13px] hover:bg-[#4F46E5]/10"
                >
                  {isFetchingLocation ? <LogoLoader inline size="w-4 h-4"/> : <><FiMapPin className="mr-2"/> {formData.location ? "Update GPS Location" : "Fetch Current GPS Location"}</>}
                </button>
                {formData.location && <p className="text-[11px] text-green-600 font-medium text-center mt-2">âœ… Location saved ({formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)})</p>}
              </div>
            )}
          </section>
        </div>
      );
    }

    // STEP 2: Skills
    if (currentStepIndex === 1) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return (
        <div className="space-y-6 animate-fade-in">
          
          <section>
            <h4 className="text-[11px] font-bold text-[#4F46E5] tracking-wider mb-3 uppercase flex items-center"><FiTool className="mr-1"/> Services Offered</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Service Categories <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {config?.categories?.map(cat => (
                    <div 
                      key={cat.id} 
                      onClick={() => handleCategoryToggle(cat.id)}
                      className={`px-3 py-2 border rounded-xl cursor-pointer transition-all flex items-center ${formData.serviceCategories.includes(cat.id) ? 'border-[#4F46E5] bg-[#4F46E5]/5 text-[#4F46E5]' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                    >
                      {cat.icon && <img src={cat.icon} className={`w-4 h-4 mr-2 object-contain ${formData.serviceCategories.includes(cat.id) ? '' : 'grayscale opacity-60'}`} alt=""/>}
                      <span className="text-[11px] font-semibold truncate">{cat.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {isEngineer && (
                <>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-2">Your Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {config?.skills?.map(skill => (
                        <span 
                          key={skill.id}
                          onClick={() => handleSkillToggle(skill.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all border font-medium ${formData.skills.includes(skill.id) ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Work experience <span className="text-red-500">*</span></label>
                      <select name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all">
                        <option value="">Select Experience</option>
                        <option value="0-1 Years">0-1 Years</option>
                        <option value="1-3 Years">1-3 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5-10 Years">5-10 Years</option>
                        <option value="10+ Years">10+ Years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Work Type Preferred</label>
                      <select name="workType" value={formData.workType} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all">
                        <option value="">Select Type</option>
                        <option value="One-time Jobs">One-time Jobs</option>
                        <option value="Project Work">Project Work</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {isEngineer && (
            <>
              <hr className="border-gray-100" />
              <section>
                <h4 className="text-[11px] font-bold text-[#4F46E5] tracking-wider mb-3 uppercase flex items-center"><FiClock className="mr-1"/> Availability</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-2">Working Days</label>
                    <div className="flex flex-wrap gap-2">
                      {days.map(day => (
                        <div 
                          key={day}
                          onClick={() => toggleArrayItem('workingDays', day)}
                          className={`px-3 py-1.5 rounded-lg border cursor-pointer text-[12px] font-semibold transition-all ${formData.workingDays.includes(day) ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Start Time</label>
                      <input type="time" name="start" value={formData.workingHours.start} onChange={e => handleNestedChange('workingHours', e)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">End Time</label>
                      <input type="time" name="end" value={formData.workingHours.end} onChange={e => handleNestedChange('workingHours', e)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-[13px]">Emergency Services 24x7</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Available for late-night emergency calls?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="emergencyService" checked={formData.emergencyService} onChange={handleInputChange} className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                    </label>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />
              <section className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/60">
                <h4 className="text-[11px] font-bold text-[#4F46E5] tracking-wider mb-3 uppercase flex items-center"><FiBriefcase className="mr-1"/> Engineer Profile</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Highest Qualification</label>
                    <input type="text" name="qualification" value={formData.engineerDetails.qualification} onChange={(e) => handleNestedChange('engineerDetails', e)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all" placeholder="e.g. B.Tech, Diploma" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Degree/Diploma Name</label>
                    <input type="text" name="degree" value={formData.engineerDetails.degree} onChange={(e) => handleNestedChange('engineerDetails', e)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Specialization</label>
                    <input type="text" name="specialization" value={formData.engineerDetails.specialization} onChange={(e) => handleNestedChange('engineerDetails', e)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all" placeholder="e.g. Electrical, Civil" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Portfolio Link (Optional)</label>
                    <input type="url" name="portfolio" value={formData.engineerDetails.portfolio} onChange={(e) => handleNestedChange('engineerDetails', e)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all" placeholder="https://..." />
                  </div>
                </div>
              </section>
            </>
          )}

          {!isEngineer && (
            <section className="bg-green-50 border border-green-200 p-4 rounded-2xl mt-8">
              <div className="flex items-start">
                <FiCheckCircle className="text-green-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-green-900 font-bold text-sm mb-1">Application Ready to Submit</h4>
                  <p className="text-[11px] text-green-700">By submitting, you agree to our Terms of Service and Privacy Policy.</p>
                  <button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all flex justify-center items-center shadow-sm disabled:opacity-50 text-sm">
                    {isSubmitting ? <LogoLoader inline size="w-5 h-5"/> : 'Submit Registration'}
                  </button>
                </div>
              </div>
            </section>
          )}

        </div>
      );
    }

    // STEP 3: Documents (Only for Engineer)
    if (isEngineer && currentStepIndex === 2) {
      return (
        <div className="space-y-6 animate-fade-in">
          
          <section>
            <h4 className="text-[11px] font-bold text-[#4F46E5] tracking-wider mb-2 uppercase flex items-center"><FiUpload className="mr-1"/> Required Documents</h4>
            <p className="text-[12px] text-gray-500 mb-4">Upload clear pictures or PDFs of the required documents.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config?.documents?.map(doc => (
                <div key={doc.key} className="p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[13px] text-gray-900">{doc.title} {doc.isRequired && <span className="text-red-500">*</span>}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-2 leading-tight">{doc.description}</p>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      {documentPreviews[`${doc.key}_front`] ? (
                        <div className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <img src={documentPreviews[`${doc.key}_front`]} className="w-full h-16 object-cover" />
                          <button onClick={() => removeDocument(doc.key, false)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><FiX size={10}/></button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-16 border border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                          <FiUpload className="text-gray-400 mb-1" size={12} />
                          <span className="text-[10px] font-medium text-gray-500">Front</span>
                          <input type="file" className="hidden" accept={doc.acceptedFormats.join(',')} onChange={(e) => handleDocumentUpload(e, doc, false)} />
                        </label>
                      )}
                    </div>
                    {doc.requiresFrontAndBack && (
                      <div className="flex-1">
                        {documentPreviews[`${doc.key}_back`] ? (
                          <div className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img src={documentPreviews[`${doc.key}_back`]} className="w-full h-16 object-cover" />
                            <button onClick={() => removeDocument(doc.key, true)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><FiX size={10}/></button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-16 border border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                            <FiUpload className="text-gray-400 mb-1" size={12} />
                            <span className="text-[10px] font-medium text-gray-500">Back</span>
                            <input type="file" className="hidden" accept={doc.acceptedFormats.join(',')} onChange={(e) => handleDocumentUpload(e, doc, true)} />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {isEngineer && (
            <>
              <hr className="border-gray-100" />
              <section>
                <h4 className="text-[11px] font-bold text-[#4F46E5] tracking-wider mb-3 uppercase flex items-center"><FiTruck className="mr-1"/> Work Tools & Logistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-[13px]">Own Tools</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Have professional tools?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="ownTools" checked={formData.workTools.ownTools} onChange={(e) => handleNestedChange('workTools', e)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-[13px]">Vehicle Available</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Have a personal vehicle?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="vehicleAvailable" checked={formData.workTools.vehicleAvailable} onChange={(e) => handleNestedChange('workTools', e)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                    </label>
                  </div>
                </div>

                {formData.workTools.vehicleAvailable && (
                  <div className="grid grid-cols-2 gap-3 animate-fade-in p-3 border border-gray-200 rounded-xl bg-gray-50/50 mt-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-1">Vehicle Type</label>
                      <select name="vehicleType" value={formData.workTools.vehicleType} onChange={(e) => handleNestedChange('workTools', e)} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#4F46E5] outline-none bg-white text-xs">
                        <option value="">Select Type</option>
                        <option value="Two Wheeler">Two Wheeler</option>
                        <option value="Four Wheeler">Four Wheeler</option>
                        <option value="Commercial">Commercial/Pickup</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-700 mb-1">Driving License No.</label>
                      <input type="text" name="drivingLicense" value={formData.workTools.drivingLicense} onChange={(e) => handleNestedChange('workTools', e)} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#4F46E5] outline-none bg-white uppercase text-xs" />
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

        </div>
      );
    }

    // STEP 4: Account (Only for Engineer)
    if (isEngineer && currentStepIndex === 3) {
      return (
        <div className="space-y-6 animate-fade-in">
          
          <section>
            <h4 className="text-[11px] font-bold text-[#4F46E5] tracking-wider mb-2 uppercase flex items-center"><FiCreditCard className="mr-1"/> Bank Details</h4>
            <p className="text-[12px] text-gray-500 mb-4">Required for processing your payments securely.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Account Holder Name <span className="text-red-500">*</span></label>
                <input type="text" name="accountHolder" value={formData.bankDetails.accountHolder} onChange={(e) => handleNestedChange('bankDetails', e)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Bank Name <span className="text-red-500">*</span></label>
                <input type="text" name="bankName" value={formData.bankDetails.bankName} onChange={(e) => handleNestedChange('bankDetails', e)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Account Number <span className="text-red-500">*</span></label>
                <input type="password" name="accountNumber" value={formData.bankDetails.accountNumber} onChange={(e) => handleNestedChange('bankDetails', e)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">IFSC Code <span className="text-red-500">*</span></label>
                <input type="text" name="ifscCode" value={formData.bankDetails.ifscCode} onChange={(e) => handleNestedChange('bankDetails', e)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 uppercase text-sm transition-all" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-medium text-gray-700 mb-1">UPI ID (Optional)</label>
                <input type="text" name="upiId" value={formData.bankDetails.upiId} onChange={(e) => handleNestedChange('bankDetails', e)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none text-gray-900 text-sm transition-all" placeholder="example@upi" />
              </div>
            </div>
          </section>

          <section className="bg-green-50 border border-green-200 p-4 rounded-2xl mt-8">
            <div className="flex items-start">
              <FiCheckCircle className="text-green-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-green-900 font-bold text-sm mb-1">Application Ready to Submit</h4>
                <p className="text-[11px] text-green-700">By submitting, you agree to our Terms of Service and Privacy Policy. Any false information may lead to account suspension.</p>
                <button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all flex justify-center items-center shadow-sm disabled:opacity-50 text-sm">
                  {isSubmitting ? <LogoLoader inline size="w-5 h-5"/> : 'Submit Registration'}
                </button>
              </div>
            </div>
          </section>

        </div>
      );
    }


  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col items-center pb-8 pt-4 sm:pt-8 px-4 sm:px-0">
      
      {/* Top Role Selector Tabs */}
      <div className="w-full max-w-2xl mb-4">
        <div className="flex rounded-xl bg-white p-1.5 border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('Worker')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center transition-all ${activeTab === 'Worker' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
          >
            <FiTool className="mr-2" /> Worker registration
          </button>
          <button 
            onClick={() => navigate('/engineer/signup')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center transition-all ${activeTab === 'Engineer' ? 'bg-[#4F46E5] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
          >
            <FiBriefcase className="mr-2" /> Engineer registration
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-xl shadow-gray-200/50 relative">
        
        {/* App Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center">
            {currentStepIndex > 0 ? (
              <button onClick={prevStep} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors mr-3 shadow-sm">
                <FiArrowLeft />
              </button>
            ) : (
              <Link to="/engineer/login" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors mr-3 shadow-sm">
                <FiArrowLeft />
              </Link>
            )}
            <h1 className="text-gray-900 font-bold text-lg">{activeTab} Registration</h1>
          </div>
          <span className="text-xs text-[#4F46E5] font-bold tracking-wider">WBI</span>
        </div>

        <div className="p-6">
          {/* Progress Bar Header */}
          <div className="mb-8 relative z-0 max-w-md mx-auto">
            {/* The line behind */}
            <div className="absolute top-3.5 left-8 right-8 h-0.5 bg-gray-200 -z-10">
               <div className="h-full bg-[#4F46E5] transition-all duration-500" style={{ width: `${(currentStepIndex / (stepTitles.length - 1)) * 100}%` }} />
            </div>
            
            <div className="flex justify-between items-start">
              {stepTitles.map((title, idx) => {
                const isActive = idx === currentStepIndex;
                const isCompleted = idx < currentStepIndex;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 mb-1.5 shadow-sm
                      ${isCompleted ? 'bg-[#4F46E5] text-white border-2 border-[#4F46E5]' : isActive ? 'bg-white border-2 border-[#4F46E5] text-[#4F46E5] ring-4 ring-[#4F46E5]/10' : 'bg-white border-2 border-gray-300 text-gray-400'}`}
                    >
                      {isCompleted ? <FiCheckCircle size={14} /> : idx + 1}
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-bold tracking-wide ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="min-h-[250px] relative">
            {renderStepContent()}
          </div>

          {currentStepIndex < stepTitles.length - 1 && (
            <div className="mt-8 pt-4 border-t border-gray-100">
              <button onClick={nextStep} className="w-full bg-[#4F46E5] text-white py-3 rounded-xl font-bold transition-all flex justify-center items-center hover:bg-[#4338ca] shadow-md shadow-[#4F46E5]/20">
                Continue to {stepTitles[currentStepIndex + 1]} <FiArrowRight className="ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default WorkerSignup;
