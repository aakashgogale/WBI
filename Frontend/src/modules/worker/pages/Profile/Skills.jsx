import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiBriefcase, FiX, FiPlus, FiAlertCircle, FiSettings, FiTool, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import workerService from '../../../../services/workerService';
import { workerAuthService } from '../../../../services/authService';
import LogoLoader from '../../../../components/common/LogoLoader';

export default function WorkerSkills() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Master Configuration
  const [categories, setCategories] = useState([]);
  const [allSubServices, setAllSubServices] = useState([]);
  
  // Selections
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [isCategoryPreExisting, setIsCategoryPreExisting] = useState(false);
  
  // Custom tag input field state for each subservice
  const [customInputMap, setCustomInputMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Config
        const configRes = await workerAuthService.getRegistrationConfig();
        let loadedCategories = [];
        if (configRes.success) {
          loadedCategories = configRes.config.categories || [];
          setCategories(loadedCategories);
          setAllSubServices(configRes.config.subServices || []);
        }

        // 2. Fetch User Profile
        const profileRes = await workerService.getProfile();
        if (profileRes.success && profileRes.worker) {
          const profile = profileRes.worker;
          
          if (profile.serviceCategories && profile.serviceCategories.length > 0) {
            const cat = loadedCategories.find(c => (c.name || c.title) === profile.serviceCategories[0]);
            if (cat) {
              setSelectedCategory(cat._id || cat.id);
              setIsCategoryPreExisting(true);
            }
          }
          
          if (profile.subServices && profile.subServices.length > 0) {
            const mapped = profile.subServices.map(s => ({
              subServiceId: s.subServiceId?._id || s.subServiceId || '',
              name: s.name || '',
              skills: s.skills || [],
              customSkills: s.customSkills || [],
              tools: s.tools || [],
              experienceLevel: s.experienceLevel || '',
              yearsOfExperience: s.yearsOfExperience || 0
            })).filter(s => s.subServiceId);
            setSelectedSubServices(mapped);
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load profile skills');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubServices([]);
  };

  const toggleSubService = (subService) => {
    setSelectedSubServices(prev => {
      const exists = prev.find(s => s.subServiceId === subService._id);
      if (exists) {
        return [];
      } else {
        return [{
          subServiceId: subService._id,
          name: subService.name,
          skills: [],
          customSkills: [],
          tools: [],
          experienceLevel: '',
          yearsOfExperience: 0
        }];
      }
    });
  };

  const updateSubServiceField = (subServiceId, field, value) => {
    setSelectedSubServices(prev => prev.map(s => 
      s.subServiceId === subServiceId ? { ...s, [field]: value } : s
    ));
  };

  const toggleSkill = (subServiceId, skillName) => {
    setSelectedSubServices(prev => prev.map(s => {
      if (s.subServiceId === subServiceId) {
        const skills = s.skills.includes(skillName)
          ? s.skills.filter(name => name !== skillName)
          : [...s.skills, skillName];
        return { ...s, skills };
      }
      return s;
    }));
  };

  const toggleTool = (subServiceId, toolName) => {
    setSelectedSubServices(prev => prev.map(s => {
      if (s.subServiceId === subServiceId) {
        const tools = s.tools.includes(toolName)
          ? s.tools.filter(name => name !== toolName)
          : [...s.tools, toolName];
        return { ...s, tools };
      }
      return s;
    }));
  };

  const handleAddCustomSkill = (subServiceId) => {
    const rawVal = customInputMap[subServiceId] || '';
    const cleanSkill = rawVal.trim();
    if (!cleanSkill) return;

    setSelectedSubServices(prev => prev.map(s => {
      if (s.subServiceId === subServiceId) {
        const exists = s.customSkills.some(cs => cs.name.toLowerCase() === cleanSkill.toLowerCase());
        if (exists) {
          toast.error('Skill already exists!');
          return s;
        }
        toast.success(`Custom skill "${cleanSkill}" added as pending approval.`);
        return {
          ...s,
          customSkills: [...s.customSkills, { name: cleanSkill, status: 'pending' }]
        };
      }
      return s;
    }));

    setCustomInputMap(prev => ({ ...prev, [subServiceId]: '' }));
  };

  const removeCustomSkill = (subServiceId, skillName) => {
    setSelectedSubServices(prev => prev.map(s => {
      if (s.subServiceId === subServiceId) {
        return {
          ...s,
          customSkills: s.customSkills.filter(cs => cs.name.toLowerCase() !== skillName.toLowerCase())
        };
      }
      return s;
    }));
  };

  const handleSave = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category.');
      return;
    }
    if (selectedSubServices.length === 0) {
      toast.error('Please select at least one specialization subservice.');
      return;
    }

    // Validation check for years of experience
    for (const ss of selectedSubServices) {
      if (ss.yearsOfExperience !== '' && (isNaN(ss.yearsOfExperience) || parseInt(ss.yearsOfExperience, 10) < 0)) {
        toast.error(`Please enter valid years of experience for ${ss.name}`);
        return;
      }
    }

    try {
      setIsSaving(true);
      const cat = categories.find(c => c._id === selectedCategory);
      const catName = cat ? cat.name : '';

      const payload = {
        serviceCategories: [catName],
        subServices: selectedSubServices.map(s => ({
          subServiceId: s.subServiceId,
          name: s.name,
          skills: s.skills,
          customSkills: s.customSkills.map(cs => ({ name: cs.name, status: cs.status })),
          tools: s.tools,
          experienceLevel: s.experienceLevel,
          yearsOfExperience: parseInt(s.yearsOfExperience, 10) || 0
        }))
      };

      const res = await workerService.updateSkillsProfile(payload);
      if (res.success) {
        toast.success('Profile skills updated successfully!');
        navigate(-1);
      } else {
        toast.error(res.message || 'Failed to update skills');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating skills');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LogoLoader />;

  const availableSubServices = allSubServices.filter(s => s.categoryId?.toString() === selectedCategory?.toString());

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A] pb-24">
      {/* Header */}
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
          className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <main className="px-4 pt-6 space-y-6 max-w-3xl mx-auto">
        {/* Category Domain */}
        {isCategoryPreExisting ? (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold mb-1">Your Registered Category</h2>
            <p className="text-xs text-gray-500 mb-4">Your core category domain registered at WBI.</p>
            
            <div className="flex items-center p-4 rounded-2xl border border-gray-200/50 bg-gray-50/50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-black text-white">
                <FiBriefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-bold text-sm text-black">
                  {categories.find(c => c._id?.toString() === selectedCategory?.toString())?.name || 'Loading category...'}
                </span>
                <span className="block text-[10px] text-gray-500 mt-0.5">
                  Core domain category cannot be changed.
                </span>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold mb-1">Primary Domain Category</h2>
            <p className="text-xs text-gray-500 mb-4">Select your primary service category domain.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map(cat => {
                const isSelected = selectedCategory === cat._id;
                return (
                  <button
                    key={cat._id}
                    onClick={() => handleCategorySelect(cat._id)}
                    className={`flex items-center p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${
                      isSelected ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'
                    }`}>
                      <FiBriefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`block font-bold text-sm ${isSelected ? 'text-black' : 'text-gray-800'}`}>
                        {cat.name}
                      </span>
                    </div>
                    {isSelected && <FiCheck className="ml-auto text-black w-5 h-5" />}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Specializations selection */}
        {selectedCategory && (
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold mb-1">Specializations</h2>
            <p className="text-xs text-gray-500 mb-4">Choose the sub-services you can work on.</p>

            <div className="flex flex-wrap gap-2.5">
              {availableSubServices.map(sub => {
                const isSelected = selectedSubServices.some(s => s.subServiceId === sub._id);
                return (
                  <button
                    key={sub._id}
                    onClick={() => toggleSubService(sub)}
                    className={`flex items-center px-4 py-2.5 rounded-full border transition-all text-xs font-semibold ${
                      isSelected 
                        ? 'border-black bg-black text-white shadow-sm' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && <FiCheck className="mr-1.5 w-3.5 h-3.5" />}
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Configurations for selected SubServices */}
        {selectedSubServices.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-gray-400 uppercase tracking-wider ml-1">Configure specializations</h3>
            
            {selectedSubServices.map(subService => {
              const subConfig = allSubServices.find(s => s._id === subService.subServiceId);
              const availableSkills = subConfig?.requiredSkills || [];
              const availableTools = subConfig?.suggestedTools || [];

              return (
                <section key={subService.subServiceId} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b pb-4 border-gray-100">
                    <h4 className="font-extrabold text-gray-800 text-base flex items-center gap-2">
                      <FiSettings className="text-black w-5 h-5" />
                      {subService.name}
                    </h4>
                    <button 
                      onClick={() => setSelectedSubServices(prev => prev.filter(s => s.subServiceId !== subService.subServiceId))}
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Remove Specialization"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Experience Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-0.5">Experience Level</label>
                      <select
                        value={subService.experienceLevel}
                        onChange={(e) => updateSubServiceField(subService.subServiceId, 'experienceLevel', e.target.value)}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/15 focus:border-black transition-all bg-white"
                      >
                        <option value="">Select Level</option>
                        <option value="Fresher (0–1 year)">Fresher (0–1 year)</option>
                        <option value="Junior (1–3 years)">Junior (1–3 years)</option>
                        <option value="Mid-level (3–6 years)">Mid-level (3–6 years)</option>
                        <option value="Senior (6–10 years)">Senior (6–10 years)</option>
                        <option value="Expert (10+ years)">Expert (10+ years)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 ml-0.5">Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        value={subService.yearsOfExperience || ''}
                        onChange={(e) => updateSubServiceField(subService.subServiceId, 'yearsOfExperience', e.target.value)}
                        placeholder="e.g. 3"
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/15 focus:border-black transition-all"
                      />
                    </div>
                  </div>

                  {/* Skills Grid */}
                  {availableSkills.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-600 ml-0.5">Suggested Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {availableSkills.map(skill => {
                          const isChecked = subService.skills.includes(skill);
                          return (
                            <button
                              key={skill}
                              onClick={() => toggleSkill(subService.subServiceId, skill)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                                isChecked 
                                  ? 'bg-black/5 text-black border-black/30' 
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {isChecked && <FiCheck className="w-3.5 h-3.5" />}
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Suggested Tools Grid */}
                  {availableTools.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-600 ml-0.5 flex items-center gap-1">
                        <FiTool className="w-3.5 h-3.5" /> Suggested Tools & Equipment
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableTools.map(tool => {
                          const isChecked = subService.tools.includes(tool);
                          return (
                            <button
                              key={tool}
                              onClick={() => toggleTool(subService.subServiceId, tool)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                                isChecked 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {isChecked && <FiCheck className="w-3.5 h-3.5" />}
                              {tool}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom Skills Tag Input */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-gray-600 ml-0.5">Custom Key Skills</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add custom key skill..."
                        value={customInputMap[subService.subServiceId] || ''}
                        onChange={(e) => setCustomInputMap(prev => ({ ...prev, [subService.subServiceId]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSkill(subService.subServiceId))}
                        className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/15 focus:border-black transition-all"
                      />
                      <button
                        onClick={() => handleAddCustomSkill(subService.subServiceId)}
                        className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {/* Custom Skill Chips */}
                    {subService.customSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                        {subService.customSkills.map(cs => {
                          const status = cs.status || 'pending';
                          let badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
                          let labelText = 'Pending Approval';
                          if (status === 'approved') {
                            badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                            labelText = 'Approved';
                          } else if (status === 'rejected') {
                            badgeBg = 'bg-red-50 text-red-700 border-red-200';
                            labelText = 'Rejected';
                          }

                          return (
                            <span
                              key={cs.name}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-xs font-semibold border border-gray-150 rounded-lg animate-fadeIn shadow-2xs"
                            >
                              <span>{cs.name}</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${badgeBg}`}>
                                {labelText}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeCustomSkill(subService.subServiceId, cs.name)}
                                className="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors ml-0.5"
                              >
                                <FiX className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
