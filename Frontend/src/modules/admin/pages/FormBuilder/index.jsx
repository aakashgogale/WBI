import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiList, FiLayout } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api'; // Using base api instance for authenticated admin requests
import CardShell from '../UserCategories/components/CardShell';
import Modal from '../UserCategories/components/Modal';

const FormBuilder = () => {
  const [activeTab, setActiveTab] = useState('fields'); // 'fields' or 'configs'
  
  // Fields State
  const [fields, setFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(true);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  
  // Configs State
  const [configs, setConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);

  // Load Data
  useEffect(() => {
    if (activeTab === 'fields') fetchFields();
    if (activeTab === 'configs') fetchConfigs();
  }, [activeTab]);

  const fetchFields = async () => {
    try {
      setLoadingFields(true);
      const { data } = await api.get('/admin/profile-fields');
      setFields(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch fields');
    } finally {
      setLoadingFields(false);
    }
  };

  const fetchConfigs = async () => {
    try {
      setLoadingConfigs(true);
      const { data } = await api.get('/admin/form-configs');
      setConfigs(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch form configs');
    } finally {
      setLoadingConfigs(false);
    }
  };

  // Save Field
  const handleSaveField = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fieldData = Object.fromEntries(formData.entries());
    fieldData.required = formData.get('required') === 'on';
    fieldData.visible = formData.get('visible') === 'on';
    fieldData.editable = formData.get('editable') === 'on';

    // Parse options if dropdown or multiselect
    if (['dropdown', 'multiselect', 'radio'].includes(fieldData.type) && fieldData.optionsStr) {
      fieldData.options = fieldData.optionsStr.split(',').map(o => ({ label: o.trim(), value: o.trim() }));
    }

    try {
      if (currentField?._id) {
        await api.put(`/admin/profile-fields/${currentField._id}`, fieldData);
        toast.success('Field updated successfully');
      } else {
        await api.post('/admin/profile-fields', fieldData);
        toast.success('Field created successfully');
      }
      setIsFieldModalOpen(false);
      fetchFields();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save field');
    }
  };

  const handleDeleteField = async (id) => {
    if (!window.confirm('Delete this field?')) return;
    try {
      await api.delete(`/admin/profile-fields/${id}`);
      toast.success('Field deleted');
      fetchFields();
    } catch (error) {
      toast.error('Failed to delete field');
    }
  };

  // Save Config
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const configData = Object.fromEntries(formData.entries());
    configData.isActive = formData.get('isActive') === 'on';
    
    // Parse selected fields
    const selectedFields = Array.from(e.target.querySelectorAll('input[name="fields"]:checked')).map(el => el.value);
    configData.fields = selectedFields;

    try {
      if (currentConfig?._id) {
        await api.put(`/admin/form-configs/${currentConfig._id}`, configData);
        toast.success('Form config updated');
      } else {
        await api.post('/admin/form-configs', configData);
        toast.success('Form config created');
      }
      setIsConfigModalOpen(false);
      fetchConfigs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save form config');
    }
  };

  const handleDeleteConfig = async (id) => {
    if (!window.confirm('Delete this config?')) return;
    try {
      await api.delete(`/admin/form-configs/${id}`);
      toast.success('Form config deleted');
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to delete form config');
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex gap-4 border-b border-gray-200">
        <button
          className={`pb-2 px-4 font-bold text-sm flex items-center gap-2 ${activeTab === 'fields' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('fields')}
        >
          <FiList /> Profile Fields
        </button>
        <button
          className={`pb-2 px-4 font-bold text-sm flex items-center gap-2 ${activeTab === 'configs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('configs')}
        >
          <FiLayout /> Form Configurations
        </button>
      </div>

      {activeTab === 'fields' && (
        <CardShell title="Dynamic Profile Fields" subtitle="Manage fields that will appear in user profiles">
          <div className="flex justify-end mb-4">
            <button onClick={() => { setCurrentField(null); setIsFieldModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 font-semibold">
              <FiPlus /> Add Field
            </button>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Key / Label</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Required</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingFields ? <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr> : fields.map(f => (
                  <tr key={f._id} className="border-b border-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{f.label}</div>
                      <div className="text-xs text-gray-500">{f.key}</div>
                    </td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{f.type}</span></td>
                    <td className="px-4 py-3">{f.required ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => { setCurrentField(f); setIsFieldModalOpen(true); }} className="text-blue-500"><FiEdit2 /></button>
                      <button onClick={() => handleDeleteField(f._id)} className="text-red-500"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardShell>
      )}

      {activeTab === 'configs' && (
        <CardShell title="Form Configurations" subtitle="Build forms by assembling fields">
          <div className="flex justify-end mb-4">
            <button onClick={() => { setCurrentConfig(null); setIsConfigModalOpen(true); fetchFields(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 font-semibold">
              <FiPlus /> Create Form Step
            </button>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Role / Type</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Step Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Fields count</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingConfigs ? <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr> : configs.map(c => (
                  <tr key={c._id} className="border-b border-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900 capitalize">{c.role}</div>
                      <div className="text-xs text-gray-500 capitalize">{c.formType}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{c.stepTitle}</div>
                      <div className="text-xs text-gray-500">{c.stepName}</div>
                    </td>
                    <td className="px-4 py-3">{c.fields?.length || 0}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => { setCurrentConfig(c); setIsConfigModalOpen(true); fetchFields(); }} className="text-blue-500"><FiEdit2 /></button>
                      <button onClick={() => handleDeleteConfig(c._id)} className="text-red-500"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardShell>
      )}

      {/* Modals can be added here containing forms to edit Fields / Configs */}
      <Modal isOpen={isFieldModalOpen} onClose={() => setIsFieldModalOpen(false)} title={currentField ? "Edit Field" : "Add Field"}>
        <form onSubmit={handleSaveField} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Key (unique ID)</label>
              <input name="key" defaultValue={currentField?.key || ''} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="text-sm font-semibold">Label (Display Name)</label>
              <input name="label" defaultValue={currentField?.label || ''} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="text-sm font-semibold">Type</label>
              <select name="type" defaultValue={currentField?.type || 'text'} className="w-full border p-2 rounded" required>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="dropdown">Dropdown</option>
                <option value="file">File/Image</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Options (comma separated if dropdown)</label>
              <input name="optionsStr" defaultValue={currentField?.options?.map(o => o.value).join(', ') || ''} className="w-full border p-2 rounded" />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" name="required" defaultChecked={currentField?.required} /> Required</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="visible" defaultChecked={currentField?.visible ?? true} /> Visible</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="editable" defaultChecked={currentField?.editable ?? true} /> Editable</label>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">Save Field</button>
        </form>
      </Modal>

      <Modal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} title={currentConfig ? "Edit Form Step" : "Create Form Step"}>
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Role</label>
              <select name="role" defaultValue={currentConfig?.role || 'worker'} className="w-full border p-2 rounded" required>
                <option value="worker">Worker</option>
                <option value="engineer">Engineer</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Form Type</label>
              <select name="formType" defaultValue={currentConfig?.formType || 'registration'} className="w-full border p-2 rounded" required>
                <option value="registration">Registration</option>
                <option value="profile">Profile Update</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Step ID (e.g. step-1)</label>
              <input name="stepName" defaultValue={currentConfig?.stepName || ''} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="text-sm font-semibold">Step Title</label>
              <input name="stepTitle" defaultValue={currentConfig?.stepTitle || ''} className="w-full border p-2 rounded" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Select Fields</label>
            <div className="max-h-40 overflow-y-auto border rounded p-2 grid grid-cols-2 gap-2 bg-gray-50">
              {fields.map(f => (
                <label key={f._id} className="flex items-center gap-2 text-sm bg-white p-2 border rounded">
                  <input type="checkbox" name="fields" value={f._id} defaultChecked={currentConfig?.fields?.some(cf => cf._id === f._id || cf === f._id)} />
                  {f.label} ({f.type})
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">Save Form Config</button>
        </form>
      </Modal>

    </div>
  );
};

export default FormBuilder;
