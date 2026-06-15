import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight, FiArrowLeft, FiChevronLeft, FiUser, FiPhone, FiLock, FiMapPin, FiMail } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { workerAuthService } from '../../../services/authService';
import Logo from '../../../components/common/Logo';
import LogoLoader from '../../../components/common/LogoLoader';
import { z } from "zod";

export default function WorkerSignup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    serviceCategories: [],
    subServices: [],
    address: { city: '', pincode: '' }
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const isSelected = prev.serviceCategories.includes(categoryId);
      if (isSelected) {
        const subServicesToRemove = config?.subServices
          ?.filter(sub => sub.categoryId === categoryId)
          ?.map(sub => sub.id || sub._id) || [];
        return { 
          ...prev, 
          serviceCategories: prev.serviceCategories.filter(id => id !== categoryId),
          subServices: (prev.subServices || []).filter(id => !subServicesToRemove.includes(id))
        };
      } else {
        return { ...prev, serviceCategories: [...prev.serviceCategories, categoryId] };
      }
    });
  };

  const handleSubServiceToggle = (subServiceId) => {
    setFormData(prev => {
      const isSelected = (prev.subServices || []).includes(subServiceId);
      if (isSelected) {
        return {
          ...prev,
          subServices: prev.subServices.filter(id => id !== subServiceId)
        };
      } else {
        return {
          ...prev,
          subServices: [...(prev.subServices || []), subServiceId]
        };
      }
    });
  };

  const validateStep = (step) => {
    const stepData = config?.steps?.find(s => s.step === step);
    if (stepData && stepData.fields) {
      for (const field of stepData.fields) {
        if (field.required && !formData[field.key]) {
          toast.error(`Please provide your ${field.label}.`);
          return false;
        }
        if (field.validation) {
          if (field.validation.pattern) {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(formData[field.key])) {
              toast.error(field.validation.errorMessage || `Invalid format for ${field.label}`);
              return false;
            }
          }
          if (field.validation.min && formData[field.key]?.length < field.validation.min) {
            toast.error(field.validation.errorMessage || `${field.label} must be at least ${field.validation.min} characters`);
            return false;
          }
        }
      }
    }

    const totalSteps = Math.max(...(config?.steps?.map(s => s.step) || [1]), 2);
    if (step === totalSteps && config?.categories?.length > 0) {
      if (formData.serviceCategories.length === 0) {
        toast.error("Please select at least one service category");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      const categoryTitles = formData.serviceCategories.map(id => {
        const cat = config?.categories?.find(c => c.id === id || c._id === id);
        return cat ? (cat.title || cat.name) : id;
      });

      const subServicesPayload = (formData.subServices || []).map(id => {
        const sub = config?.subServices?.find(s => s.id === id || s._id === id);
        return {
          subServiceId: id,
          name: sub ? (sub.name || sub.title) : '',
          skills: [],
          customSkills: [],
          experienceLevel: '',
          yearsOfExperience: 0
        };
      });

      const payload = {
        ...formData,
        roleType: 'Worker',
        serviceCategories: categoryTitles,
        subServices: subServicesPayload,
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
        navigate('/worker/login', { replace: true });
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

  const currentStepData = config?.steps?.find(s => s.step === currentStep);
  const totalSteps = Math.max(...(config?.steps?.map(s => s.step) || [1]), 2); // At least 2 steps (fields + categories)

    const getFieldIcon = (key, type) => {
    const iconClass = "w-4 h-4";
    switch (key.toLowerCase()) {
      case 'name': return <FiUser className={`${iconClass} text-black`} />;
      case 'phone': return <FiPhone className={`${iconClass} text-black`} />;
      case 'email': return <FiMail className={`${iconClass} text-black`} />;
      case 'password': return <FiLock className={`${iconClass} text-black`} />;
      case 'city': 
      case 'pincode': return <FiMapPin className={`${iconClass} text-black`} />;
      default:
        if (type === 'tel') return <FiPhone className={`${iconClass} text-black`} />;
        if (type === 'email') return <FiMail className={`${iconClass} text-black`} />;
        if (type === 'password') return <FiLock className={`${iconClass} text-black`} />;
        return <FiCheckCircle className={`${iconClass} text-gray-600`} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A]">
      <nav className="bg-white px-6 py-4 border-b flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/worker/login" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <Logo />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white text-black shadow-sm"
          >
            Worker
          </button>
          <button 
            onClick={() => navigate('/engineer/signup')}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all text-gray-500 hover:text-gray-700"
          >
            Engineer
          </button>
        </div>
        <Link to="/worker/login" className="text-sm font-bold text-black hover:text-gray-800">Sign In</Link>
      </nav>

      <main className="px-5 pt-8 pb-12 max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50">
            
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-10 max-w-sm mx-auto">
              {Array.from({length: totalSteps}, (_, i) => i + 1).map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-10 h-10 flex items-center justify-center rounded-2xl font-bold text-sm shrink-0 shadow-sm transition-all duration-300 ${currentStep >= step ? 'bg-black text-white shadow-[0_4px_15px_rgba(0,0,0,0.3)]' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                    {step}
                  </div>
                  {step < totalSteps && <div className={`flex-1 h-1.5 mx-3 rounded-full transition-all duration-300 ${currentStep > step ? 'bg-black' : 'bg-gray-100'}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Dynamic Step Content */}
            {currentStepData && currentStepData.fields && currentStepData.fields.length > 0 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-gray-800">{currentStepData.title || `Step ${currentStep}`}</h2>
                  <p className="text-sm text-gray-500 mt-2">Please fill in the required details below</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {currentStepData.fields.map(field => (
                    <div key={field.key} className={field.type === 'password' || field.type === 'email' ? 'md:col-span-2' : ''}>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                        {getFieldIcon(field.key, field.type)} {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      <div className="relative">
                        {field.type === 'tel' ? (
                          <div className="relative flex">
                            <div className="flex items-center justify-center bg-gray-100 border border-gray-100 border-r-0 rounded-l-2xl px-4 text-gray-500 font-medium text-sm">
                              +91
                            </div>
                            <input 
                              name={field.key} 
                              value={formData[field.key] || ''} 
                              onChange={(e) => setFormData(p => ({...p, [field.key]: e.target.value.replace(/\\D/g, '').slice(0, 10)}))} 
                              type="tel" 
                              className="w-full bg-gray-50 border border-gray-100 rounded-r-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all" 
                              placeholder="10-digit number" 
                            />
                          </div>
                        ) : field.type === 'select' ? (
                          <select
                            name={field.key}
                            value={formData[field.key] || ''}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all appearance-none"
                          >
                            <option value="">Select {field.label}</option>
                            {field.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input 
                            name={field.key} 
                            value={formData[field.key] || ''} 
                            onChange={handleChange} 
                            type={field.type === 'password' ? 'password' : field.type === 'email' ? 'email' : 'text'} 
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 transition-all" 
                            placeholder={`Enter ${field.label}`} 
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Step: Services (If config has categories) */}
            {currentStep === totalSteps && config?.categories?.length > 0 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-gray-800">Services Offered</h2>
                  <p className="text-sm text-gray-500 mt-2">Select your category and specializations</p>
                </div>
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {config?.categories?.map(cat => {
                      const isSelected = formData.serviceCategories.includes(cat.id || cat._id);
                      return (
                        <div 
                          key={cat.id || cat._id}
                          className={`border-2 rounded-2xl p-4 transition-all flex flex-col ${isSelected ? 'border-black bg-black/5' : 'border-gray-100 bg-gray-50'}`}
                        >
                          <div 
                            onClick={() => handleCategoryToggle(cat.id || cat._id)}
                            className="cursor-pointer flex items-center gap-3"
                          >
                            {cat.icon && <img src={cat.icon} className={`w-8 h-8 object-contain transition-all ${isSelected ? 'scale-110' : 'grayscale opacity-60'}`} alt=""/>}
                            <span className="text-sm font-bold leading-tight">{cat.name || cat.title}</span>
                          </div>
                          
                          {/* Sub Services */}
                          {isSelected && config?.subServices?.some(sub => sub.categoryId === (cat.id || cat._id)) && (
                            <div className="mt-3 pt-3 border-t border-gray-200/50 space-y-2">
                              {config.subServices
                                .filter(sub => sub.categoryId === (cat.id || cat._id))
                                .map(sub => {
                                  const isSubSelected = (formData.subServices || []).includes(sub.id || sub._id);
                                  return (
                                    <div 
                                      key={sub.id || sub._id}
                                      onClick={() => handleSubServiceToggle(sub.id || sub._id)}
                                      className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-between border ${isSubSelected ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                    >
                                      <span>{sub.name}</span>
                                      {isSubSelected && <FiCheckCircle className="w-4 h-4" />}
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8 mt-8 border-t border-gray-100">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="px-6 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all">
                  <FiChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentStep < totalSteps ? (
                <button type="button" onClick={nextStep} className="flex-1 py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all">
                  Continue <FiArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all disabled:opacity-70 disabled:active:scale-100">
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Complete Registration <FiCheckCircle className="w-5 h-5" /></>
                  )}
                </button>
              )}
            </div>

          </div>
      </main>
    </div>
  );
}
