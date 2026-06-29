import React, { useState, useEffect } from 'react';
import { adminHomeContentService } from '../../../../services/admin/adminHomeContentService';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import { 
  FiSettings, 
  FiList, 
  FiHelpCircle, 
  FiSave, 
  FiPlus, 
  FiTrash2, 
  FiUploadCloud, 
  FiArrowRight, 
  FiEye, 
  FiCheckCircle, 
  FiMenu,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import * as Icons from 'react-icons/fi';

// Dynamic Icon renderer for previews
const PreviewIcon = ({ name, className, style }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return <FiHelpCircle className={className} style={style} />;
  return <IconComponent className={className} style={style} />;
};

const commonIconsList = [
  'FiShield', 'FiDollarSign', 'FiClock', 'FiCheckCircle', 'FiPhoneCall',
  'FiSearch', 'FiCalendar', 'FiUser', 'FiCheckSquare', 'FiSmile',
  'FiHeart', 'FiAward', 'FiThumbsUp', 'FiTrendingUp', 'FiStar',
  'FiCpu', 'FiTool', 'FiMapPin', 'FiActivity', 'FiHardDrive'
];

const HomeContentManagement = () => {
  const [activeTab, setActiveTab] = useState('care_plan');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop or mobile

  // Section States
  const [sections, setSections] = useState({
    care_plan: { title: '', subtitle: '', highlightedText: '', badgeText: '', buttonText: '', buttonRedirect: '', discountText: '', imageUrl: '', items: [], isActive: true },
    why_choose: { title: '', items: [], isActive: true },
    how_it_works: { title: '', items: [], isActive: true }
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const [carePlanRes, whyChooseRes, howItWorksRes] = await Promise.all([
        adminHomeContentService.getSection('care_plan'),
        adminHomeContentService.getSection('why_choose'),
        adminHomeContentService.getSection('how_it_works')
      ]);

      setSections({
        care_plan: carePlanRes.data || sections.care_plan,
        why_choose: whyChooseRes.data || sections.why_choose,
        how_it_works: howItWorksRes.data || sections.how_it_works
      });
    } catch (error) {
      toast.error('Failed to fetch home sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (sectionKey) => {
    const section = sections[sectionKey];
    if (!section) return;

    try {
      setSaving(true);
      toast.loading(`Saving ${sectionKey.replace('_', ' ')} details...`, { id: 'save-action' });

      let res;
      if (section._id) {
        res = await adminHomeContentService.updateSection(sectionKey, section._id, section);
      } else {
        res = await adminHomeContentService.createSection(sectionKey, section);
      }

      if (res.success) {
        // Sync state back
        setSections(prev => ({
          ...prev,
          [sectionKey]: res.data
        }));
        toast.success(`${sectionKey.replace('_', ' ').toUpperCase()} saved successfully!`, { id: 'save-action' });
      } else {
        toast.error(res.message || 'Failed to save', { id: 'save-action' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save', { id: 'save-action' });
    } finally {
      setSaving(false);
    }
  };

  const updateSectionField = (sectionKey, field, val) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: val
      }
    }));
  };

  const updateItemField = (sectionKey, index, field, val) => {
    setSections(prev => {
      const items = [...prev[sectionKey].items];
      items[index] = { ...items[index], [field]: val };
      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          items
        }
      };
    });
  };

  const deleteItem = (sectionKey, index) => {
    setSections(prev => {
      const items = prev[sectionKey].items.filter((_, i) => i !== index);
      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          items
        }
      };
    });
  };

  const addItem = (sectionKey) => {
    setSections(prev => {
      const currentItems = prev[sectionKey].items || [];
      let newItem = { title: '', description: '', isActive: true, sortOrder: currentItems.length };
      
      if (sectionKey === 'care_plan') {
        newItem = { title: '', sortOrder: currentItems.length, isActive: true };
      } else if (sectionKey === 'why_choose') {
        newItem = { title: '', description: '', iconName: 'FiStar', sortOrder: currentItems.length, isActive: true };
      } else if (sectionKey === 'how_it_works') {
        newItem = { title: '', description: '', stepNumber: currentItems.length + 1, iconName: 'FiSearch', sortOrder: currentItems.length, isActive: true };
      }

      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          items: [...currentItems, newItem]
        }
      };
    });
  };

  const moveItem = (sectionKey, index, direction) => {
    setSections(prev => {
      const items = [...prev[sectionKey].items];
      if (direction === 'up' && index > 0) {
        const temp = items[index];
        items[index] = items[index - 1];
        items[index - 1] = temp;
      } else if (direction === 'down' && index < items.length - 1) {
        const temp = items[index];
        items[index] = items[index + 1];
        items[index + 1] = temp;
      }
      // Re-assign sortOrder
      items.forEach((item, idx) => {
        item.sortOrder = idx;
        if (sectionKey === 'how_it_works') {
          item.stepNumber = idx + 1;
        }
      });
      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          items
        }
      };
    });
  };

  const handleFileUpload = async (e, sectionKey, field, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const toastId = toast.loading('Uploading image...', { id: 'upload-image' });
    try {
      const res = await api.post('/admin/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const url = res.data.imageUrl || res.data.url;
        if (index !== null) {
          updateItemField(sectionKey, index, field, url);
        } else {
          updateSectionField(sectionKey, field, url);
        }
        toast.success('Uploaded successfully!', { id: 'upload-image' });
      } else {
        toast.error('Upload failed', { id: 'upload-image' });
      }
    } catch (err) {
      toast.error('Upload failed: ' + err.message, { id: 'upload-image' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10AFA5]"></div>
      </div>
    );
  }

  const currentSection = sections[activeTab];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Home Content Management</h1>
          <p className="text-gray-500 text-sm">Configure and edit dynamic homepage banners, cards, and steps.</p>
        </div>
        <button
          onClick={() => handleSave(activeTab)}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#10AFA5] hover:bg-[#0d8f87] text-white font-semibold rounded-xl shadow-sm transition-all text-sm disabled:opacity-50"
        >
          <FiSave /> Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4 pt-3 rounded-xl shadow-sm">
        {['care_plan', 'why_choose', 'how_it_works'].map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-0.5 capitalize ${
              activeTab === tabKey
                ? 'border-[#10AFA5] text-[#10AFA5]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tabKey.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Editor Form Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 capitalize">{activeTab.replace('_', ' ')} Editor</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSection.isActive}
                  onChange={(e) => updateSectionField(activeTab, 'isActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10AFA5]"></div>
                <span className="ml-2 text-xs font-semibold text-gray-600">
                  {currentSection.isActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>
          </div>

          {/* Form Fields based on tab */}
          {activeTab === 'care_plan' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={currentSection.badgeText}
                    onChange={(e) => updateSectionField('care_plan', 'badgeText', e.target.value)}
                    placeholder="e.g. WBI Care Plan"
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10AFA5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Discount Text Badge</label>
                  <input
                    type="text"
                    value={currentSection.discountText}
                    onChange={(e) => updateSectionField('care_plan', 'discountText', e.target.value)}
                    placeholder="e.g. UP TO 20% SAVINGS*"
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10AFA5] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={currentSection.title}
                  onChange={(e) => updateSectionField('care_plan', 'title', e.target.value)}
                  placeholder="e.g. Peace of mind"
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10AFA5] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Highlighted Title Text</label>
                <input
                  type="text"
                  value={currentSection.highlightedText}
                  onChange={(e) => updateSectionField('care_plan', 'highlightedText', e.target.value)}
                  placeholder="e.g. with WBI Care Plan"
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10AFA5] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Subtitle</label>
                <textarea
                  value={currentSection.subtitle}
                  onChange={(e) => updateSectionField('care_plan', 'subtitle', e.target.value)}
                  placeholder="Subtitle description text..."
                  rows={2}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10AFA5] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={currentSection.buttonText}
                    onChange={(e) => updateSectionField('care_plan', 'buttonText', e.target.value)}
                    placeholder="e.g. Explore Care Plans"
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10AFA5] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">CTA Redirect Path</label>
                  <input
                    type="text"
                    value={currentSection.buttonRedirect}
                    onChange={(e) => updateSectionField('care_plan', 'buttonRedirect', e.target.value)}
                    placeholder="e.g. /user/rewards"
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10AFA5] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Banner Illustration Image</label>
                <div className="flex gap-4 items-center">
                  {currentSection.imageUrl && (
                    <img fetchPriority="low" loading="lazy" src={currentSection.imageUrl} alt="preview" className="w-16 h-16 object-cover rounded-xl border" />
                  )}
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center h-16 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#10AFA5] transition-all">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FiUploadCloud />
                        <span className="text-xs font-semibold">Upload Banner Image</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'care_plan', 'imageUrl')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={currentSection.imageUrl}
                  onChange={(e) => updateSectionField('care_plan', 'imageUrl', e.target.value)}
                  placeholder="Or enter image URL"
                  className="w-full mt-2 px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10AFA5] text-sm"
                />
              </div>

              {/* Benefits list (items) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-700">Benefits List</label>
                  <button
                    onClick={() => addItem('care_plan')}
                    className="flex items-center gap-1 text-xs text-[#10AFA5] font-bold hover:underline"
                  >
                    <FiPlus /> Add Benefit
                  </button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {currentSection.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateItemField('care_plan', idx, 'title', e.target.value)}
                        placeholder="Benefit text..."
                        className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none text-sm bg-white"
                      />
                      <button
                        onClick={() => deleteItem('care_plan', idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'why_choose' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Section Title</label>
                <input
                  type="text"
                  value={currentSection.title}
                  onChange={(e) => updateSectionField('why_choose', 'title', e.target.value)}
                  placeholder="e.g. Why Choose WBI?"
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10AFA5] text-sm"
                />
              </div>

              {/* Cards list */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-700">Service Cards (5 cards recommended)</label>
                  <button
                    onClick={() => addItem('why_choose')}
                    className="flex items-center gap-1 text-xs text-[#10AFA5] font-bold hover:underline"
                  >
                    <FiPlus /> Add Card
                  </button>
                </div>
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  {currentSection.items?.map((item, idx) => (
                    <div key={idx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 relative space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-600">Card #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveItem('why_choose', idx, 'up')}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500"
                            title="Move Up"
                          >
                            <FiArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveItem('why_choose', idx, 'down')}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500"
                            title="Move Down"
                          >
                            <FiArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => deleteItem('why_choose', idx)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded ml-2"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-0.5">Card Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateItemField('why_choose', idx, 'title', e.target.value)}
                            placeholder="e.g. Verified Experts"
                            className="w-full px-3 py-1.5 border rounded-lg focus:outline-none text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-0.5">Icon (FiName from Feather Icons)</label>
                          <select
                            value={item.iconName || 'FiStar'}
                            onChange={(e) => updateItemField('why_choose', idx, 'iconName', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-lg focus:outline-none text-sm bg-white"
                          >
                            {commonIconsList.map(icon => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-500 mb-0.5">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItemField('why_choose', idx, 'description', e.target.value)}
                          placeholder="Short tagline..."
                          className="w-full px-3 py-1.5 border rounded-lg focus:outline-none text-sm bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                        <label className="flex items-center cursor-pointer mt-1">
                          <input
                            type="checkbox"
                            checked={item.isActive}
                            onChange={(e) => updateItemField('why_choose', idx, 'isActive', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#10AFA5]"></div>
                          <span className="ml-2 text-[11px] font-semibold text-gray-500">Active</span>
                        </label>
                        
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer border px-3 py-1 rounded bg-white hover:bg-gray-50">
                            <span className="text-[11px] text-gray-500">Upload Icon File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'why_choose', 'iconUrl', idx)}
                              className="hidden"
                            />
                          </label>
                          {item.iconUrl && (
                            <span className="text-[10px] text-gray-400 block truncate mt-1">URL: {item.iconUrl}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'how_it_works' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Section Title</label>
                <input
                  type="text"
                  value={currentSection.title}
                  onChange={(e) => updateSectionField('how_it_works', 'title', e.target.value)}
                  placeholder="e.g. How It Works"
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10AFA5] text-sm"
                />
              </div>

              {/* Steps timeline list */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-700">Timeline Steps (5 steps recommended)</label>
                  <button
                    onClick={() => addItem('how_it_works')}
                    className="flex items-center gap-1 text-xs text-[#10AFA5] font-bold hover:underline"
                  >
                    <FiPlus /> Add Step
                  </button>
                </div>
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  {currentSection.items?.map((item, idx) => (
                    <div key={idx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 relative space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-600">Step #{idx + 1} (Step Number: {item.stepNumber || (idx + 1)})</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveItem('how_it_works', idx, 'up')}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500"
                            title="Move Up"
                          >
                            <FiArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveItem('how_it_works', idx, 'down')}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500"
                            title="Move Down"
                          >
                            <FiArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => deleteItem('how_it_works', idx)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded ml-2"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-0.5">Step Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateItemField('how_it_works', idx, 'title', e.target.value)}
                            placeholder="e.g. Choose Service"
                            className="w-full px-3 py-1.5 border rounded-lg focus:outline-none text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-gray-500 mb-0.5">Icon (FiName from Feather)</label>
                          <select
                            value={item.iconName || 'FiSearch'}
                            onChange={(e) => updateItemField('how_it_works', idx, 'iconName', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-lg focus:outline-none text-sm bg-white"
                          >
                            {commonIconsList.map(icon => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-500 mb-0.5">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItemField('how_it_works', idx, 'description', e.target.value)}
                          placeholder="Select the service..."
                          className="w-full px-3 py-1.5 border rounded-lg focus:outline-none text-sm bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                        <label className="flex items-center cursor-pointer mt-1">
                          <input
                            type="checkbox"
                            checked={item.isActive}
                            onChange={(e) => updateItemField('how_it_works', idx, 'isActive', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#10AFA5]"></div>
                          <span className="ml-2 text-[11px] font-semibold text-gray-500">Active</span>
                        </label>
                        
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer border px-3 py-1 rounded bg-white hover:bg-gray-50">
                            <span className="text-[11px] text-gray-500">Upload Icon File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'how_it_works', 'iconUrl', idx)}
                              className="hidden"
                            />
                          </label>
                          {item.iconUrl && (
                            <span className="text-[10px] text-gray-400 block truncate mt-1">URL: {item.iconUrl}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        <div className="bg-slate-100 p-6 rounded-2xl border border-gray-200 sticky top-24 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <FiEye /> Realtime Interactive Preview
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  previewMode === 'desktop' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-3 py-1 text-xs font-semibold rounded ${
                  previewMode === 'mobile' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          {/* Actual Device Emulator Frame */}
          <div className={`mx-auto bg-white shadow-lg overflow-hidden border border-slate-200 transition-all ${
            previewMode === 'mobile' ? 'max-w-[360px] rounded-[36px] border-[8px] border-slate-800 aspect-[9/19]' : 'w-full rounded-2xl aspect-[16/10]'
          } overflow-y-auto`}>
            
            {/* App Header Simulator */}
            <div className="bg-[#F8FCFC] px-4 py-3 flex justify-between items-center border-b border-slate-50 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-2 w-12 bg-slate-200 rounded"></div>
                  <div className="h-3 w-20 bg-slate-200 rounded"></div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <FiSettings className="text-slate-400" />
              </div>
            </div>

            {/* Simulated Body Content */}
            <div className="p-4 space-y-8 bg-[#F8FCFC] min-h-full pb-20">
              <div className="space-y-2 opacity-30 pointer-events-none">
                <div className="h-6 w-32 bg-slate-300 rounded"></div>
                <div className="h-20 bg-slate-200 rounded-xl"></div>
              </div>

              {/* Rendering selected tab's live component preview */}
              {activeTab === 'care_plan' && (
                <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#ebfae6]/70 to-[#F8FCFC] border border-[#ebfae6] shadow-sm flex flex-col md:flex-row justify-between items-stretch overflow-hidden gap-6">
                  <div className="flex-1 space-y-4 z-10">
                    {/* Badge */}
                    {currentSection.badgeText && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#23b0a7]/10 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#23b0a7]"></div>
                        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{currentSection.badgeText}</span>
                      </div>
                    )}
                    
                    {/* Title */}
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
                      {currentSection.title}{' '}
                      <span className="text-[#23b0a7] font-extrabold">{currentSection.highlightedText}</span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{currentSection.subtitle}</p>

                    {/* Benefits List */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {currentSection.items?.filter(b => b.isActive).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-[#23b0a7]/10 flex items-center justify-center flex-shrink-0">
                            <FiCheckCircle className="text-[#23b0a7] text-[10px]" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 truncate">{item.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Button */}
                    <div className="pt-2">
                      <button className="flex items-center gap-2 px-5 py-2.5 bg-[#23b0a7] hover:bg-[#1f9b93] text-white font-extrabold rounded-xl text-xs shadow-md transition-all">
                        {currentSection.buttonText || 'Explore Care Plans'}
                        <FiArrowRight />
                      </button>
                    </div>
                  </div>

                  {/* Right side Illustration & Discount */}
                  <div className="relative flex justify-center items-center z-10 w-full md:w-40 h-40">
                    <img 
                      fetchPriority="low" 
                      loading="lazy" 
                      src={currentSection.imageUrl || '/rider-3D.png'} 
                      alt="Care Plan preview" 
                      className="h-full object-contain drop-shadow-md max-h-36" 
                      onError={(e) => { e.target.src = '/rider-3D.png'; }}
                    />
                    
                    {/* Discount Badge */}
                    {currentSection.discountText && (
                      <div className="absolute top-2 right-2 bg-gradient-to-tr from-[#10AFA5] to-[#2cd6cb] text-white p-2 rounded-2xl shadow-md border-2 border-white flex flex-col items-center justify-center text-center transform rotate-6 scale-90">
                        <span className="text-[9px] font-bold tracking-tight">UP TO</span>
                        <span className="text-[14px] font-black leading-none">20%</span>
                        <span className="text-[8px] font-bold">SAVINGS*</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'why_choose' && (
                <div className="space-y-4">
                  <div className="flex flex-col items-start">
                    <h2 className="text-[18px] font-bold text-slate-800 relative pb-1">
                      {currentSection.title || 'Why Choose WBI?'}
                    </h2>
                    <div className="h-0.5 w-12 bg-[#23b0a7] rounded mt-1"></div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {currentSection.items?.filter(item => item.isActive).map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-50 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#23b0a7]/10 flex items-center justify-center flex-shrink-0">
                          {item.iconUrl ? (
                            <img fetchPriority="low" loading="lazy" src={item.iconUrl} alt="icon" className="w-6 h-6 object-contain" />
                          ) : (
                            <PreviewIcon name={item.iconName || 'FiShield'} className="text-[#23b0a7] text-xl" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="font-extrabold text-[13px] text-slate-800 leading-tight">{item.title}</h3>
                          <p className="text-[11px] text-slate-500 leading-normal">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'how_it_works' && (
                <div className="space-y-5">
                  <div className="flex flex-col items-start">
                    <h2 className="text-[18px] font-bold text-slate-800 relative pb-1">
                      {currentSection.title || 'How It Works'}
                    </h2>
                    <div className="h-0.5 w-12 bg-[#23b0a7] rounded mt-1"></div>
                  </div>

                  <div className="relative">
                    {/* Dotted connecting line background */}
                    <div 
                      className="absolute top-[28px] left-[15%] right-[15%] h-[1px] z-0" 
                      style={{
                        backgroundImage: `linear-gradient(to right, #23b0a7 33%, transparent 0%)`,
                        backgroundPosition: 'bottom',
                        backgroundSize: '8px 1px',
                        backgroundRepeat: 'repeat-x',
                        opacity: 0.3
                      }}
                    />

                    <div className="flex overflow-x-auto gap-4 pb-2 z-10 relative scrollbar-hide">
                      {currentSection.items?.filter(item => item.isActive).map((item, idx) => (
                        <div key={idx} className="min-w-[110px] w-[110px] flex-shrink-0 flex flex-col items-center text-center">
                          <div className="w-14 h-14 rounded-full border border-[#23b0a7]/20 bg-white flex items-center justify-center relative shadow-sm">
                            {item.iconUrl ? (
                              <img fetchPriority="low" loading="lazy" src={item.iconUrl} alt="step icon" className="w-6 h-6 object-contain" />
                            ) : (
                              <PreviewIcon name={item.iconName || 'FiSearch'} className="text-[#23b0a7] text-lg" />
                            )}
                            <div className="absolute -bottom-2 bg-[#23b0a7] text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white shadow-sm">
                              {idx + 1}
                            </div>
                          </div>
                          
                          <span className="text-[9px] text-[#23b0a7] font-black uppercase tracking-wider mt-4">
                            Step {item.stepNumber || (idx + 1)}
                          </span>
                          <h3 className="font-extrabold text-[11px] text-slate-800 mt-1 leading-tight">{item.title}</h3>
                          <p className="text-[9px] text-slate-400 leading-snug mt-0.5">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 opacity-30 pointer-events-none">
                <div className="h-20 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeContentManagement;
