import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiBriefcase } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import engineerService from '../../../../services/engineerService';
import { engineerAuthService } from '../../../../services/authService';
import LogoLoader from '../../../../components/common/LogoLoader';

export default function Skills() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Configuration Data
  const [categories, setCategories] = useState([]);
  const [allSubServices, setAllSubServices] = useState([]);
  
  // User Selection State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Master Config (Categories, SubServices, Skills)
        const configRes = await engineerAuthService.getRegistrationConfig();
        if (configRes.success) {
          setCategories(configRes.config.categories || []);
          setAllSubServices(configRes.config.subServices || []);
        }

        // 2. Fetch User Profile
        const profileRes = await engineerService.getProfile();
        if (profileRes.success && profileRes.engineer) {
          const profile = profileRes.engineer;
          
          // Pre-fill existing selections
          if (profile.serviceCategories && profile.serviceCategories.length > 0) {
            // Find category ID by name
            const cat = configRes.config.categories?.find(c => c.title === profile.serviceCategories[0]);
            if (cat) setSelectedCategory(cat.id);
          }
          
          if (profile.subServices && profile.subServices.length > 0) {
            setSelectedSubServices(profile.subServices);
          }
          
          if (profile.secondarySkills && profile.secondarySkills.length > 0) {
            setSelectedSkills(profile.secondarySkills);
          }
        }
      } catch (error) {
        toast.error('Failed to load skills data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived available options based on current selections
  const availableSubServices = allSubServices.filter(s => s.categoryId === selectedCategory);
  
  // Get all required skills from the selected subservices
  const availableSkills = Array.from(new Set(
    allSubServices
      .filter(s => selectedSubServices.includes(s.name))
      .flatMap(s => s.requiredSkills || [])
  ));

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubServices([]); // Reset sub-services when category changes
    setSelectedSkills([]); // Reset skills
  };

  const toggleSubService = (subServiceName) => {
    setSelectedSubServices(prev => {
      const isSelected = prev.includes(subServiceName);
      const newSelection = isSelected 
        ? prev.filter(name => name !== subServiceName)
        : [...prev, subServiceName];
      
      // Also clean up skills that no longer belong to selected sub-services
      const validSkills = new Set(
        allSubServices
          .filter(s => newSelection.includes(s.name))
          .flatMap(s => s.requiredSkills || [])
      );
      setSelectedSkills(currentSkills => currentSkills.filter(skill => validSkills.has(skill)));
      
      return newSelection;
    });
  };

  const toggleSkill = (skillName) => {
    setSelectedSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(name => name !== skillName)
        : [...prev, skillName]
    );
  };

  const handleSave = async () => {
    if (!selectedCategory) {
      toast.error('Please select a primary category');
      return;
    }
    if (selectedSubServices.length === 0) {
      toast.error('Please select at least one sub-service');
      return;
    }

    try {
      setIsSaving(true);
      const categoryName = categories.find(c => c.id === selectedCategory)?.title;
      
      const payload = {
        serviceCategories: [categoryName], // Store as array of strings
        subServices: selectedSubServices,
        secondarySkills: selectedSkills,
      };

      const response = await engineerService.updateProfile(payload);
      if (response.success) {
        toast.success('Skills & Expertise updated successfully');
        navigate(-1);
      } else {
        toast.error(response.message || 'Failed to update details');
      }
    } catch (error) {
      toast.error('Failed to update skills & expertise');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LogoLoader />;

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A] pb-24">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-gray-50 active:scale-95 transition-all">
            <FiArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold">Skills & Expertise</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-[#4F46E5] text-white text-sm font-semibold rounded-xl hover:bg-[#4338CA] transition-colors disabled:opacity-50"
        >
          {isSaving ? <LogoLoader inline size="w-4 h-4" /> : 'Save'}
        </button>
      </div>

      <main className="px-4 pt-6 space-y-8 max-w-3xl mx-auto">
        {/* Step 1: Category Selection */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-1">Primary Field</h2>
          <p className="text-sm text-gray-500 mb-6">Select your main area of expertise.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map(category => {
              const isSelected = selectedCategory === category.id;
              
              // Dynamic Icon Rendering
              const renderIcon = (iconStr) => {
                if (!iconStr) return <FiBriefcase className="w-6 h-6" />;
                if (iconStr.includes('/') || iconStr.includes('.')) return <img src={iconStr} alt="" className="w-6 h-6 object-contain" />;
                
                // Fallback to basic material icon string if not a known Fi icon (we don't import all dynamically here to save bundle size, 
                // but we can map common ones or just use a generic icon)
                // Actually, let's use a generic beautiful icon for all categories to ensure it looks professional
                return <FiBriefcase className="w-5 h-5" />;
              };

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`relative flex items-center p-4 rounded-2xl border-2 transition-all text-left overflow-hidden group ${
                    isSelected 
                      ? 'border-[#4F46E5] bg-[#4F46E5]/5 shadow-sm' 
                      : 'border-gray-100 hover:border-gray-200 bg-white hover:shadow-sm'
                  }`}
                >
                  {/* Selected Indicator Line */}
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#4F46E5] rounded-l-2xl" />}
                  
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                    isSelected ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-200' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                  }`}>
                    {renderIcon(category.icon)}
                  </div>
                  
                  <div className="flex-1">
                    <span className={`block font-bold text-sm ${isSelected ? 'text-[#4F46E5]' : 'text-gray-800'}`}>
                      {category.title}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {isSelected ? 'Selected Field' : 'Tap to select'}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shadow-sm">
                      <FiCheck className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Sub-Services Selection */}
        {selectedCategory && (
          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 animate-fade-in">
            <h2 className="text-lg font-bold mb-1">Specializations</h2>
            <p className="text-sm text-gray-500 mb-6">Select the specific services you provide.</p>
            
            {availableSubServices.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {availableSubServices.map(subService => {
                  const isSelected = selectedSubServices.includes(subService.name);
                  return (
                    <button
                      key={subService.id}
                      onClick={() => toggleSubService(subService.name)}
                      className={`flex items-center px-4 py-2.5 rounded-full border transition-all text-sm font-medium ${
                        isSelected 
                          ? 'border-[#4F46E5] bg-[#4F46E5] text-white shadow-sm' 
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && <FiCheck className="mr-2 w-4 h-4" />}
                      {subService.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                No specializations available for this field.
              </div>
            )}
          </section>
        )}

        {/* Step 3: Specific Skills Selection */}
        {selectedSubServices.length > 0 && availableSkills.length > 0 && (
          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 animate-fade-in">
            <h2 className="text-lg font-bold mb-1">Technical Skills</h2>
            <p className="text-sm text-gray-500 mb-6">Select specific tools, frameworks, or skills you are proficient in.</p>
            
            <div className="flex flex-wrap gap-2">
              {availableSkills.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`flex items-center px-3 py-1.5 rounded-lg border transition-all text-sm ${
                      isSelected 
                        ? 'border-[#10B981] bg-[#ECFDF5] text-[#059669] font-medium' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
