import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiUploadCloud, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';
import flutterBridge from '../../../../utils/flutterBridge';

const Documents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    aadhaarFront: null,
    aadhaarBack: null
  });

  const [previews, setPreviews] = useState({
    front: null,
    back: null
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await workerService.getProfile();
        if (res.success && res.worker) {
          const w = res.worker;
          setFormData({
            aadhaarNumber: w.documents?.aadhaar || '',
            aadhaarFront: null,
            aadhaarBack: null
          });
          setPreviews({
            front: w.documents?.aadhaarFrontUrl || null,
            back: w.documents?.aadhaarBackUrl || null
          });
        }
      } catch (err) {
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadFile = async (file) => {
    const data = new FormData();
    data.append('file', file);

    let baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    if (!baseUrl) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        baseUrl = 'http://localhost:5000';
      } else {
        baseUrl = window.location.origin;
      }
    }
    baseUrl = baseUrl.replace(/\/api$/, '');
    
    const response = await fetch(`${baseUrl}/api/image/upload`, {
      method: 'POST',
      body: data,
    });

    const resJson = await response.json();
    if (!resJson.success) throw new Error(resJson.message || 'Upload failed');
    return resJson.imageUrl;
  };

  const handleFileChange = async (side, e) => {
    let file = null;
    if (e && e.target && e.target.files) {
      file = e.target.files[0];
    } else {
      // Mobile native camera
      file = await flutterBridge.openCamera();
    }
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, [side === 'front' ? 'aadhaarFront' : 'aadhaarBack']: file }));
      setPreviews(prev => ({ ...prev, [side]: URL.createObjectURL(file) }));
    }
  };

  const handleSave = async () => {
    if (!formData.aadhaarNumber || formData.aadhaarNumber.length < 12) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    
    setSaving(true);
    try {
      let frontUrl = previews.front;
      let backUrl = previews.back;

      if (formData.aadhaarFront) {
        frontUrl = await uploadFile(formData.aadhaarFront);
      }
      if (formData.aadhaarBack) {
        backUrl = await uploadFile(formData.aadhaarBack);
      }

      await workerService.updateProfile({
        documents: {
          aadhaar: formData.aadhaarNumber,
          aadhaarFrontUrl: frontUrl,
          aadhaarBackUrl: backUrl
        }
      });
      toast.success('Documents updated successfully');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update documents');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FCFC] font-sans text-[#0F172A] ">
      <Header title="Documents" showBack={true} onBack={() => navigate(-1)} />
      
      <main className="px-5 pt-6 max-w-md mx-auto space-y-6">
        
        {/* Banner */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex items-start gap-3">
          <FiCheckCircle className="w-5 h-5 text-gray-700 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700 font-medium leading-relaxed">
            We only require your Aadhaar Card to verify your identity for one-time services. Your data is fully secure.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50">
          <div className="space-y-5">
            
            {/* Aadhaar Number */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
                <FiFileText className="text-slate-400 text-sm" /> Aadhaar Number
              </label>
              <input
                type="text"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                maxLength={12}
                className="w-full bg-[#F8F9FA] rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-800 placeholder-gray-500 tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-900/20 transition-all text-center border-none"
                placeholder="0000 0000 0000"
              />
            </div>

            {/* Aadhaar Front */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Aadhaar Front Image
              </label>
              <div 
                className="w-full h-32 bg-[#F8F9FA] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors relative overflow-hidden"
                onClick={() => flutterBridge.isFlutter ? handleFileChange('front') : document.getElementById('aadhaar-front').click()}
              >
                {previews.front ? (
                  <img src={previews.front} alt="Aadhaar Front" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <FiUploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs font-medium text-slate-500">Tap to upload Front Side</span>
                  </>
                )}
                {!flutterBridge.isFlutter && (
                  <input type="file" id="aadhaar-front" className="hidden" accept="image/*" onChange={(e) => handleFileChange('front', e)} />
                )}
              </div>
            </div>

            {/* Aadhaar Back */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Aadhaar Back Image
              </label>
              <div 
                className="w-full h-32 bg-[#F8F9FA] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors relative overflow-hidden"
                onClick={() => flutterBridge.isFlutter ? handleFileChange('back') : document.getElementById('aadhaar-back').click()}
              >
                {previews.back ? (
                  <img src={previews.back} alt="Aadhaar Back" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <FiUploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs font-medium text-slate-500">Tap to upload Back Side</span>
                  </>
                )}
                {!flutterBridge.isFlutter && (
                  <input type="file" id="aadhaar-back" className="hidden" accept="image/*" onChange={(e) => handleFileChange('back', e)} />
                )}
              </div>
            </div>

          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.15)] disabled:opacity-70 disabled:active:scale-100"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <FiSave className="w-5 h-5" /> Submit Documents
            </>
          )}
        </button>

      </main>
    </div>
  );
};

export default Documents;
