import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLock, FiCheckCircle, FiArrowRight, FiArrowLeft, FiChevronLeft, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import LogoLoader from '../../../components/common/LogoLoader';
import { engineerAuthService } from '../../../services/authService';
import Logo from '../../../components/common/Logo';

export default function EngineerSignup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    serviceCategories: [],
    subServices: [],
    skills: [],
  });

  useEffect(() => {
    localStorage.removeItem('engineerAccessToken');
    localStorage.removeItem('engineerRefreshToken');
    localStorage.removeItem('engineerData');
    
    const loadConfig = async () => {
      try {
        const response = await engineerAuthService.getRegistrationConfig();
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

  const handleCategoryToggle = (categoryName) => {
    setFormData(prev => {
      const isSelected = prev.serviceCategories.includes(categoryName);
      if (isSelected) {
        // Find category ID to clear its subservices
        const catId = config?.categories?.find(c => c.title === categoryName || c.name === categoryName)?.id;
        const subServicesToRemove = config?.subServices
          ?.filter(sub => sub.categoryId === catId)
          ?.map(sub => sub.name) || [];
          
        const newSubServices = prev.subServices.filter(name => !subServicesToRemove.includes(name));
        
        // Clean up skills that belong to removed subservices
        const validSkills = new Set(
          (config?.subServices || [])
            .filter(s => newSubServices.includes(s.name))
            .flatMap(s => s.requiredSkills || [])
        );
        
        return { 
          ...prev, 
          serviceCategories: prev.serviceCategories.filter(name => name !== categoryName),
          subServices: newSubServices,
          secondarySkills: (prev.secondarySkills || []).filter(skill => validSkills.has(skill))
        };
      } else {
        return { ...prev, serviceCategories: [...prev.serviceCategories, categoryName] };
      }
    });
  };

  const handleSubServiceToggle = (subServiceName) => {
    setFormData(prev => {
      const isSelected = prev.subServices.includes(subServiceName);
      let newSubServices;
      if (isSelected) {
        newSubServices = prev.subServices.filter(name => name !== subServiceName);
      } else {
        newSubServices = [...prev.subServices, subServiceName];
      }
      
      // Clean up skills that belong to removed subservices
      const validSkills = new Set(
        (config?.subServices || [])
          .filter(s => newSubServices.includes(s.name))
          .flatMap(s => s.requiredSkills || [])
      );
      
      return { 
        ...prev, 
        subServices: newSubServices,
        secondarySkills: (prev.secondarySkills || []).filter(skill => validSkills.has(skill))
      };
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

    const configMaxStep = Math.max(...(config?.steps?.map(s => s.step) || [1]));
    const computedTotalSteps = config?.categories?.length > 0 ? configMaxStep + 1 : Math.max(configMaxStep, 2);
    
    if (step === computedTotalSteps && config?.categories?.length > 0) {
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

      const subServicesPayload = formData.subServices.map(name => {
        const sub = config?.subServices?.find(s => s.name === name || s.title === name);
        return {
          subServiceId: sub ? (sub.id || sub._id) : null,
          name: name,
          skills: [],
          customSkills: [],
          experienceLevel: '',
          yearsOfExperience: 0
        };
      }).filter(s => s.subServiceId !== null);

      const payload = {
        ...formData,
        roleType: 'Engineer',
        serviceCategories: categoryTitles,
        subServices: subServicesPayload,
        secondarySkills: [],
      };

      const response = await engineerAuthService.register(payload);
      if (response.success) {
        toast.success(
          <div className="flex flex-col">
            <span className="font-bold">Welcome Onboard!</span>
            <span className="text-xs">Your account is pending approval.</span>
          </div>,
          { icon: <FiCheckCircle className="text-green-500" /> }
        );
        navigate('/engineer/login', { replace: true });
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
  const configMaxStep = Math.max(...(config?.steps?.map(s => s.step) || [1]));
  const totalSteps = config?.categories?.length > 0 ? configMaxStep + 1 : Math.max(configMaxStep, 2);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white px-6 py-4 border-b flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/engineer/login" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
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
            <div className="flex items-center justify-between mb-8 max-w-sm mx-auto">
              {Array.from({length: totalSteps}, (_, i) => i + 1).map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm shrink-0 shadow-sm transition-all ${currentStep >= step ? 'bg-[#4F46E5] text-white ring-4 ring-[#4F46E5]/20' : 'bg-gray-100 text-gray-400'}`}>
                    {step}
                  </div>
                  {step < totalSteps && <div className={`flex-1 h-1.5 mx-3 rounded-full transition-all ${currentStep > step ? 'bg-[#4F46E5]' : 'bg-gray-100'}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Dynamic Step Content */}
            {currentStepData && currentStepData.fields && currentStepData.fields.length > 0 && (
              <div className="space-y-5 animate-fadeIn">
                <h2 className="text-xl font-bold">{currentStepData.title || `Step ${currentStep}`}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentStepData.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{field.label} {field.required && '*'}</label>
                      <div className="relative">
                        {field.type === 'tel' ? (
                          <div className="relative flex">
                            <div className="flex items-center justify-center bg-gray-100 border border-gray-200 border-r-0 rounded-l-xl px-4 text-gray-500 font-medium text-sm">
                              +91
                            </div>
                            <input 
                              name={field.key} 
                              value={formData[field.key] || ''} 
                              onChange={(e) => setFormData(p => ({...p, [field.key]: e.target.value.replace(/\D/g, '').slice(0, 10)}))} 
                              type="tel" 
                              className="w-full bg-gray-50 border border-gray-200 rounded-r-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all" 
                              placeholder="10-digit number" 
                            />
                          </div>
                        ) : field.type === 'select' ? (
                          <select
                            name={field.key}
                            value={formData[field.key] || ''}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
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
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all" 
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
              <div className="space-y-5 animate-fadeIn">
                <h2 className="text-xl font-bold">Step {totalSteps}: Services Offered</h2>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Service Categories *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {config?.categories?.map(cat => {
                      const isSelected = formData.serviceCategories.includes(cat.title || cat.name);
                      
                      const renderIcon = (iconStr) => {
                        if (!iconStr) return <FiBriefcase className="w-4 h-4 mr-2" />;
                        if (iconStr.includes('/') || iconStr.includes('.')) return <img src={iconStr} className={`w-5 h-5 mr-2 object-contain ${isSelected ? '' : 'grayscale opacity-60'}`} alt=""/>;
                        return <FiBriefcase className={`w-4 h-4 mr-2 ${isSelected ? 'text-[#4F46E5]' : 'text-gray-400'}`} />;
                      };

                      return (
                        <div key={cat.id || cat._id} className={`border rounded-xl transition-all flex flex-col overflow-hidden ${isSelected ? 'border-[#4F46E5] bg-[#4F46E5]/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <div 
                            onClick={() => handleCategoryToggle(cat.title || cat.name)}
                            className="px-3 py-2.5 cursor-pointer flex items-center"
                          >
                            {renderIcon(cat.icon)}
                            <span className={`text-xs font-semibold truncate ${isSelected ? 'text-[#4F46E5]' : 'text-gray-600'}`}>{cat.name || cat.title}</span>
                          </div>
                          
                          {/* Sub Services */}
                          {isSelected && config?.subServices?.some(sub => sub.categoryId === (cat.id || cat._id)) && (
                            <div className="px-3 pb-3 space-y-1.5 border-t border-[#4F46E5]/10 pt-2 mt-auto">
                              {config.subServices
                                .filter(sub => sub.categoryId === (cat.id || cat._id))
                                .map(sub => {
                                  const isSubSelected = formData.subServices.includes(sub.name);
                                  return (
                                    <div 
                                      key={sub.id || sub._id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubServiceToggle(sub.name);
                                      }}
                                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all flex items-center ${isSubSelected ? 'bg-[#4F46E5] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                                    >
                                      {sub.name}
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
            <div className="flex gap-4 pt-6 border-t mt-8">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="flex-1 py-3.5 border-2 border-gray-200 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all">
                  <FiChevronLeft className="w-5 h-5" /> Back
                </button>
              )}
              {currentStep < totalSteps ? (
                <button type="button" onClick={nextStep} className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black active:scale-95 shadow-lg shadow-gray-900/30 transition-all">
                  Next Step <FiArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black active:scale-95 shadow-lg shadow-gray-900/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Submitting...' : 'Complete Registration'} <FiCheckCircle className="w-5 h-5" />
                </button>
              )}
            </div>

          </div>
      </main>
    </div>
  );
}
