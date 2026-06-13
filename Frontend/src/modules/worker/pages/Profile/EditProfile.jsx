import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSave, FiUser, FiPhone, FiMail,
  FiMapPin, FiBriefcase, FiCamera, FiCheck,
  FiChevronDown, FiX
} from 'react-icons/fi';
import Header from '../../components/layout/Header';
import workerService from '../../../../services/workerService';
import { publicCatalogService } from '../../../../services/catalogService';
import { toast } from 'react-hot-toast';
import AddressSelectionModal from '../../../user/pages/Checkout/components/AddressSelectionModal';
import { z } from "zod";

// Zod schema
import flutterBridge from '../../../../utils/flutterBridge';

const workerProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(), // Read-only but good to have in schema
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
});

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    profilePhoto: null,
    status: 'OFFLINE'
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleNativeCamera = async () => {
    const file = await flutterBridge.openCamera();
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      flutterBridge.hapticFeedback('success');
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [profileRes, catalogRes] = await Promise.all([
          workerService.getProfile(),
          publicCatalogService.getCategories()
        ]);

        if (profileRes.success) {
          const w = profileRes.worker;
          setFormData({
            name: w.name || '',
            phone: w.phone || '',
            email: w.email || '',
            profilePhoto: w.profilePhoto || null,
            status: w.status || 'OFFLINE'
          });
        }

      } catch (error) {
        console.error('Init error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

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
      body: formData,
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Upload failed');
    return data.imageUrl;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };



  const handleSubmit = async () => {
    // Zod Validation
    const validationResult = workerProfileSchema.safeParse({
      name: formData.name,
      phone: formData.phone,
      email: formData.email
    });

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        status: formData.status
      };

      if (photoFile) {
        try {
          const photoUrl = await uploadFile(photoFile);
          payload.profilePhoto = photoUrl;
        } catch (uploadErr) {
          console.error('Photo upload failed', uploadErr);
          toast.error('Failed to upload photo');
          setSaving(false);
          return;
        }
      }

      await workerService.updateProfile(payload);
      toast.success('Profile updated successfully');

      // Update local storage to keep session in sync if needed
      const currentWorker = JSON.parse(localStorage.getItem('workerData') || '{}');
      localStorage.setItem('workerData', JSON.stringify({
        ...currentWorker,
        ...payload,
        profilePhoto: payload.profilePhoto || currentWorker.profilePhoto
      }));

      navigate(`${window.location.pathname.startsWith('/engineer') ? '/engineer' : '/worker'}/profile`);
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Header title="Edit Profile" />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center cursor-pointer"
              onClick={() => flutterBridge.isFlutter ? handleNativeCamera() : document.getElementById('photo-upload').click()}
            >
              {photoPreview || formData.profilePhoto ? (
                <img src={photoPreview || formData.profilePhoto} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                  <FiUser className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
            {/* Camera Icon */}
            <div
              className="absolute bottom-0 right-0 p-2 bg-gray-900 rounded-full text-white ring-2 ring-white shadow-sm cursor-pointer"
              onClick={() => flutterBridge.isFlutter ? handleNativeCamera() : document.getElementById('photo-upload').click()}
            >
              <FiCamera className="w-4 h-4" />
            </div>
            {!flutterBridge.isFlutter && (
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">Tap to change photo</p>
        </div>

        {/* Availability Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FiCheck className="text-gray-900" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Availability</h2>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleInputChange('status', 'ONLINE')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${formData.status === 'ONLINE'
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-200 text-gray-500'
                }`}
            >
              Online
            </button>
            <button
              onClick={() => handleInputChange('status', 'OFFLINE')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${formData.status === 'OFFLINE'
                ? 'bg-red-50 border-red-500 text-red-700'
                : 'bg-white border-gray-200 text-gray-500'
                }`}
            >
              Offline
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Set your status to receive new job assignments.
          </p>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FiUser className="text-gray-900" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Personal Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block ml-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="Enter name"
              />
              {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block ml-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block ml-1">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.phone}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                  VERIFIED
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>

          <button
            onClick={() => navigate(`${window.location.pathname.startsWith('/engineer') ? '/engineer' : '/worker'}/profile`)}
            className="w-full py-3.5 bg-white text-gray-500 border border-gray-200 rounded-2xl font-bold text-sm uppercase tracking-wider active:scale-95 transition-all"
          >
            Cancel
          </button>
        </div>

      </main>





      
    </div >
  );
};

export default EditProfile;
