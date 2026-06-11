import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight, FiArrowLeft, FiChevronLeft } from 'react-icons/fi';
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
        return { ...prev, serviceCategories: prev.serviceCategories.filter(id => id !== categoryId) };
      } else {
        return { ...prev, serviceCategories: [...prev.serviceCategories, categoryId] };
      }
    });
  };

  const validateStep = (step) => {
    if (step === 1) {
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
      if (!formData.address.pincode) {
        toast.error("Please provide your Pincode.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (config?.categories?.length > 0 && formData.serviceCategories.length === 0) {
        toast.error("Please select at least one service category");
        return false;
      }
      return true;
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
        const cat = config?.categories?.find(c => c.id === id);
        return cat ? cat.title : id;
      });

      const payload = {
        ...formData,
        roleType: 'Worker',
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
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-white text-[#4F46E5] shadow-sm"
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
        <Link to="/worker/login" className="text-sm font-semibold text-[#4F46E5] hover:text-[#4338ca]">Sign In</Link>
      </nav>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            
            {/* Stepper Header */}
            <div className="flex items-center mb-8 max-w-sm">
              {[1, 2].map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shrink-0 ${currentStep >= step ? 'bg-[#4F46E5] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {step}
                  </div>
                  {step < 2 && <div className={`flex-1 h-1 mx-2 rounded-full ${currentStep > step ? 'bg-[#4F46E5]' : 'bg-gray-100'}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <h2 className="text-xl font-bold">Step 1: Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                    <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border rounded-lg p-2 text-sm" placeholder="e.g. Ramesh Sharma" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number *</label>
                    <div className="flex gap-2">
                       <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">+91</span>
                       <input name="phone" value={formData.phone} onChange={(e) => setFormData(p => ({...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10)}))} type="tel" className="w-full border rounded-r-lg p-2 text-sm" placeholder="10-digit number" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                    <input name="password" value={formData.password} onChange={handleChange} type="password" placeholder="Create a strong password" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Current City *</label>
                    <input name="city" value={formData.address.city} onChange={(e) => handleNestedChange('address', e)} type="text" placeholder="e.g. Indore, MP" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pin Code *</label>
                    <input name="pincode" value={formData.address.pincode} onChange={(e) => handleNestedChange('address', e)} type="text" placeholder="452001" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Services */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <h2 className="text-xl font-bold">Step 2: Services Offered</h2>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Service Categories *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {config?.categories?.map(cat => {
                      const isSelected = formData.serviceCategories.includes(cat.id);
                      return (
                        <div 
                          key={cat.id} 
                          onClick={() => handleCategoryToggle(cat.id)}
                          className={`px-3 py-2.5 border rounded-xl cursor-pointer transition-all flex items-center ${isSelected ? 'border-[#4F46E5] bg-[#4F46E5]/5 text-[#4F46E5] shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                        >
                          {cat.icon && <img src={cat.icon} className={`w-5 h-5 mr-2 object-contain ${isSelected ? '' : 'grayscale opacity-60'}`} alt=""/>}
                          <span className="text-xs font-semibold truncate">{cat.title}</span>
                        </div>
                      );
                    })}
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

              {currentStep < 2 ? (
                <button onClick={nextStep} className="px-8 py-2 bg-[#4F46E5] text-white rounded-xl font-medium shadow-md hover:bg-[#4338ca] flex items-center gap-2">
                  Continue <FiArrowRight />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-2 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 flex items-center gap-2">
                  {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                </button>
              )}
            </div>

          </div>
      </main>
    </div>
  );
}
