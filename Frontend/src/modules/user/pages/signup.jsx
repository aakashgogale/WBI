import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiArrowRight, FiChevronLeft, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { userAuthService } from '../../../services/authService';
import Logo from '../../../components/common/Logo';
import LogoLoader from '../../../components/common/LogoLoader';

import { z } from "zod";

// Zod schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[a-zA-Z\s]+$/, "Name can only contain letters"),
  email: z.string().optional().refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Invalid email address"),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
});

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Refs for auto-focus
  const nameInputRef = useRef(null);
  const otpInputRefs = useRef([]);

  // Pre-fill from navigation state (Unified Flow)
  useEffect(() => {
    if (location.state?.phone && location.state?.verificationToken) {
      setFormData(prev => ({ ...prev, phoneNumber: location.state.phone }));
      setVerificationToken(location.state.verificationToken);
    }
  }, [location.state]);

  // Auto-focus logic
  useEffect(() => {
    if (step === 'details' && nameInputRef.current) {
      setTimeout(() => nameInputRef.current.focus(), 100);
    } else if (step === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0].focus(), 100);
    }
  }, [step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();

    // Zod Validation
    const validationResult = signupSchema.safeParse(formData);

    if (!validationResult.success) {
      validationResult.error.errors.forEach(err => toast.error(err.message));
      return;
    }

    setIsLoading(true);

    if (verificationToken) {
      try {
        const response = await userAuthService.register({
          name: formData.name,
          email: formData.email || null,
          verificationToken
        });
        if (response.success) {
          try {
            const { registerFCMToken } = await import('../../../services/pushNotificationService');
            await registerFCMToken('user', true);
          } catch (e) { console.error(e); }

          toast.success(
            <div className="flex flex-col">
              <span className="font-bold">Welcome to WBI!</span>
              <span className="text-xs">Your account has been created successfully.</span>
            </div>,
            { icon: <FiCheckCircle className="text-green-500" /> }
          );
          navigate('/user');
        } else {
          toast.error(response.message || 'Registration failed');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const response = await userAuthService.sendOTP(formData.phoneNumber, formData.email || null);
      if (response.success) {
        setOtpToken(response.token);
        setIsLoading(false);
        setStep('otp');
        setResendTimer(120); // Start timer
        toast.success('OTP sent successfully');
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleOtpChange = (index, value) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    if (value.length > 1) {
      // Handle paste of full OTP or partial
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      if (cleaned.length === 6) {
        setOtp(cleaned.split(''));
        otpInputRefs.current[5]?.focus();
      } else if (cleaned.length > 0) {
        const newOtp = [...otp];
        for (let i = 0; i < cleaned.length && index + i < 6; i++) {
          newOtp[index + i] = cleaned[i];
        }
        setOtp(newOtp);
        const nextIndex = Math.min(index + cleaned.length, 5);
        otpInputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-verify as last digit enters
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === 6 && !isLoading && otpToken) {
      handleOtpSubmit();
    }
  }, [otp]);

  const handleOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    if (!otpToken) {
      toast.error('Please request OTP first');
      return;
    }
    setIsLoading(true);
    try {
      const response = await userAuthService.register({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phoneNumber,
        otp: otpValue,
        token: otpToken
      });
      if (response.success) {
        setIsLoading(false);
        try {
          const { registerFCMToken } = await import('../../../services/pushNotificationService');
          await registerFCMToken('user', true);
        } catch (fcmError) {
          console.error('FCM Registration failed on signup:', fcmError);
        }

        toast.success(
          <div className="flex flex-col">
            <span className="font-bold">Welcome to WBI!</span>
            <span className="text-xs">Account created successfully.</span>
          </div>,
          { icon: <FiCheckCircle className="text-green-500" /> }
        );
        navigate('/user');
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const brandColor = themeColors.brand?.orange || '#FF8A00';

  return (
    <div className="min-h-[100dvh] bg-transparent flex flex-col pt-[max(env(safe-area-inset-top),32px)] pb-[max(env(safe-area-inset-bottom),20px)] px-6 relative overflow-x-hidden">
      
      {/* Top Logo Area */}
      <div className="w-full flex justify-center mb-10 h-16 items-center mt-2 shrink-0">
          <img fetchPriority="low" loading="lazy" 
            src="/logo/logo.webp" 
            alt="WBI Logo" 
            className="h-full w-auto max-w-[180px] object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'block';
              }
            }}
          />
          <span className="hidden text-3xl font-extrabold text-[#FF8A00] tracking-tight">WBI</span>
      </div>

      {/* Heading Area */}
      <div className="w-full text-center mb-10 shrink-0">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a2b3c] tracking-tight">
          {step === 'details' ? 'Create Account' : 'Verify Phone'}
        </h2>
        <p className="mt-3 text-sm text-gray-500 font-medium">
          {step === 'details' 
            ? 'Join WBI to start booking services' 
            : `We've sent a 6-digit code to ${formData.phoneNumber}`}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          {step === 'details' ? (
            <form className="flex flex-col flex-1" onSubmit={handleDetailsSubmit}>
              {verificationToken && (
                <button
                  type="button"
                  onClick={() => navigate('/user/login')}
                  className="flex items-center text-sm font-bold text-gray-500 hover:text-[#FF8A00] transition-colors mb-6 ml-1"
                >
                  <FiChevronLeft className="mr-1 h-5 w-5" /> Back to Login
                </button>
              )}

              <div className="mb-5">
                <label htmlFor="name" className="block text-sm font-semibold text-[#1a2b3c] mb-3 ml-1">
                  Full Name
                </label>
                <div className="relative rounded-2xl group border border-gray-200 focus-within:border-[#FF8A00] focus-within:ring-1 focus-within:ring-[#FF8A00] transition-all bg-white shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#FF8A00] transition-colors">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={nameInputRef}
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-12 pr-4 py-4 bg-transparent border-transparent focus:border-transparent focus:ring-0 sm:text-lg font-bold text-[#1a2b3c] placeholder-gray-300 rounded-2xl"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-semibold text-[#1a2b3c] mb-3 ml-1">
                  Email <span className="text-gray-400 font-medium ml-1">(Optional)</span>
                </label>
                <div className="relative rounded-2xl group border border-gray-200 focus-within:border-[#FF8A00] focus-within:ring-1 focus-within:ring-[#FF8A00] transition-all bg-white shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#FF8A00] transition-colors">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-12 pr-4 py-4 bg-transparent border-transparent focus:border-transparent focus:ring-0 sm:text-lg font-bold text-[#1a2b3c] placeholder-gray-300 rounded-2xl"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {!verificationToken && (
                <div className="mb-6">
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-[#1a2b3c] mb-3 ml-1">
                    Phone Number
                  </label>
                  <div className="relative rounded-2xl group border border-gray-200 focus-within:border-[#FF8A00] focus-within:ring-1 focus-within:ring-[#FF8A00] transition-all bg-white shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#FF8A00] transition-colors">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-semibold border-r pr-3 border-gray-200 sm:text-base">+91</span>
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      className="block w-full pl-[100px] pr-4 py-4 bg-transparent border-transparent focus:border-transparent focus:ring-0 sm:text-lg font-bold text-[#1a2b3c] placeholder-gray-300 rounded-2xl"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>
              )}

              {/* Action Area */}
              <div className="mt-auto pt-8 pb-4 flex flex-col gap-6">
                <button
                  type="submit"
                  disabled={isLoading || (!verificationToken && formData.phoneNumber.length < 10) || formData.name.length < 2}
                  className="w-full flex justify-center py-4 px-4 rounded-2xl text-base font-bold text-white transition-all duration-300 ease-in-out disabled:opacity-50 disabled:bg-[#8ebac3] disabled:cursor-not-allowed active:scale-[0.98] shadow-md hover:shadow-lg"
                  style={{ backgroundColor: brandColor }}
                >
                  {isLoading ? (
                    <LogoLoader fullScreen={false} inline={true} size="w-6 h-6" />
                  ) : (
                    <span>{verificationToken ? 'Complete Registration' : 'Send OTP'}</span>
                  )}
                </button>

                <p className="text-sm text-gray-500 font-medium text-center">
                  Already have an account?{' '}
                  <Link
                    to="/user/login"
                    className="text-[#FF8A00] hover:text-[#e65100] font-bold transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form className="flex flex-col flex-1" onSubmit={handleOtpSubmit}>
              <div className="flex justify-center gap-2 sm:gap-3 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-gray-200 rounded-2xl focus:ring-[#FF8A00] focus:border-[#FF8A00] transition-all bg-white shadow-sm"
                    style={{ caretColor: brandColor, color: '#1a2b3c' }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-sm mb-6 px-1">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="flex items-center font-bold text-gray-500 hover:text-[#FF8A00] transition-colors"
                >
                  <FiChevronLeft className="mr-1 h-5 w-5" /> Edit Details
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (isLoading || resendTimer > 0) return;
                    try {
                      setIsLoading(true);
                      const response = await userAuthService.sendOTP(formData.phoneNumber, formData.email || null);
                      if (response.success) {
                        setOtpToken(response.token);
                        setResendTimer(120);
                        toast.success('New code sent!');
                      }
                    } catch (error) {
                      toast.error('Failed to resend code');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading || resendTimer > 0}
                  className="font-bold text-[#FF8A00] hover:text-[#e65100] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0
                    ? `Resend in ${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, '0')}`
                    : 'Resend code'}
                </button>
              </div>

              <div className="mt-auto pt-8 pb-4">
                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full flex justify-center py-4 px-4 rounded-2xl text-base font-bold text-white transition-all duration-300 ease-in-out disabled:opacity-50 disabled:bg-[#8ebac3] disabled:cursor-not-allowed active:scale-[0.98] shadow-md hover:shadow-lg"
                  style={{ backgroundColor: brandColor }}
                >
                  {isLoading ? (
                    <LogoLoader fullScreen={false} inline={true} size="w-6 h-6" />
                  ) : (
                    <span>Verify & Create Account</span>
                  )}
                </button>
              </div>
            </form>
          )}
      </div>

      {/* Footer */}
      <div className="w-full text-center text-xs text-gray-400 mt-4 shrink-0 pb-2">
        &copy; {new Date().getFullYear()} WBI. All rights reserved.
      </div>
    </div>
  );
};

export default Signup;
