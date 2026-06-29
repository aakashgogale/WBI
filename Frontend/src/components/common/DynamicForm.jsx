import React, { useState, useEffect } from 'react';
import { FiCheckCircle } from 'react-icons/fi';

import { toast } from 'react-hot-toast';

const DynamicForm = ({ config, initialData = {}, onSubmit, onCancel, submitLabel = 'Submit' }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  if (!config || !config.fields || config.fields.length === 0) {
    return <div className="text-gray-500 text-center py-4">No form configuration available.</div>;
  }

  const handleChange = (e, field) => {
    let value;
    const key = field.key || field.fieldKey;
    if (field.type === 'file') {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, [key]: reader.result });
        };
        reader.readAsDataURL(file);
      }
    } else {
      value = e.target.value;
      setFormData({ ...formData, [key]: value });
    }
  };

  const handleCheckboxChange = (e, field, optionValue) => {
    const key = field.key || field.fieldKey;
    const currentValues = formData[key] || [];
    let newValues;
    if (e.target.checked) {
      newValues = [...currentValues, optionValue];
    } else {
      newValues = currentValues.filter((v) => v !== optionValue);
    }
    setFormData({ ...formData, [key]: newValues });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Manual validation
    for (const field of config.fields) {
      if (field.visible === false) continue;
      
      if (field.required) {
        const key = field.key || field.fieldKey;
        const val = formData[key];
        
        if (field.type === 'multiselect') {
          if (!val || val.length === 0) {
            toast.error(`Please select at least one option for ${field.label}`);
            return;
          }
        } else {
          if (val === undefined || val === null || val.toString().trim() === '') {
            toast.error(`Please fill out ${field.label}`);
            return;
          }
        }
      }
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {config.stepTitle && (
        <h3 className="text-xl font-bold text-gray-800 mb-4">{config.stepTitle}</h3>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {config.fields.map((field) => {
          if (field.visible === false) return null;

          return (
            <div key={field.key || field.fieldKey || field._id} className={field.type === 'textarea' || field.type === 'multiselect' ? "col-span-full" : ""}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {/* Text / Email / Phone / Number */}
              {['text', 'email', 'phone', 'number'].includes(field.type) && (
                <input
                  type={field.type === 'phone' ? 'tel' : field.type}
                  value={formData[field.key || field.fieldKey] || ''}
                  onChange={(e) => handleChange(e, field)}
                  disabled={field.editable === false}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              )}

              {/* Textarea */}
              {field.type === 'textarea' && (
                <textarea
                  value={formData[field.key || field.fieldKey] || ''}
                  onChange={(e) => handleChange(e, field)}
                  disabled={field.editable === false}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-y"
                />
              )}

              {/* Dropdown */}
              {(field.type === 'dropdown' || field.type === 'select') && (
                <select
                  value={formData[field.key || field.fieldKey] || ''}
                  onChange={(e) => handleChange(e, field)}
                  disabled={field.editable === false}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Multiselect / Checkboxes */}
              {field.type === 'multiselect' && (
                <div className="flex flex-wrap gap-3">
                  {field.options?.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData[field.key || field.fieldKey] || []).includes(opt.value)}
                        onChange={(e) => handleCheckboxChange(e, field, opt.value)}
                        disabled={field.editable === false}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* File / Image */}
              {field.type === 'file' && (
                <div>
                  <input
                    type="file"
                    onChange={(e) => handleChange(e, field)}
                    disabled={field.editable === false}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                  />
                  {formData[field.key || field.fieldKey] && formData[field.key || field.fieldKey].startsWith('data:image') && (
                    <img fetchPriority="low" loading="lazy" src={formData[field.key || field.fieldKey]} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 pt-6 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm text-center"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex-[2] py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-sm"
        >
          {submitLabel} <FiCheckCircle className="text-lg" />
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
