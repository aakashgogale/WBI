import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiStar, FiSearch,
  FiX, FiPlay, FiUpload, FiLink, FiSave, FiAlertCircle, FiCheck,
  FiChevronUp, FiChevronDown, FiVideo, FiImage
} from 'react-icons/fi';
import {
  getAllTrustVideos,
  createTrustVideo,
  updateTrustVideo,
  deleteTrustVideo,
  toggleTrustVideoStatus,
  uploadFile
} from '../../services/trustVideoService';

const TrustVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ thumbnail: false, video: false });
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const emptyForm = {
    title: '',
    description: '',
    serviceCategory: '',
    thumbnail: '',
    videoUrl: '',
    videoType: 'url',
    rating: 4.8,
    isActive: true,
    isFeatured: false,
    isMuted: false,
    displayOrder: 0
  };

  const [form, setForm] = useState(emptyForm);

  // Fetch videos
  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const params = { search, page: pagination.page, limit: 20 };
      if (filterStatus === 'active') params.isActive = true;
      if (filterStatus === 'inactive') params.isActive = false;

      const res = await getAllTrustVideos(params);
      if (res.success) {
        setVideos(res.videos || []);
        setPagination(p => ({
          ...p,
          total: res.pagination?.total || 0,
          totalPages: res.pagination?.totalPages || 1
        }));
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, pagination.page]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  // Handle file upload
  const handleFileUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow selecting the same file again if it failed
    e.target.value = null;

    if (type === 'video' && file.size > 50 * 1024 * 1024) {
      toast.error('Video size must be less than 50MB');
      return;
    }

    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      // Pass the type to the uploadService to determine if to use /upload or /upload-media
      const res = await uploadFile(file, type);
      if (res.success && res.imageUrl) {
        setForm(prev => ({
          ...prev,
          [type === 'thumbnail' ? 'thumbnail' : 'videoUrl']: res.imageUrl,
          ...(type === 'video' ? { videoType: 'upload' } : {})
        }));
        toast.success(`${type === 'thumbnail' ? 'Thumbnail' : 'Video'} uploaded successfully!`);
      } else {
        toast.error(res.message || 'Failed to upload file');
      }
    } catch (err) {
      console.error(`Upload failed for ${type}:`, err);
      toast.error(err.response?.data?.message || err.message || `Upload failed for ${type}`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Open modal for create
  const handleCreate = () => {
    setEditingVideo(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleEdit = (video) => {
    setEditingVideo(video);
    setForm({
      title: video.title || '',
      description: video.description || '',
      serviceCategory: video.serviceCategory || '',
      thumbnail: video.thumbnail || '',
      videoUrl: video.videoUrl || '',
      videoType: video.videoType || 'url',
      rating: video.rating || 4.8,
      isActive: video.isActive !== undefined ? video.isActive : true,
      isFeatured: video.isFeatured || false,
      isMuted: video.isMuted || false,
      displayOrder: video.displayOrder || 0
    });
    setIsModalOpen(true);
  };

  // Save video
  const handleSave = async () => {
    if (!form.title || !form.serviceCategory || !form.thumbnail || !form.videoUrl) {
      alert('Please fill all required fields: Title, Service Category, Thumbnail, and Video URL');
      return;
    }

    try {
      setSaving(true);
      if (editingVideo) {
        const res = await updateTrustVideo(editingVideo._id, form);
        if (res.success) {
          setIsModalOpen(false);
          fetchVideos();
        }
      } else {
        const res = await createTrustVideo(form);
        if (res.success) {
          setIsModalOpen(false);
          fetchVideos();
        }
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete video
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trust video?')) return;
    try {
      setIsDeleting(id);
      const res = await deleteTrustVideo(id);
      if (res.success) fetchVideos();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  // Toggle status
  const handleToggleStatus = async (video) => {
    try {
      await toggleTrustVideoStatus(video._id, !video.isActive);
      fetchVideos();
    } catch (err) {
      console.error('Status toggle failed:', err);
    }
  };

  // Preview video
  const handlePreview = (video) => {
    setPreviewVideo(video);
    setIsPreviewOpen(true);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiVideo className="text-primary-600" />
            Trust Videos
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage experience & trust video section for users</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all shadow-sm"
        >
          <FiPlus size={18} /> Add Video
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                filterStatus === status
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiVideo className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No trust videos found</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first trust video to build customer confidence</p>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all"
          >
            <FiPlus size={16} /> Add First Video
          </button>
        </div>
      ) : (
        /* Video Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {videos.map((video) => (
            <motion.div
              key={video._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all hover:shadow-md ${
                !video.isActive ? 'border-red-200 opacity-75' : 'border-gray-100'
              }`}
            >
              {/* Thumbnail with play overlay */}
              <div className="relative aspect-video bg-gray-100 group cursor-pointer" onClick={() => handlePreview(video)}>
                {video.thumbnail ? (
                  <img fetchPriority="low" loading="lazy" src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiImage size={40} />
                  </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <FiPlay className="text-gray-900 text-xl ml-1" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {video.isFeatured && (
                    <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FiStar size={10} /> Featured
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${video.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {video.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Order badge */}
                <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  #{video.displayOrder}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">{video.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 mb-2">{video.description || 'No description'}</p>

                <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium">{video.serviceCategory}</span>
                  <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                    <FiStar size={12} /> {video.rating}
                  </span>
                  <span className="text-[10px] text-gray-400 capitalize">{video.videoType}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(video)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition-all"
                  >
                    <FiEdit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(video)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      video.isActive
                        ? 'bg-orange-50 hover:bg-orange-100 text-orange-700'
                        : 'bg-green-50 hover:bg-green-100 text-green-700'
                    }`}
                  >
                    {video.isActive ? <><FiEyeOff size={13} /> Hide</> : <><FiEye size={13} /> Show</>}
                  </button>
                  <button
                    onClick={() => handleDelete(video._id)}
                    disabled={isDeleting === video._id}
                    className="flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all disabled:opacity-50"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setPagination(p => ({ ...p, page }))}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                pagination.page === page
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingVideo ? 'Edit Trust Video' : 'Add New Trust Video'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., AC Repair Done in 45 Minutes"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the video..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                {/* Service Category + Rating */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Category *</label>
                    <input
                      type="text"
                      value={form.serviceCategory}
                      onChange={(e) => setForm(prev => ({ ...prev, serviceCategory: e.target.value }))}
                      placeholder="e.g., AC Repair"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Rating</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) => setForm(prev => ({ ...prev, rating: parseFloat(e.target.value) || 4.8 }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Thumbnail *</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={form.thumbnail}
                      onChange={(e) => setForm(prev => ({ ...prev, thumbnail: e.target.value }))}
                      placeholder="Paste thumbnail URL or upload"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium cursor-pointer transition-all">
                      {uploading.thumbnail ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <FiUpload size={16} />
                      )}
                      Upload
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail')} className="hidden" />
                    </label>
                  </div>
                  {form.thumbnail && (
                    <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <img fetchPriority="low" loading="lazy" src={form.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Video *</label>
                  <div className="flex gap-2 mb-2">
                    {['url', 'youtube', 'upload'].map(type => (
                      <button
                        key={type}
                        onClick={() => setForm(prev => ({ ...prev, videoType: type }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                          form.videoType === type
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'url' ? <><FiLink size={12} className="inline mr-1" />URL</> :
                         type === 'youtube' ? <><FiPlay size={12} className="inline mr-1" />YouTube</> :
                         <><FiUpload size={12} className="inline mr-1" />Upload</>}
                      </button>
                    ))}
                  </div>

                  {form.videoType !== 'upload' ? (
                     <div className="flex gap-3">
                       <input
                         type="text"
                         value={form.videoUrl}
                         onChange={(e) => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                         placeholder={form.videoType === 'youtube' ? 'Paste YouTube URL...' : 'Paste video URL...'}
                         className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                       />
                     </div>
                  ) : (
                     <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {form.videoUrl ? (
                           <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl gap-2">
                             <div className="flex items-center gap-2 text-green-700 text-sm font-medium truncate">
                               <FiCheck size={16} className="flex-shrink-0" /> <span className="truncate">Video Ready ({new URL(form.videoUrl).pathname.split('/').pop()})</span>
                             </div>
                             <a href={form.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline flex-shrink-0">View File</a>
                           </div>
                        ) : (
                           <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 border-dashed rounded-xl text-sm text-gray-500 flex items-center justify-center">
                             No video file selected
                           </div>
                        )}
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-sm font-semibold cursor-pointer transition-all border border-primary-100 flex-shrink-0">
                           {uploading.video ? (
                             <><span className="animate-spin text-sm">⏳</span> Uploading...</>
                           ) : (
                             <><FiUpload size={16} /> {form.videoUrl ? 'Replace Video' : 'Select Video'}</>
                           )}
                           <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="hidden" />
                        </label>
                     </div>
                  )}
                </div>

                {/* Display Order + Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
                    <input
                      type="number"
                      min="0"
                      value={form.displayOrder}
                      onChange={(e) => setForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer py-2.5">
                      <div 
                        onClick={() => setForm(prev => ({ ...prev, isMuted: !prev.isMuted }))}
                        className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${form.isMuted ? 'bg-indigo-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isMuted ? 'left-[22px]' : 'left-0.5'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Muted</span>
                    </label>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer py-2.5">
                      <div 
                        onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                        className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isActive ? 'left-[22px]' : 'left-0.5'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer py-2.5">
                      <div 
                        onClick={() => setForm(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                        className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${form.isFeatured ? 'bg-yellow-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isFeatured ? 'left-[22px]' : 'left-0.5'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex items-center justify-between">
                {/* Preview button */}
                {form.videoUrl && (
                  <button
                    onClick={() => handlePreview({ ...form, _id: 'preview' })}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all"
                  >
                    <FiPlay size={14} /> Preview
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
                  >
                    {saving ? (
                      <><span className="animate-spin">⏳</span> Saving...</>
                    ) : (
                      <><FiSave size={16} /> {editingVideo ? 'Update' : 'Create'}</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && previewVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900">{previewVideo.title}</h3>
                  <p className="text-xs text-gray-500">{previewVideo.serviceCategory}</p>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="aspect-video bg-black">
                {previewVideo.videoType === 'youtube' ? (
                  <iframe
                    src={previewVideo.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                    title={previewVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={previewVideo.videoUrl}
                    controls
                    autoPlay
                    muted={previewVideo.isMuted}
                    className="w-full h-full object-contain"
                    poster={previewVideo.thumbnail}
                  />
                )}
              </div>
              <div className="px-6 py-4 flex items-center gap-3">
                <span className="flex items-center gap-1 text-yellow-600 font-semibold text-sm">
                  <FiStar size={14} /> {previewVideo.rating}
                </span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FiCheck size={10} /> Verified Expert
                </span>
                {previewVideo.description && (
                  <span className="text-sm text-gray-500 flex-1 text-right">{previewVideo.description}</span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrustVideos;
