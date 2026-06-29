import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Phone from 'lucide-react/dist/esm/icons/phone';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import Navigation from 'lucide-react/dist/esm/icons/navigation';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import X from 'lucide-react/dist/esm/icons/x';
import Send from 'lucide-react/dist/esm/icons/send';
import Paperclip from 'lucide-react/dist/esm/icons/paperclip';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Wifi from 'lucide-react/dist/esm/icons/wifi';
import WifiOff from 'lucide-react/dist/esm/icons/wifi-off';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../../firebase';
import { ref, onValue } from 'firebase/database';
import useAppNotifications from '../../../../hooks/useAppNotifications';
import api from '../../../../services/api';
import styles from './TechnicianFound.module.css';

const TechnicianFound = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const socket = useAppNotifications('user');

  // Real-time Booking and Location States
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [coords, setCoords] = useState(null); // Customer coords
  const [workerCoords, setWorkerCoords] = useState(null); // Worker coords
  const [distance, setDistance] = useState('2.3 km');
  const [eta, setEta] = useState('15 min');

  // Real-time Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSocketConnected, setIsSocketConnected] = useState(socket ? socket.connected : false);

  const chatEndRef = useRef(null);

  const quickReplies = [
    "Please call me",
    "Where have you reached?",
    "I am waiting at the location",
    "Okay, noted"
  ];

  // Dynamic calculations: Haversine distance and estimated ETA
  const calculateDistanceAndEta = (wLat, wLng, cLat, cLng) => {
    if (!wLat || !wLng || !cLat || !cLng) return null;

    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = ((cLat - wLat) * Math.PI) / 180;
    const dLon = ((cLng - wLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((wLat * Math.PI) / 180) *
        Math.cos((cLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDistance = R * c;

    // Adjust for routing path (driving distance factor ~1.3)
    const drivingDistance = straightDistance * 1.3;

    // Average urban driving speed is ~25 km/h
    const speedKmh = 25;
    const etaMinutes = Math.round((drivingDistance / speedKmh) * 60);

    return {
      distance:
        drivingDistance < 1
          ? `${Math.round(drivingDistance * 1000)} m`
          : `${drivingDistance.toFixed(1)} km`,
      eta: etaMinutes < 2 ? '2 min' : `${etaMinutes} min`,
    };
  };

  useEffect(() => {
    fetchBookingData();
    // Stop confetti after 5 seconds
    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(confettiTimer);
  }, [bookingId]);

  // Load chat messages when opening chat overlay
  useEffect(() => {
    if (isChatOpen) {
      fetchChatHistory();
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  // Keep chat container scrolled to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping, isChatOpen]);

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

  // Socket & Firebase live tracking logic
  useEffect(() => {
    if (socket && bookingId) {
      socket.emit('join_tracking', bookingId);

      const handleLocationUpdate = (data) => {
        if (data.lat && data.lng) {
          setWorkerCoords({
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lng),
          });
        }
      };

      const handleMessageReceived = (message) => {
        if (message.bookingId === bookingId) {
          setChatMessages((prev) => [...prev, message]);
          if (!isChatOpen) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      };

      const handleTyping = (data) => {
        if (data.bookingId === bookingId && data.senderRole === 'WORKER') {
          setIsTyping(true);
        }
      };

      const handleStopTyping = (data) => {
        if (data.bookingId === bookingId && data.senderRole === 'WORKER') {
          setIsTyping(false);
        }
      };

      socket.on('live_location_update', handleLocationUpdate);
      socket.on('chat:message_received', handleMessageReceived);
      socket.on('chat:typing', handleTyping);
      socket.on('chat:stop_typing', handleStopTyping);

      return () => {
        socket.off('live_location_update', handleLocationUpdate);
        socket.off('chat:message_received', handleMessageReceived);
        socket.off('chat:typing', handleTyping);
        socket.off('chat:stop_typing', handleStopTyping);
      };
    }
  }, [socket, bookingId, isChatOpen]);

  // Firebase tracking database listener
  useEffect(() => {
    if (!db || !bookingId) return;

    const trackingRef = ref(db, `trackings/${bookingId}`);
    const unsubscribe = onValue(trackingRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.lat && data.lng) {
        setWorkerCoords({
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng),
        });
      }
    });

    return () => unsubscribe();
  }, [bookingId]);

  // Live recalculate whenever customer coordinates or worker coordinates change
  useEffect(() => {
    if (coords && workerCoords) {
      const result = calculateDistanceAndEta(
        workerCoords.lat,
        workerCoords.lng,
        coords.lat,
        coords.lng
      );
      if (result) {
        setDistance(result.distance);
        setEta(result.eta);
      }
    }
  }, [coords, workerCoords]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/bookings/${bookingId}`);
      if (res.data.success) {
        const bookingData = res.data.data;
        setBooking(bookingData);

        // Fetch customer coordinates
        if (bookingData.address && bookingData.address.lat && bookingData.address.lng) {
          setCoords({
            lat: parseFloat(bookingData.address.lat),
            lng: parseFloat(bookingData.address.lng),
          });
        }

        // Fetch worker initial coordinates
        const workerObj = bookingData.workerId;
        if (workerObj && workerObj.location) {
          if (workerObj.location.lat && workerObj.location.lng) {
            setWorkerCoords({
              lat: parseFloat(workerObj.location.lat),
              lng: parseFloat(workerObj.location.lng),
            });
          } else if (
            Array.isArray(workerObj.location.coordinates) &&
            workerObj.location.coordinates.length === 2
          ) {
            setWorkerCoords({
              lng: parseFloat(workerObj.location.coordinates[0]),
              lat: parseFloat(workerObj.location.coordinates[1]),
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch booking', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await api.get(`/chats/${bookingId}`);
      if (res.data.success) {
        setChatMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  };

  const handleCall = async () => {
    if (!booking || !booking.workerId) return;
    const workerObj = booking.workerId;
    try {
      // Trigger dialer
      window.location.href = `tel:${workerObj.phone}`;

      // Save log in Backend call history
      await api.post('/users/bookings/call-logs', {
        bookingId,
        workerId: workerObj._id || workerObj.id,
      });
    } catch (err) {
      console.error('Failed to save call log', err);
    }
  };

  const handleTypingIndicator = (isUserTyping) => {
    if (socket && bookingId) {
      if (isUserTyping) {
        socket.emit('chat:typing', { bookingId, senderRole: 'USER' });
      } else {
        socket.emit('chat:stop_typing', { bookingId, senderRole: 'USER' });
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
      bookingId,
      text: newMessage,
      fileUrl: attachment ? attachment.fileUrl : null,
      fileType: attachment ? attachment.fileType : 'none',
      fileName: attachment ? attachment.fileName : null,
    };

    if (socket) {
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
      bookingId,
      text: replyText,
      fileUrl: null,
      fileType: 'none',
      fileName: null,
    };

    if (socket) {
      socket.emit('chat:send_message', payload);
    } else {
      api.post('/chats', payload);
    }
  };

  const getWorkerStatusText = () => {
    if (!booking || !booking.workerId) return 'Offline';
    const workerObj = booking.workerId;
    const status = (workerObj.status || 'OFFLINE').toUpperCase();
    if (status === 'ONLINE') return 'Online';
    if (status === 'BUSY') return 'Busy';
    return 'Offline';
  };

  const getStatusColorClass = () => {
    if (!booking || !booking.workerId) return styles.offlineDot;
    const workerObj = booking.workerId;
    const status = (workerObj.status || 'OFFLINE').toUpperCase();
    if (status === 'ONLINE') return styles.onlineDot;
    if (status === 'BUSY') return styles.busyDot;
    return styles.offlineDot;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!booking || !booking.workerId) {
    return (
      <div className={styles.errorContainer}>
        <h3>Technician details not found</h3>
        <button onClick={() => navigate('/user/home')} className={styles.primaryBtn}>
          Go to Home
        </button>
      </div>
    );
  }

  const workerObj = booking.workerId;
  const workerImage =
    workerObj.profilePhoto ||
    workerObj.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      workerObj.name
    )}&background=14B8A6&color=fff&size=150`;

  return (
    <div className={styles.container}>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          colors={['#14B8A6', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6']}
        />
      )}

      <div className={styles.header}>
        <button onClick={() => navigate('/user/home')} className={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </button>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.titleSection}>
          <h1 className={styles.mainTitle}>Technician Found!</h1>
          <p className={styles.subtitle}>Your booking is confirmed</p>
        </div>

        <div className={styles.profileSection}>
          <div className={styles.imageWrapper}>
            <img fetchPriority="low" loading="lazy" src={workerImage} alt={workerObj.name} className={styles.profileImage} />
          </div>
          <h2 className={styles.workerName}>{workerObj.name}</h2>

          <div className={styles.ratingRow}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.ratingText}>{workerObj.rating || '4.9'}</span>
            <span className={styles.reviewsText}>
              ({workerObj.totalReviews > 0 ? workerObj.totalReviews : '2.1K'}+)
            </span>
          </div>

          <div className={styles.experienceText}>
            Experience: {workerObj.experience || '6+'} years
          </div>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statBox}>
            <div className={styles.statValueHighlight}>{eta}</div>
            <div className={styles.statLabel}>Away</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statBox}>
            <div className={styles.statValue}>{distance}</div>
            <div className={styles.statLabel}>Distance</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statBox}>
            <div className={styles.statValue}>
              {workerObj.totalJobs > 0 ? workerObj.totalJobs : '1250'}+
            </div>
            <div className={styles.statLabel}>Jobs Done</div>
          </div>
        </div>

        <div className={styles.statusRow}>
          <CheckCircle2 size={18} color="#14B8A6" />
          <span>Your technician is on the way</span>
        </div>

        <div className={styles.actionButtonsRow}>
          <button onClick={handleCall} className={styles.actionBtn}>
            <Phone size={18} color="#14B8A6" />
            <span>Call</span>
          </button>
          <button onClick={() => setIsChatOpen(true)} className={styles.actionBtn}>
            <div className={styles.chatBtnContent}>
              <MessageSquare size={18} color="#14B8A6" />
              <span>Chat</span>
              {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>}
            </div>
          </button>
          <button
            onClick={() => navigate(`/user/booking/${bookingId}/track`)}
            className={styles.actionBtn}
          >
            <Navigation size={18} color="#14B8A6" />
            <span>Track</span>
          </button>
        </div>

        <button
          className={styles.viewDetailsBtn}
          onClick={() => navigate(`/user/booking/${bookingId}`)}
        >
          View Details
        </button>
      </div>

      {/* Real-time Chat Overlay Modal Sheet */}
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
                  <img fetchPriority="low" loading="lazy" src={workerImage} alt={workerObj.name} className={styles.chatHeaderAvatar} />
                  <div>
                    <h3 className={styles.chatHeaderName}>{workerObj.name}</h3>
                    <p className={styles.chatHeaderStatus}>
                      <span className={getStatusColorClass()} /> {getWorkerStatusText()}
                    </p>
                  </div>
                </div>
                
                <div className={styles.chatHeaderRight}>
                  {/* Socket connection indicator */}
                  <span className={styles.connIndicator}>
                    {isSocketConnected ? (
                      <Wifi size={16} className={styles.wifiGreen} />
                    ) : (
                      <WifiOff size={16} className={styles.wifiRed} />
                    )}
                  </span>
                  <button onClick={() => setIsChatOpen(false)} className={styles.closeChatBtn}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.chatMessagesContainer} ref={chatEndRef}>
                {chatMessages.length === 0 ? (
                  <div className={styles.noMessages}>
                    <div className={styles.noMessagesIcon}>💬</div>
                    <p className={styles.noMessagesTitle}>No messages yet</p>
                    <p className={styles.noMessagesSubtitle}>Say hello to {workerObj.name} to start chatting!</p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => {
                    const isMe =
                      msg.senderModel === 'User' || msg.senderId === booking.userId?._id;
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
                              <FileText size={18} />
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
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className={styles.chatInputRow}>
                <label className={styles.attachmentLabel}>
                  <Paperclip size={20} />
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
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechnicianFound;


