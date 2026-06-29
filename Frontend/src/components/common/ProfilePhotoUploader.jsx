import React, { useState, useRef } from 'react';
import { FiCamera, FiImage, FiX, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProfilePhotoUploader = ({ currentPhoto, onUploadSuccess, uploadFunction }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setPreviewPhoto(URL.createObjectURL(file));
    setShowOptions(false);

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await uploadFunction(formData);
      
      if (response.success) {
        toast.success('Profile photo updated successfully!');
        if (onUploadSuccess) {
          onUploadSuccess(response.user.profilePhoto || response.imageUrl);
        }
      } else {
        toast.error(response.message || 'Failed to upload photo');
        setPreviewPhoto(null);
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error(error?.response?.data?.message || 'Unable to upload photo. Please try again.');
      setPreviewPhoto(null);
    } finally {
      setIsUploading(false);
      // Reset input values to allow uploading the same file again if it failed
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const displayPhoto = previewPhoto || currentPhoto;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center cursor-pointer relative"
          onClick={() => !isUploading && setShowOptions(true)}
        >
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {displayPhoto ? (
            <img fetchPriority="high" src={displayPhoto} className="w-full h-full object-cover" alt="Profile" />
          ) : (
            <div className="bg-gray-100 w-full h-full flex items-center justify-center">
              <FiUser className="w-10 h-10 text-gray-300" />
            </div>
          )}
        </div>
        
        {/* Edit Badge */}
        <div
          className="absolute bottom-0 right-0 p-2 bg-gray-900 rounded-full text-white ring-2 ring-white shadow-sm cursor-pointer z-10"
          onClick={() => !isUploading && setShowOptions(true)}
        >
          <FiCamera className="w-4 h-4" />
        </div>
      </div>
      
      <p className="text-xs text-gray-400 mt-2 font-medium">Tap to change photo</p>

      {/* Hidden Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Bottom Sheet */}
      {showOptions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowOptions(false)} 
          />
          
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 relative z-10 animate-slideUp sm:animate-fadeIn shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Update Profile Photo</h3>
              <button 
                onClick={() => setShowOptions(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-semibold"
                onClick={() => cameraInputRef.current?.click()}
              >
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiCamera className="w-6 h-6 text-blue-700" />
                </div>
                Take Photo
              </button>
              
              <button
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors font-semibold border border-gray-100"
                onClick={() => galleryInputRef.current?.click()}
              >
                <div className="p-3 bg-white shadow-sm rounded-full border border-gray-100">
                  <FiImage className="w-6 h-6 text-gray-700" />
                </div>
                Choose from Gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUploader;
