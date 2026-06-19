import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, MapPin, Calendar, Clock, Info, Shield, Plus, X } from 'lucide-react';
import { useSocket } from '../../../../context/SocketContext'; // Assuming socket context is here
import styles from './ReviewBooking.module.css';
import api from '../../../../services/api';

// Using API service instead of raw fetch
const fetchDraft = async (draftId) => {
  const res = await api.get(`/booking-draft/${draftId}/review`);
  return res.data;
};

const fetchAvailability = async (draftId) => {
  const res = await api.get(`/bookings/availability/${draftId}`);
  return res.data;
};

const validateCoupon = async ({ draftId, code }) => {
  const res = await api.post(`/coupons/validate`, { draftId, code });
  return res.data;
};

const confirmBooking = async (draftId) => {
  const res = await api.post(`/booking-draft/confirm`, { draftId });
  return res.data;
};

const updateDraftNotes = async ({ draftId, notes }) => {
  const res = await api.patch(`/booking-draft/${draftId}`, notes);
  return res.data;
};

const ReviewBooking = () => {
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId');
  const navigate = useNavigate();
  const socket = useSocket();

  const [couponCode, setCouponCode] = useState('');
  const [instructions, setInstructions] = useState('');

  // Fetch Draft Data
  const { data: draftData, isLoading: draftLoading, refetch: refetchDraft } = useQuery({
    queryKey: ['bookingDraft', draftId],
    queryFn: () => fetchDraft(draftId),
    refetchInterval: 15000 // 15s short polling as fallback
  });

  // Fetch Availability Data
  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: ['bookingAvailability', draftId],
    queryFn: () => fetchAvailability(draftId),
    refetchInterval: 15000
  });

  // Mutations
  const couponMutation = useMutation({
    mutationFn: validateCoupon,
    onSuccess: () => refetchDraft()
  });

  const confirmMutation = useMutation({
    mutationFn: confirmBooking,
    onSuccess: (data) => {
      navigate(`/user/booking/searching/${data.bookingId}`);
    }
  });

  const updateNotesMutation = useMutation({
    mutationFn: updateDraftNotes
  });

  // Socket.io real-time updates
  useEffect(() => {
    if (socket && draftId) {
      socket.emit('joinBookingDraftRoom', draftId);
      
      socket.on('pricingUpdated', () => refetchDraft());
      socket.on('bookingDraftUpdated', () => refetchDraft());

      return () => {
        socket.emit('leaveBookingDraftRoom', draftId);
        socket.off('pricingUpdated');
        socket.off('bookingDraftUpdated');
      };
    }
  }, [socket, draftId, refetchDraft]);

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      couponMutation.mutate({ draftId, code: couponCode });
    }
  };

  const handleNotesChange = (e) => {
    setInstructions(e.target.value);
  };

  const handleNotesBlur = () => {
    if (instructions !== draft?.specialInstructions) {
      updateNotesMutation.mutate({ draftId, notes: { specialInstructions: instructions } });
    }
  };

  if (draftLoading || availabilityLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>Review Order</div>
        <div className={styles.content}>
           <div className={styles.card} style={{ height: 200 }}>
             <div className={styles.skeleton} style={{ height: '100%', width: '100%' }}></div>
           </div>
        </div>
      </div>
    );
  }

  const draft = draftData?.data;
  const pricing = draft?.priceSnapshot;
  const availability = availabilityData?.data;

  console.log('[ReviewBooking] Loaded Draft:', draft);
  console.log('[ReviewBooking] Draft Address:', draft?.address);

  // Formatting helpers
  const formatMoney = (amount) => `₹${(amount || 0).toFixed(2)}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>Review Order</div>

      <div className={styles.content}>
        
        {/* Stepper */}
        <div className={styles.stepper}>
          <div className={`${styles.step} ${styles.stepCompleted}`}>
            <div className={styles.stepIcon}><Check size={16} /></div>
            <div className={styles.stepLabel}>Service</div>
            <div className={styles.stepLine}></div>
          </div>
          <div className={`${styles.step} ${styles.stepCompleted}`}>
            <div className={styles.stepIcon}><Check size={16} /></div>
            <div className={styles.stepLabel}>Address</div>
            <div className={styles.stepLine}></div>
          </div>
          <div className={`${styles.step} ${styles.stepCurrent}`}>
            <div className={styles.stepIcon}>3</div>
            <div className={styles.stepLabel}>Review</div>
            <div className={styles.stepLine}></div>
          </div>
          <div className={`${styles.step} ${styles.stepPending}`}>
            <div className={styles.stepIcon}>4</div>
            <div className={styles.stepLabel}>Payment</div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Order Summary</div>
          
          <div className={styles.summaryRow}>
            <div className={styles.summaryLabel}>{draft?.serviceId?.name || 'Service'}</div>
          </div>
          
          {draft?.brandId && (
            <div className={styles.summaryRow}>
              <div className={styles.summaryLabel}>Brand</div>
              <div className={styles.summaryValue}>{draft.brandId.brandName || draft.brandId.name}</div>
            </div>
          )}

          {draft?.issueIds?.length > 0 && (
            <div className={styles.serviceList}>
              <div className={styles.summaryLabel} style={{marginBottom: 8}}>Problems</div>
              {draft.issueIds.map(issue => (
                <div key={issue._id} className={styles.serviceItem}>
                  <span>• {issue.title || issue.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.serviceList}>
            <div className={styles.summaryLabel} style={{marginBottom: 8}}>Services</div>
            {draft?.packageIds?.map(pkg => (
              <div key={pkg._id} className={styles.serviceItem}>
                <span>• {pkg.name}</span>
                <span>{formatMoney(pkg.price)}</span>
              </div>
            ))}
          </div>

          <div className={styles.priceBreakdown}>
             {pricing?.visitCharge > 0 && (
               <div className={styles.priceRow}>
                 <span>Visit Charge</span>
                 <span>{formatMoney(pricing.visitCharge)}</span>
               </div>
             )}
             {pricing?.platformFee > 0 && (
               <div className={styles.priceRow}>
                 <span>Platform Fee <Info size={12} color="#8e8e93" /></span>
                 <span>{formatMoney(pricing.platformFee)}</span>
               </div>
             )}
             {pricing?.gst > 0 && (
               <div className={styles.priceRow}>
                 <span>GST (18%)</span>
                 <span>{formatMoney(pricing.gst)}</span>
               </div>
             )}
             {pricing?.couponDiscount > 0 && (
               <div className={styles.priceRow} style={{ color: '#00a082' }}>
                 <span>Coupon Discount</span>
                 <span>-{formatMoney(pricing.couponDiscount)}</span>
               </div>
             )}
             <div className={styles.priceTotal}>
               <span>Total Amount</span>
               <span>{formatMoney(pricing?.finalAmount)}</span>
             </div>
          </div>
        </div>

        {/* Schedule & Address */}
        <div className={styles.card}>
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}><Calendar size={18} /></div>
            <div className={styles.infoText}>
              <div className={styles.infoTextTitle}>Schedule</div>
              <div className={styles.infoTextValue}>
                {draft?.scheduledDate ? new Date(draft.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}, {draft?.scheduledTime}
              </div>
            </div>
          </div>
          
          <div className={styles.infoRow} style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className={styles.infoIcon}><MapPin size={18} /></div>
              <div className={styles.infoText}>
                <div className={styles.infoTextTitle}>Address</div>
                <div className={styles.infoTextValue}>
                  {draft?.address ? `${draft.address.address || draft.address.line1 || draft.address.addressLine1 || ''}, ${draft.address.city || ''}, ${draft.address.state || ''} ${draft.address.pincode || ''}` : <span style={{color: '#dc2626'}}>No address selected</span>}
                </div>
              </div>
            </div>
            {!draft?.address && (
               <button 
                 onClick={() => navigate(`/user/one-time-checkout?draftId=${draftId}`)}
                 style={{ padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
               >
                 Add
               </button>
            )}
          </div>
        </div>

        {/* Worker Availability */}
        {availability && (
           <div className={styles.card}>
             <div className={styles.cardTitle}>Availability</div>
             <div className={styles.infoRow}>
               <div className={styles.infoText}>
                  <div className={styles.infoTextTitle}>Status</div>
                  <div className={styles.infoTextValue}>
                    <span className={`${styles.badge} ${availability.status === 'Available' ? styles.badgeSuccess : styles.badgeWarning}`}>
                      {availability.status}
                    </span>
                  </div>
                  <div style={{fontSize: 13, color: '#8e8e93', marginTop: 8}}>
                    {availability.availableWorkers} pros available near you
                  </div>
               </div>
             </div>
           </div>
        )}


        {/* Special Instructions */}
        <div className={styles.card}>
           <div className={styles.cardTitle}>Special Instructions</div>
           <textarea 
             className={styles.notesInput} 
             placeholder="E.g., Please ring doorbell, call before arrival..."
             value={instructions}
             onChange={handleNotesChange}
             onBlur={handleNotesBlur}
           />
        </div>

      </div>

      <div className={styles.bottomBar}>
        {confirmMutation.isError && (
          <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 14, textAlign: 'center' }}>
            Failed to confirm booking. Please try again.
          </div>
        )}
        <button 
          className={styles.bookBtn} 
          onClick={() => confirmMutation.mutate(draftId)}
          disabled={confirmMutation.isPending || !draft?.address}
        >
          {confirmMutation.isPending ? 'Processing...' : !draft?.address ? 'Select Address to Continue' : 'Book Service'}
        </button>
      </div>

    </div>
  );
};

export default ReviewBooking;
