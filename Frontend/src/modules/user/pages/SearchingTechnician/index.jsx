import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './SearchingTechnician.module.css';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Search from 'lucide-react/dist/esm/icons/search';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import X from 'lucide-react/dist/esm/icons/x';
import Navigation from 'lucide-react/dist/esm/icons/navigation';
import Users from 'lucide-react/dist/esm/icons/users';
import Wifi from 'lucide-react/dist/esm/icons/wifi';
import Send from 'lucide-react/dist/esm/icons/send';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon missing in Leaflet when using React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons
const createWorkerIcon = (avatarUrl) => new L.DivIcon({
  className: 'custom-worker-marker',
  html: `<div class="${styles.mapWorkerMarker}">
           <img fetchPriority="low" loading="lazy" src="${avatarUrl || 'https://ui-avatars.com/api/?name=W&background=14B8A6&color=fff'}" alt="worker" />
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const homeIcon = new L.DivIcon({
  className: 'custom-home-marker',
  html: `<div class="${styles.mapHomeMarker}">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
         </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

const SearchingTechnician = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [status, setStatus] = useState('searching_worker');
  const [message, setMessage] = useState('Searching nearby experts...');
  const [subMessage, setSubMessage] = useState('Estimated wait: 30-60 sec');
  const [step, setStep] = useState(1); // 1: Searching, 2: Checking, 3: Requested, 4: Assigned
  
  // Live Stats
  const [workersFound, setWorkersFound] = useState(0);
  const [workersAvailable, setWorkersAvailable] = useState(0);
  const [requestsSent, setRequestsSent] = useState(0);
  
  const [mapCenter, setMapCenter] = useState([28.7041, 77.1025]);
  const [searchRadius, setSearchRadius] = useState(5);
  const [workersList, setWorkersList] = useState([]);
  
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);

  // References
  const socketRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const socketBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || 'https://app.wbinfs.com';
    const socket = io(socketBaseUrl, {
      auth: { token },
      path: '/socket.io/',
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_tracking', bookingId);
    });

    socket.on('booking:searchStarted', (data) => {
      setStatus('searching');
      setMessage('Searching nearby experts...');
      setSubMessage('Estimated wait: 30-60 sec');
      setSearchRadius(data.radius || 5);
      setStep(1);
      if (data.center?.lat && data.center?.lng) {
        setMapCenter([data.center.lat, data.center.lng]);
      }
    });

    socket.on('booking:radiusExpanded', (data) => {
      setSearchRadius(data.radius);
    });

    socket.on('booking:workersFound', (data) => {
      setWorkersFound(data.count);
      setWorkersAvailable(data.count); // Assuming all found are available initially for UI purposes
      setStep(2);
      if (data.workers) {
        setWorkersList(data.workers);
      }
    });

    socket.on('booking:requestSentToWorker', (data) => {
      setRequestsSent(prev => prev + 1);
      setStep(3);
    });

    socket.on('booking:noWorkerAvailable', (data) => {
      setStatus('failed');
      setMessage('No technician available nearby');
      setSubMessage('Please try again or schedule for later');
    });

    socket.on('booking:workerAccepted', (data) => {
      setStatus('assigned');
      setStep(4);
      setBottomSheetExpanded(true);
      
      setTimeout(() => {
        navigate(`/user/booking/technician-found/${bookingId}`);
      }, 3000);
    });

    // Fallback polling in case socket disconnects or fails
    const pollInterval = setInterval(async () => {
      if (!socketRef.current || !socketRef.current.connected) {
        try {
          const response = await fetch(`${socketBaseUrl}/api/users/bookings/${bookingId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const result = await response.json();
          if (result.success && result.data) {
            const booking = result.data;
            if (booking.status === 'worker_assigned' || booking.status === 'assigned') {
              setStatus('assigned');
              setStep(4);
              setBottomSheetExpanded(true);
              clearInterval(pollInterval);
              setTimeout(() => {
                navigate(`/user/booking/technician-found/${bookingId}`);
              }, 3000);
            } else if (booking.status === 'cancelled' || booking.status === 'failed' || booking.status === 'no_worker_found' || booking.status === 'admin_action_required') {
              setStatus('failed');
              setMessage('No technician available nearby');
              setSubMessage('Please try again or schedule for later.');
              clearInterval(pollInterval);
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }
    }, 5000);

    // Fallback UI Timeout (90 seconds)
    const uiTimeout = setTimeout(() => {
      setStatus(prev => {
        if (prev === 'searching_worker' || prev === 'searching') {
          setMessage('Search Timed Out');
          setSubMessage('No technician responded within the expected time. Please try again or schedule for later.');
          return 'failed';
        }
        return prev;
      });
    }, 90000);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      clearInterval(pollInterval);
      clearTimeout(uiTimeout);
    };
  }, [bookingId, navigate]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      {/* Top Floating Status Card */}
      <div className={styles.topCardWrapper}>
        <div className={styles.topCard}>
          <div className={styles.topCardLeft}>
             <div className={styles.searchIconRing}>
                <Search size={18} color="#14B8A6" className={status === 'searching' ? styles.spinning : ''} />
             </div>
             <div className={styles.topCardText}>
               <h3 className={status === 'assigned' ? styles.textSuccess : ''}>{message}</h3>
               <p>{subMessage}</p>
               {workersFound > 0 && status !== 'failed' && (
                 <div className={styles.liveStatText}>
                   <strong>{workersFound}</strong> workers found • <strong>{workersAvailable}</strong> available now
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Map Background Wrapper */}
      <div className={styles.mapBackground}>
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          scrollWheelZoom={false} 
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {/* User Location */}
          <Marker position={mapCenter} icon={homeIcon} />

          {/* Worker Markers */}
          {workersList.map(worker => {
            if (worker.lat && worker.lng) {
              return (
                <Marker key={worker.id} position={[worker.lat, worker.lng]} icon={createWorkerIcon(worker.photo)}>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
        
        {/* Radar Pulse Animation Overlay (Centered strictly on mapCenter) */}
        {status !== 'failed' && status !== 'assigned' && (
          <div className={styles.radarCenter}>
            <div className={styles.pulseRing}></div>
            <div className={styles.pulseRing} style={{ animationDelay: '1s' }}></div>
            <div className={styles.pulseRing} style={{ animationDelay: '2s' }}></div>
          </div>
        )}

        {/* Floating Radius Badge inside Map */}
        <div className={styles.floatingRadius}>
          <div className={styles.radiusIcon}>
            <Navigation size={14} color="#14B8A6" />
          </div>
          <div className={styles.radiusText}>
            <span>Search Radius</span>
            <strong>{searchRadius} KM</strong>
          </div>
        </div>
      </div>

      {/* Apple-style Bottom Sheet */}
      <div className={`${styles.bottomSheet} ${bottomSheetExpanded ? styles.expanded : styles.collapsed}`}>
        <div className={styles.dragHandle} onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}>
          <div className={styles.dragBar}></div>
        </div>

        <div className={styles.sheetContent}>
          
          {/* Loading Dots Section */}
          {status !== 'failed' && status !== 'assigned' && (
            <div className={styles.loaderSection}>
               <h4 className={styles.loaderTitle}>
                 {step === 1 && 'Searching nearby experts'}
                 {step === 2 && 'Checking availability'}
                 {step === 3 && 'Waiting for confirmation'}
               </h4>
               <div className={styles.dotLoader}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
               </div>
            </div>
          )}

          {/* Live Timeline */}
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineIcon} ${styles.completed}`}>✓</div>
              <div className={styles.timelineText}>Booking Created</div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineIcon} ${step > 1 ? styles.completed : step === 1 ? styles.activeSpinner : ''}`}>
                {step > 1 ? '✓' : ''}
              </div>
              <div className={styles.timelineText}>Searching Nearby Workers</div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineIcon} ${step > 2 ? styles.completed : step === 2 ? styles.activeHourglass : ''}`}>
                {step > 2 ? '✓' : step === 2 ? '⏳' : ''}
              </div>
              <div className={styles.timelineText}>Checking Availability</div>
            </div>

            <div className={styles.timelineItem}>
              <div className={`${styles.timelineIcon} ${step > 3 ? styles.completed : step === 3 ? styles.activeDot : ''}`}>
                {step > 3 ? '✓' : ''}
              </div>
              <div className={styles.timelineText}>Waiting For Acceptance</div>
            </div>

            <div className={styles.timelineItem}>
              <div className={`${styles.timelineIcon} ${step === 4 ? styles.completed : ''}`}>
                {step === 4 ? '✓' : ''}
              </div>
              <div className={styles.timelineText}>Technician Assigned</div>
            </div>
          </div>

          {/* Live Stats Grid */}
          {status !== 'failed' && (
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                 <Users size={16} color="#64748b" />
                 <div className={styles.statBoxInfo}>
                    <span>Workers Found</span>
                    <strong>{workersFound}</strong>
                 </div>
              </div>
              <div className={styles.statBox}>
                 <CheckCircle2 size={16} color="#10b981" />
                 <div className={styles.statBoxInfo}>
                    <span>Available</span>
                    <strong>{workersAvailable}</strong>
                 </div>
              </div>
              <div className={styles.statBox}>
                 <Send size={16} color="#3b82f6" />
                 <div className={styles.statBoxInfo}>
                    <span>Requests Sent</span>
                    <strong>{requestsSent}</strong>
                 </div>
              </div>
              <div className={styles.statBox}>
                 <Wifi size={16} color="#8b5cf6" />
                 <div className={styles.statBoxInfo}>
                    <span>Radius</span>
                    <strong>{searchRadius} KM</strong>
                 </div>
              </div>
            </div>
          )}

          {/* Failed State */}
          {status === 'failed' && (
             <div className={styles.failedBox}>
                <X size={32} color="#ef4444" className={styles.failedIcon} />
                <h3>Search Failed</h3>
                <p>We couldn't find an available technician in your area. Items have been restored to your cart.</p>
                <div className={styles.failedActions}>
                  <button className={styles.btnPrimary} onClick={() => navigate('/user/cart')}>Go to Cart</button>
                  <button className={styles.btnOutline} onClick={() => navigate('/user/home')}>Back to Home</button>
                </div>
             </div>
          )}

          {/* Nearby Experts List */}
          {workersList.length > 0 && status !== 'failed' && (
            <div className={styles.expertsSection}>
              <div className={styles.expertsHeader}>
                <h3>Nearby Experts Preview</h3>
              </div>
              <div className={styles.expertsList}>
                {workersList.slice(0, 3).map((worker, idx) => {
                  let workerStatus = 'Searching...';
                  if (step >= 2) workerStatus = 'Available';
                  if (step >= 3 && idx === 0) workerStatus = 'Request Sent';
                  if (step === 4 && idx === 0) workerStatus = 'Accepted';

                  return (
                    <div key={idx} className={`${styles.expertCard} ${idx === 0 && step >= 3 ? styles.expertCardActive : ''}`}>
                      <div className={styles.expertCardHeader}>
                        <img fetchPriority="low" loading="lazy" src={worker.photo || `https://ui-avatars.com/api/?name=${worker.name}&background=14B8A6&color=fff`} alt={worker.name} className={styles.expertAvatar} />
                        <div className={styles.expertInfo}>
                          <h4>{worker.name} <ShieldCheck size={14} color="#14B8A6" /></h4>
                          <div className={styles.expertMeta}>
                            <span className={styles.rating}>★ {worker.rating}</span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.distance}>{worker.distance} km</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.expertStatus}>
                        <span className={`${styles.statusIndicator} ${idx === 0 && step === 3 ? styles.pulsingDot : ''}`}></span>
                        {workerStatus}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trust Badge */}
          <div className={styles.trustBadge}>
            <ShieldCheck size={20} color="#14B8A6" />
            <p>Verified & Background Checked Experts</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default SearchingTechnician;
