import React, { useState, useEffect, useLayoutEffect, lazy, Suspense, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMapPin, FiPhone, FiClock, FiUser, FiArrowLeft, FiImage, FiVideo, FiPlus, FiCheckCircle, FiFileText, FiDownload, FiInfo, FiMessageSquare, FiPaperclip, FiSend, FiX, FiWifi, FiWifiOff } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { workerTheme as themeColors } from '../../../../theme';
import { SkeletonCard } from '../../../../components/common/SkeletonLoaders';

const VisitVerificationModal = lazy(() => import('../../components/common/VisitVerificationModal'));
import workerService from '../../../../services/workerService';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';
import { useAppNotifications } from '../../../../hooks/useAppNotifications';
import { useLocationTracking } from '../../../../hooks/useLocationTracking';
import styles from './JobDetails.module.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);

  // Real-time Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const chatEndRef = useRef(null);

  const quickReplies = [
    "Please share location details",
    "I have reached the location",
    "Starting the service now",
    "Okay, noted"
  ];

  // Work Progress State
  const [progressNotes, setProgressNotes] = useState('');
  const [mediaFiles, setMediaFiles] = useState({ photos: [], videos: [] });
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Materials State
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: 1, cost: '' });
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const bgStyle = '#F8FCFC';

    if (html) html.style.background = bgStyle;
    if (body) body.style.background = bgStyle;
    if (root) root.style.background = bgStyle;

    return () => {
      if (html) html.style.background = '';
      if (body) body.style.background = '';
      if (root) root.style.background = '';
    };
  }, []);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const [jobRes, timelineRes] = await Promise.all([
        workerService.getJobById(id),
        workerService.getJobTimeline(id)
      ]);
      
      if (jobRes.success) {
        setJob(jobRes.data);
        setMaterials(jobRes.data.materials || []);
      }
      if (timelineRes.success) {
        setTimeline(timelineRes.data);
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load job details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const socket = useAppNotifications('worker');
  const isTrackingActive = job?.status === 'journey_started' || job?.status === 'visited' || job?.status === 'in_progress';
  useLocationTracking(socket, id, isTrackingActive, {
    distanceFilter: 10,
    interval: 3000,
    enableHighAccuracy: true
  });

  useEffect(() => {
    if (socket && id) {
      const handleJobUpdate = (data) => {
        if (data.bookingId === id || data.relatedId === id || data._id === id) {
          fetchJobDetails();
        }
      };
      socket.on('booking_updated', handleJobUpdate);
      return () => socket.off('booking_updated', handleJobUpdate);
    }
  }, [socket, id]);

  // Monitor socket connection status
  useEffect(() => {
    if (!socket) return;
    setIsSocketConnected(socket.connected);

    const handleConnect = () => setIsSocketConnected(true);
    const handleDisconnect = () => setIsSocketConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  // Socket chat message room and live updates setup
  useEffect(() => {
    if (socket && id) {
      socket.emit('join_tracking', id);

      const handleMessageReceived = (message) => {
        if (message.bookingId === id) {
          setChatMessages((prev) => [...prev, message]);
          if (!isChatOpen) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      };

      const handleTyping = (data) => {
        if (data.bookingId === id && data.senderRole === 'USER') {
          setIsTyping(true);
        }
      };

      const handleStopTyping = (data) => {
        if (data.bookingId === id && data.senderRole === 'USER') {
          setIsTyping(false);
        }
      };

      socket.on('chat:message_received', handleMessageReceived);
      socket.on('chat:typing', handleTyping);
      socket.on('chat:stop_typing', handleStopTyping);

      return () => {
        socket.off('chat:message_received', handleMessageReceived);
        socket.off('chat:typing', handleTyping);
        socket.off('chat:stop_typing', handleStopTyping);
      };
    }
  }, [socket, id, isChatOpen]);

  // Fetch chat history
  useEffect(() => {
    if (isChatOpen) {
      fetchChatHistory();
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping, isChatOpen]);

  const fetchChatHistory = async () => {
    try {
      const res = await api.get(`/chats/${id}`);
      if (res.data.success) {
        setChatMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  };

  const handleTypingIndicator = (isUserTyping) => {
    if (socket && id) {
      if (isUserTyping) {
        socket.emit('chat:typing', { bookingId: id, senderRole: 'WORKER' });
      } else {
        socket.emit('chat:stop_typing', { bookingId: id, senderRole: 'WORKER' });
      }
    }
  };

  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' : 'document';
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        fileUrl: reader.result,
        fileType,
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && !attachment) return;

    const payload = {
      bookingId: id,
      text: newMessage,
      fileUrl: attachment ? attachment.fileUrl : null,
      fileType: attachment ? attachment.fileType : 'none',
      fileName: attachment ? attachment.fileName : null,
    };

    if (socket && socket.connected) {
      socket.emit('chat:send_message', payload);
    } else {
      api.post('/chats', payload);
    }

    setNewMessage('');
    setAttachment(null);
    handleTypingIndicator(false);
  };

  const handleQuickReplyClick = (replyText) => {
    const payload = {
      bookingId: id,
      text: replyText,
      fileUrl: null,
      fileType: 'none',
      fileName: null,
    };

    if (socket && socket.connected) {
      socket.emit('chat:send_message', payload);
    } else {
      api.post('/chats', payload);
    }
  };

  const getStatusConfig = (status, workerResponse) => {
    if (!workerResponse || workerResponse === 'PENDING') return { label: 'Assigned', color: 'bg-blue-100 text-blue-700' };
    
    switch (status) {
      case 'assigned':
      case 'confirmed':
      case 'worker_assigned':
        return { label: 'Accepted', color: 'bg-green-100 text-green-700' };
      case 'journey_started':
        return { label: 'On The Way', color: 'bg-blue-100 text-blue-700' };
      case 'visited':
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-orange-100 text-orange-700' };
      case 'work_done':
        return { label: 'Work Done', color: 'bg-teal-100 text-teal-700' };
      case 'completed':
        return { label: 'Completed', color: 'bg-teal-100 text-teal-700' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-700' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const handleAction = async (actionType) => {
    setActionLoading(true);
    try {
      if (actionType === 'ACCEPT') {
        if (job.vendorId === null && !job.workerId) {
          await workerService.acceptBroadcastJob(id);
        } else {
          await workerService.respondToJob(id, 'ACCEPTED');
        }
        toast.success('Job Accepted');
        fetchJobDetails();
      } else if (actionType === 'REJECT') {
        if (job.vendorId === null && !job.workerId) {
          toast.success('Job Rejected');
          navigate('/worker/jobs');
          return;
        }
        await workerService.respondToJob(id, 'REJECTED');
        toast.success('Job Rejected');
        navigate('/worker/jobs');
      } else if (actionType === 'MARK_ARRIVED') {
        await workerService.startJob(id);
        toast.success('Journey Started! Please verify OTP with customer upon arrival.');
        fetchJobDetails();
      } else if (actionType === 'START_WORK') {
        if (job.status === 'journey_started') {
           setIsVisitModalOpen(true);
        } else {
           await workerService.updateJobStatus(id, 'in_progress');
           toast.success('Work Started!');
           fetchJobDetails();
        }
      } else if (actionType === 'COMPLETE_WORK') {
        await workerService.completeJob(id, { workPhotos: mediaFiles.photos });
        toast.success('Work Completed!');
        fetchJobDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMediaUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setIsUploadingMedia(true);
    // Dummy base64 upload for demo purposes
    const filePromises = files.map(f => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(f);
    }));
    
    const base64Files = await Promise.all(filePromises);
    
    try {
      const payload = type === 'photo' ? { workPhotos: base64Files } : { progressVideos: base64Files };
      await workerService.uploadJobMedia(id, payload);
      setMediaFiles(prev => ({
        ...prev,
        [type === 'photo' ? 'photos' : 'videos']: [...prev[type === 'photo' ? 'photos' : 'videos'], ...base64Files]
      }));
      toast.success('Media uploaded!');
      fetchJobDetails();
    } catch (e) {
      toast.error('Upload failed');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleAddNotes = async () => {
    if (!progressNotes) return;
    try {
      await workerService.addJobNotes(id, progressNotes);
      toast.success('Notes added');
      setProgressNotes('');
      fetchJobDetails();
    } catch (e) {
      toast.error('Failed to add notes');
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.cost) return;
    try {
      setIsAddingMaterial(true);
      await workerService.addJobMaterials(id, [newMaterial]);
      toast.success('Material requested');
      setNewMaterial({ name: '', quantity: 1, cost: '' });
      fetchJobDetails();
    } catch (e) {
      toast.error('Failed to add material');
    } finally {
      setIsAddingMaterial(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FCFC]">
        <div className="h-16 bg-white shadow-sm" />
        <main className="px-4 py-6 space-y-4 max-w-lg mx-auto">
          <SkeletonCard className="h-32 mb-6" />
          <SkeletonCard className="h-48 mb-6" />
          <SkeletonCard className="h-40" />
        </main>
      </div>
    );
  }

  if (!job) return <div className="text-center mt-20 font-bold text-gray-500">Job Not Found</div>;

  const statusConfig = getStatusConfig(job.status, job.workerResponse);

  return (
    <div className="min-h-screen bg-[#F8FCFC]  text-[#0F172A] font-sans">
      {/* Header */}
      <header className="bg-white px-4 py-3 sticky top-0 z-50 shadow-sm flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700 active:scale-95 transition-transform">
          <FiArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Active Job</h1>
        <div className="flex items-center gap-3">
          {job.userId?.phone && (
            <a href={`https://wa.me/${job.userId.phone}`} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-green-50 text-green-600 active:scale-95">
              <FaWhatsapp className="w-5 h-5" />
            </a>
          )}
          {job.userId?.phone && (
            <a href={`tel:${job.userId.phone}`} className="p-2 rounded-full bg-[#10AFA5]/10 text-[#10AFA5] active:scale-95">
              <FiPhone className="w-5 h-5" />
            </a>
          )}
          {job.userId?.phone && (
            <button onClick={() => setIsChatOpen(true)} className="p-2 rounded-full bg-[#10AFA5]/10 text-[#10AFA5] active:scale-95 relative flex items-center justify-center">
              <FiMessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Top Job Summary Card */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 mb-5">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-bold text-lg">{job.serviceName || 'Service'}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-4">Booking ID: <span className="text-gray-800">#{job.bookingNumber}</span></p>
          <div className="flex justify-end border-t border-gray-100 pt-3 mt-1">
            <span className="text-2xl font-black text-[#0F172A]">₹{job.finalAmount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Customer Details Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3 px-1">Customer Details</h3>
          <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <FiUser className="text-[#10AFA5] w-5 h-5" /> {job.userId?.name || 'Customer Name'}
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <FiPhone className="text-[#10AFA5] w-5 h-5" /> {job.userId?.phone || 'No Contact'}
            </div>
            <div className="flex items-start gap-3 text-sm font-medium text-gray-700">
              <FiMapPin className="text-[#10AFA5] w-5 h-5 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p>{job.address?.addressLine1}</p>
                <p className="text-gray-500">{job.address?.city}, {job.address?.state} - {job.address?.pincode}</p>
              </div>
              <button 
                onClick={() => navigate(`/worker/job/${id}/map`)}
                className="p-2 rounded-full bg-[#10AFA5]/10 text-[#10AFA5] shrink-0 active:scale-90"
              >
                <FiMapPin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Job Details Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3 px-1">Job Details</h3>
          <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service Type</span>
                <span className="font-semibold text-right">{job.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Preferred Time</span>
                <span className="font-semibold text-right">{new Date(job.scheduledDate).toLocaleDateString()}, {job.scheduledTime}</span>
              </div>
              {job.brandName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Brand</span>
                  <span className="font-semibold text-right">{job.brandName}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-gray-500 block mb-1">Description</span>
                <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {job.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Progress Section (Visible when In Progress) */}
        {(job.status === 'visited' || job.status === 'in_progress') && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3 px-1">Work Progress</h3>
            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500 cursor-pointer hover:bg-gray-100 active:scale-95 transition-all">
                  <FiImage className="w-6 h-6 mb-2 text-[#10AFA5]" />
                  <span className="text-xs font-bold">Upload Photos</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'photo')} disabled={isUploadingMedia} />
                </label>
                <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500 cursor-pointer hover:bg-gray-100 active:scale-95 transition-all">
                  <FiVideo className="w-6 h-6 mb-2 text-[#10AFA5]" />
                  <span className="text-xs font-bold">Upload Videos</span>
                  <input type="file" multiple accept="video/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'video')} disabled={isUploadingMedia} />
                </label>
              </div>

              {(job.workPhotos?.length > 0 || job.progressVideos?.length > 0) && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                  {job.workPhotos?.map((p, i) => (
                     <img fetchPriority="low" loading="lazy" key={i} src={p} alt="progress" className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0" />
                  ))}
                  {job.progressVideos?.map((v, i) => (
                     <div key={`vid-${i}`} className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                       <FiVideo className="text-white w-6 h-6" />
                     </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {job.workerNotes && (
                   <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">{job.workerNotes}</p>
                )}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    placeholder="Add progress notes..." 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#10AFA5] transition-colors"
                  />
                  <button 
                    onClick={handleAddNotes}
                    className="bg-[#10AFA5] text-white px-4 rounded-xl active:scale-95 transition-transform"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Material Section (Visible when In Progress) */}
        {(job.status === 'visited' || job.status === 'in_progress') && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 delay-75">
            <h3 className="text-sm font-bold text-gray-800 mb-3 px-1">Material Requested</h3>
            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
              
              {materials.length > 0 && (
                <div className="space-y-3 mb-4">
                  {materials.map((m, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{m.name} <span className="text-gray-400 text-xs font-normal">x{m.quantity}</span></p>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${m.status === 'approved' ? 'bg-green-100 text-green-700' : m.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {m.status}
                        </span>
                      </div>
                      <span className="font-black text-gray-800">₹{m.cost}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2">
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#10AFA5] min-w-0"
                />
                <input 
                  type="number" 
                  placeholder="Qty" 
                  value={newMaterial.quantity}
                  onChange={(e) => setNewMaterial({...newMaterial, quantity: Number(e.target.value)})}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#10AFA5] min-w-0"
                />
                <input 
                  type="number" 
                  placeholder="₹ Cost" 
                  value={newMaterial.cost}
                  onChange={(e) => setNewMaterial({...newMaterial, cost: Number(e.target.value)})}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#10AFA5] min-w-0"
                />
                <button 
                  onClick={handleAddMaterial}
                  disabled={isAddingMaterial}
                  className="bg-[#10AFA5] text-white p-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Job Timeline */}
        {timeline.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-800 mb-3 px-1">Job Timeline</h3>
            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
              <div className="relative pl-4 space-y-6">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                {timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 border-white bg-[#10AFA5] shadow-[0_0_0_3px_#E6F7F6]"></div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{event.title}</p>
                      <p className="text-xs text-gray-500">{new Date(event.time).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-40">
        <div className="max-w-lg mx-auto">
          {/* Case 1: Assigned */}
          {(!job.workerResponse || job.workerResponse === 'PENDING') && job.status !== 'cancelled' && (
            <div className="flex gap-3">
              <button 
                onClick={() => handleAction('REJECT')}
                disabled={actionLoading}
                className="flex-1 py-4 rounded-xl font-bold text-red-500 bg-red-50 active:scale-95 transition-all text-sm"
              >
                Reject Job
              </button>
              <button 
                onClick={() => handleAction('ACCEPT')}
                disabled={actionLoading}
                className="flex-1 py-4 rounded-xl font-bold text-white bg-[#10AFA5] shadow-lg shadow-[#10AFA5]/30 active:scale-95 transition-all text-sm"
              >
                Accept Job
              </button>
            </div>
          )}

          {/* Case 2: Accepted (Assigned/Confirmed) */}
          {job.workerResponse === 'ACCEPTED' && (job.status === 'assigned' || job.status === 'confirmed') && (
            <button 
              onClick={() => handleAction('MARK_ARRIVED')}
              disabled={actionLoading}
              className="w-full py-4 rounded-xl font-bold text-[#10AFA5] border-2 border-[#10AFA5] bg-white active:scale-95 transition-all text-sm"
            >
              Mark as Arrived
            </button>
          )}

          {/* Case 3: Arrived (Journey Started) -> Need to verify OTP to start work */}
          {job.status === 'journey_started' && (
            <button 
              onClick={() => handleAction('START_WORK')}
              disabled={actionLoading}
              className="w-full py-4 rounded-xl font-bold text-white bg-[#10AFA5] shadow-lg shadow-[#10AFA5]/30 active:scale-95 transition-all text-sm"
            >
              Start Work
            </button>
          )}

          {/* Case 4: In Progress (Visited / In Progress) */}
          {(job.status === 'visited' || job.status === 'in_progress') && (
            <button 
              onClick={() => handleAction('COMPLETE_WORK')}
              disabled={actionLoading}
              className="w-full py-4 rounded-xl font-bold text-white bg-[#10AFA5] shadow-lg shadow-[#10AFA5]/30 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
            >
              Complete Work <FiCheckCircle />
            </button>
          )}

          {/* Case 5: Completed */}
          {(job.status === 'work_done' || job.status === 'completed') && (
            <div className="flex gap-3">
               <button 
                onClick={() => navigate(`/worker/job/${id}/billing`)}
                className="flex-1 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                <FiFileText /> View Report
              </button>
              <button 
                className="flex-1 py-4 rounded-xl font-bold text-white bg-[#10AFA5] shadow-lg shadow-[#10AFA5]/30 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                <FiDownload /> Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <VisitVerificationModal
          isOpen={isVisitModalOpen}
          onClose={() => setIsVisitModalOpen(false)}
          bookingId={id}
          onSuccess={() => {
            setIsVisitModalOpen(false);
            fetchJobDetails();
          }}
        />
      </Suspense>

      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className={styles.chatBackdrop}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className={styles.chatPanel}
            >
              {/* Drag handle for premium sheet look */}
              <div className={styles.dragHandle} onClick={() => setIsChatOpen(false)}>
                <div className={styles.dragBar} />
              </div>

              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderLeft}>
                  {job.userId?.profilePhoto ? (
                    <img fetchPriority="low" loading="lazy" src={job.userId.profilePhoto} alt={job.userId.name} className={styles.chatHeaderAvatar} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#10AFA5] text-white flex items-center justify-center font-bold">
                      {job.userId?.name ? job.userId.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className={styles.chatHeaderName}>{job.userId?.name || 'Customer'}</h3>
                    <p className={styles.chatHeaderStatus}>
                      <span className={styles.onlineDot} /> Online
                    </p>
                  </div>
                </div>

                <div className={styles.chatHeaderRight}>
                  {/* Socket connection indicator */}
                  <span className={styles.connIndicator}>
                    {isSocketConnected ? (
                      <FiWifi className={styles.wifiGreen} size={18} />
                    ) : (
                      <FiWifiOff className={styles.wifiRed} size={18} />
                    )}
                  </span>
                  <button onClick={() => setIsChatOpen(false)} className={styles.closeChatBtn}>
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.chatMessagesContainer} ref={chatEndRef}>
                {chatMessages.length === 0 ? (
                  <div className={styles.noMessages}>
                    <div className={styles.noMessagesIcon}>💬</div>
                    <p className={styles.noMessagesTitle}>No messages yet</p>
                    <p className={styles.noMessagesSubtitle}>Say hello to start chatting with the customer!</p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => {
                    const isMe = msg.senderModel === 'Worker' || msg.senderId === job.workerId;
                    return (
                      <motion.div
                        key={msg._id || index}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className={`${styles.messageWrapper} ${
                          isMe ? styles.messageMe : styles.messageOther
                        }`}
                      >
                        <div className={styles.messageBubble}>
                          {msg.fileUrl && msg.fileType === 'image' && (
                            <img fetchPriority="low" loading="lazy"                               src={msg.fileUrl}
                              alt="attachment"
                              className={styles.chatImageAttachment}
                            />
                          )}
                          {msg.fileUrl && msg.fileType === 'document' && (
                            <a
                              href={msg.fileUrl}
                              download={msg.fileName}
                              className={styles.chatDocAttachment}
                            >
                              <FiFileText size={18} />
                              <span>{msg.fileName || 'Document'}</span>
                            </a>
                          )}
                          {msg.text && <p className={styles.messageText}>{msg.text}</p>}
                          <span className={styles.messageTime}>
                            {new Date(msg.createdAt || msg.timestamp || Date.now()).toLocaleTimeString(
                              [],
                              { hour: '2-digit', minute: '2-digit' }
                            )}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                {isTyping && (
                  <div className={`${styles.messageWrapper} ${styles.messageOther}`}>
                    <div className={styles.typingIndicatorBubble}>
                      <span className={styles.typingDot}></span>
                      <span className={styles.typingDot}></span>
                      <span className={styles.typingDot}></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Quick Replies */}
              {chatMessages.length < 5 && (
                <div className={styles.quickRepliesContainer}>
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickReplyClick(reply)}
                      className={styles.quickReplyChip}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {attachment && (
                <div className={styles.attachmentPreview}>
                  <span className={styles.attachmentName}>
                    {attachment.fileType === 'image' ? '📷 Image selected' : `📄 ${attachment.fileName}`}
                  </span>
                  <button onClick={() => setAttachment(null)} className={styles.clearAttachmentBtn}>
                    <FiX size={14} />
                  </button>
                </div>
              )}

              <div className={styles.chatInputRow}>
                <label className={styles.attachmentLabel}>
                  <FiPaperclip size={20} />
                  <input type="file" onChange={handleAttachment} style={{ display: 'none' }} />
                </label>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTypingIndicator(e.target.value.length > 0);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className={styles.chatTextInput}
                />
                <button onClick={handleSendMessage} className={styles.sendChatBtn}>
                  <FiSend size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default JobDetails;
