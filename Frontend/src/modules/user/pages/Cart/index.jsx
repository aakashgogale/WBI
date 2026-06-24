import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiTrash2, FiPlus, FiMinus, FiX, FiMapPin, FiCalendar, FiShield, FiTag, FiInfo, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { HiOutlineReceiptPercent } from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../../theme';
import BottomNav from '../../components/layout/BottomNav';
import { useCart } from '../../../../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, isLoading: loading, removeItem, updateItem } = useCart();
  const [address, setAddress] = useState('Select Location');

  useEffect(() => {
    const savedAddr = localStorage.getItem('currentAddress');
    if (savedAddr) setAddress(savedAddr);
  }, []);

  const cartCount = cartItems.length;

  const handleDeleteAll = async () => {
    try {
      await Promise.all(cartItems.map(item => removeItem(item._id || item.id)));
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await removeItem(itemId);
      if (response.success) {
        toast.success('Item removed from cart');
      } else {
        toast.error(response.message || 'Failed to remove item');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleQuantityChange = async (itemId, change, currentCount) => {
    try {
      const newCount = currentCount + change;
      if (newCount < 1) return;
      const response = await updateItem(itemId, newCount);
      if (!response.success) {
        toast.error(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  // Calculations
  const platformFee = 49;
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const gst = Math.round(subtotal * 0.18);
  const totalAmount = subtotal > 0 ? (subtotal + platformFee + gst) : 0;
  
  const totalOriginalPrice = cartItems.reduce((sum, item) => {
    const unitOriginalPrice = item.originalPrice || (item.unitPrice || (item.price / (item.serviceCount || 1)));
    return sum + (unitOriginalPrice * (item.serviceCount || 1));
  }, 0);
  const savings = Math.max(0, totalOriginalPrice - subtotal);

  const getFeatures = (item) => {
    if (item.card?.features && item.card.features.length > 0) return item.card.features;
    if (item.category) return [item.category];
    return [];
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-36 relative font-sans">
      
      {/* Header */}
      <header className="pt-12 pb-4 px-4 sticky top-0 z-40 bg-[#FAFAFA]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">My Cart</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <FiShield className="w-3.5 h-3.5 text-[#10AFA5]" />
              <span className="text-[13px] text-gray-500 font-medium">Your services are safe with us</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-1 text-[#111827]">
            <button className="hover:opacity-70 transition-opacity">
              <FiHeart className="w-[22px] h-[22px]" />
            </button>
            <button onClick={handleDeleteAll} className="hover:opacity-70 transition-opacity">
              <FiTrash2 className="w-[22px] h-[22px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-4">
        {loading ? (
          <div className="space-y-4 mt-2">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl h-36 border border-gray-100 animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl mt-4 shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-800 text-[18px] font-bold">Your cart is empty</p>
            <p className="text-gray-500 text-[14px] mt-1">Add services to get started</p>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="space-y-4 mt-2">
              {cartItems.map((item) => (
                <div key={item._id || item.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 relative flex gap-3">
                  {/* Remove Button */}
                  <button 
                    onClick={() => handleDelete(item._id || item.id)}
                    className="absolute top-3.5 right-3.5 p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>

                  {/* Image */}
                  <div className="w-[84px] h-[84px] rounded-[10px] overflow-hidden bg-gray-50 shrink-0 border border-gray-100 flex items-center justify-center mt-1">
                    {(item.imageUrl || item.card?.imageUrl || item.icon) ? (
                      <img 
                        src={item.imageUrl || item.card?.imageUrl || item.icon} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=200&auto=format&fit=crop' }}
                      />
                    ) : (
                      <span className="text-[#10AFA5] font-bold text-xl">{item.title?.charAt(0)}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between pt-0.5">
                    <div className="pr-6">
                      <h3 className="text-[15px] font-bold text-[#111827] leading-snug">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        <FiMapPin className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                        <span className="text-[12px] text-[#6B7280] truncate font-medium">{address}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <FiCalendar className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                        <span className="text-[12px] text-[#6B7280] font-medium">Scheduled at Checkout</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pr-2">
                        {getFeatures(item).slice(0, 3).map((feat, idx) => (
                          <span key={idx} className="bg-[#E0F2F1] text-[#10AFA5] text-[10px] font-bold px-2 py-1 rounded-full truncate max-w-[80px]">
                            {feat}
                          </span>
                        ))}
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[15px] font-bold text-[#10AFA5] absolute top-3.5 right-10">
                          ₹{item.price?.toLocaleString('en-IN') || 0}
                        </span>
                        
                        <div className="flex items-center bg-white border border-gray-200 rounded-[8px] h-[30px] mt-2">
                          <button 
                            onClick={() => handleQuantityChange(item._id || item.id, -1, item.serviceCount || 1)}
                            className="w-[30px] h-full flex items-center justify-center text-[#10AFA5] active:bg-gray-50 rounded-l-[8px] transition-colors"
                          >
                            <FiMinus className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-[30px] h-full flex items-center justify-center text-[13px] font-bold text-[#111827] border-x border-gray-100">
                            {item.serviceCount || 1}
                          </div>
                          <button 
                            onClick={() => handleQuantityChange(item._id || item.id, 1, item.serviceCount || 1)}
                            className="w-[30px] h-full flex items-center justify-center text-[#10AFA5] active:bg-gray-50 rounded-r-[8px] transition-colors"
                          >
                            <FiPlus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Card */}
            <div className="mt-5 bg-[#F3F9F9] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-[#E0EFEF]">
                  <HiOutlineReceiptPercent className="w-[22px] h-[22px] text-[#10AFA5]" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#111827]">Apply Coupon</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Get exciting offers on your services</p>
                </div>
              </div>
              <button className="flex items-center text-[#10AFA5] text-[13px] font-bold shrink-0">
                View Coupons <FiChevronRight className="ml-0.5 w-[18px] h-[18px]"/>
              </button>
            </div>

            {/* Bill Summary */}
            <div className="mt-5 bg-white rounded-2xl p-4.5 pt-5 pb-5 shadow-sm border border-gray-100">
              <h3 className="text-[15px] font-bold text-[#111827] mb-4">Bill Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500 font-medium">Subtotal ({cartCount} Items)</span>
                  <span className="text-[#111827] font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500 font-medium flex items-center gap-1">
                    Platform Fee <FiInfo className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                  <span className="text-[#111827] font-bold">₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500 font-medium">GST (18%)</span>
                  <span className="text-[#111827] font-bold">₹{gst.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-4 w-full"></div>

              <div className="flex justify-between items-center mb-1">
                <span className="text-[14px] font-bold text-[#111827]">Total Amount</span>
                <span className="text-[18px] font-extrabold text-[#10AFA5]">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              
              {savings > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-[#059669]">
                  <FiTag className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-bold">You saved ₹{savings.toLocaleString('en-IN')} on this order</span>
                </div>
              )}
            </div>

            {/* Secure Checkout Trust */}
            <div className="mt-5 bg-[#F6FAF6] rounded-2xl p-4 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-[34px] h-[34px] rounded-full bg-[#EAF2EA] flex items-center justify-center shrink-0">
                  <FiShield className="w-[18px] h-[18px] text-[#059669]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#059669]">Secure Checkout</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-medium">100% safe and secure payments</p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {/* Simulated Payment Icons */}
                <div className="w-[34px] h-[22px] bg-white rounded-[4px] shadow-sm flex items-center justify-center text-[8px] font-extrabold italic text-gray-800 tracking-tight">UPI</div>
                <div className="w-[34px] h-[22px] bg-white rounded-[4px] shadow-sm flex items-center justify-center text-[9px] font-extrabold italic text-[#1A1F71] tracking-tight">VISA</div>
                <div className="w-[34px] h-[22px] bg-white rounded-[4px] shadow-sm flex items-center justify-center">
                  <div className="flex -space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EB001B] opacity-90"></div>
                    <div className="w-3 h-3 rounded-full bg-[#F79E1B] opacity-90 mix-blend-multiply"></div>
                  </div>
                </div>
                <div className="w-[34px] h-[22px] bg-white rounded-[4px] shadow-sm flex items-center justify-center text-[8px] font-extrabold italic text-[#002E6E] tracking-tight">RuPay</div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Fixed Bottom Action Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-[65px] left-0 right-0 z-50 bg-white px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col justify-center">
              <p className="text-[12px] text-[#111827] font-bold mb-0.5">Total Payable</p>
              <div className="flex items-center gap-1 cursor-pointer">
                <span className="text-[18px] font-extrabold text-[#10AFA5]">₹{totalAmount.toLocaleString('en-IN')}</span>
                <FiChevronDown className="w-[18px] h-[18px] text-[#6B7280] mt-1" />
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/user/checkout')}
              className="bg-[#10AFA5] text-white px-5 py-3 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#0E9A92] transition-colors active:scale-95 w-[210px] shadow-md shadow-[#10AFA5]/20"
            >
              Proceed to Checkout
              <FiChevronRight className="w-[18px] h-[18px] stroke-[2.5px] ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
};

export default Cart;
