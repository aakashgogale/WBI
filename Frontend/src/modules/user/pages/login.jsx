import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiPhone, FiArrowRight, FiCheckCircle, FiChevronLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { userAuthService } from '../../../services/authService';
import LogoLoader from '../../../components/common/LogoLoader';
import DebugConsole from '../components/common/DebugConsole';
import Onboarding from '../components/Onboarding';

import { z } from "zod";

// Zod schema
const phoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
});

const Login = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem('onboardingCompleted_v4');
    } catch {
      return false; // Safely default to false if localStorage is unavailable
    }
  });
  
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
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

  // Refs for focus management
  const phoneInputRef = useRef(null);
  const otpInputRefs = useRef([]);

  // Auto-focus logic
  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem('accessToken')) {
      navigate('/user', { replace: true });
      return;
    }

    if (step === 'phone' && phoneInputRef.current) {
      setTimeout(() => phoneInputRef.current.focus(), 100);
    } else if (step === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0].focus(), 100);
    }
  }, [step, navigate]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    // Zod Validation
    const validationResult = phoneSchema.safeParse({ phone: phoneNumber });
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      // Clean phone number
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const response = await userAuthService.sendOTP(cleanPhone);

      if (response.success) {
        setOtpToken(response.token);
        setIsLoading(false);
        setStep('otp');
        setResendTimer(120); // Start 2 min timer
        toast.success(
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-green-500" />
            <span>OTP sent successfully!</span>
          </div>
        );
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
      // Handle paste of full OTP
      if (index === 0 && value.length === 6) {
        const chars = value.split('');
        setOtp(chars);
        // Focus the last input or verify button
        otpInputRefs.current[5]?.focus();
        return;
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
      const response = await userAuthService.verifyLogin({
        phone: phoneNumber.replace(/\D/g, ''),
        otp: otpValue
      });

      if (response.success) {
        if (response.isNewUser) {
          toast.success('Phone verified! Please complete your registration.');
          navigate('/user/signup', {
            state: {
              phone: phoneNumber,
              verificationToken: response.verificationToken
            }
          });
        } else {
          toast.success('Welcome back!');
          navigate('/user', { replace: true });
        }
      } else {
        setIsLoading(false);
        toast.error(response.message || 'Verification failed');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  // Brand Colors from theme
  const brandColor = themeColors.brand?.orange || '#FF8A00';

  // --- Onboarding Check ---
  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-transparent flex flex-col pt-[max(env(safe-area-inset-top),32px)] pb-[max(env(safe-area-inset-bottom),20px)] px-6 relative overflow-x-hidden">
      
      {/* Top Logo Area */}
      <div className="w-full flex justify-center mb-10 h-16 items-center mt-2 shrink-0">
          <img 
            src="/logo/logo.webp" 
            alt="Homestr Logo" 
            className="h-full w-auto max-w-[180px] object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'block';
              }
            }}
          />
          <span className="hidden text-3xl font-extrabold text-[#FF8A00] tracking-tight">Homestr</span>
      </div>

      {/* Heading Area */}
      <div className="w-full text-center mb-10 shrink-0">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a2b3c] tracking-tight">
          {step === 'phone' ? 'Sign in to account' : 'Verify your phone'}
        </h2>
        <p className="mt-3 text-sm text-gray-500 font-medium">
          {step === 'phone'
            ? 'Enter your mobile number to get started'
            : `We've sent a code to +91 ${phoneNumber}`
          }
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          {step === 'phone' ? (
            <form className="flex flex-col flex-1" onSubmit={handlePhoneSubmit}>
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-semibold text-[#1a2b3c] mb-3 ml-1">
                  Mobile Number
                </label>
                <div className="relative rounded-2xl group border border-gray-200 focus-within:border-[#FF8A00] focus-within:ring-1 focus-within:ring-[#FF8A00] transition-all bg-white shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#FF8A00] transition-colors">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-semibold border-r pr-3 border-gray-200 sm:text-base">+91</span>
                  </div>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    id="phone"
                    className="block w-full pl-[100px] pr-4 py-4 bg-transparent border-transparent focus:border-transparent focus:ring-0 sm:text-lg font-bold text-[#1a2b3c] placeholder-gray-300 rounded-2xl"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setPhoneNumber(val);
                    }}
                  />
                </div>
              </div>

              {/* Action Area pushed to bottom if space available */}
              <div className="mt-auto pt-8 pb-4 flex flex-col gap-6">
                <button
                  type="submit"
                  disabled={isLoading || phoneNumber.length < 10}
                  className="w-full flex justify-center py-4 px-4 rounded-2xl text-base font-bold text-white transition-all duration-300 ease-in-out disabled:opacity-50 disabled:bg-[#8ebac3] disabled:cursor-not-allowed active:scale-[0.98] shadow-md hover:shadow-lg"
                  style={{ backgroundColor: brandColor }}
                >
                  {isLoading ? (
                    <LogoLoader fullScreen={false} inline={true} size="w-6 h-6" />
                  ) : (
                    <span>Get OTP</span>
                  )}
                </button>

                <p className="text-sm text-gray-500 font-medium text-center">
                  New to Homestr?{' '}
                  <Link
                    to="/user/signup"
                    className="text-[#FF8A00] hover:text-[#e65100] font-bold transition-colors"
                  >
                    Create an account
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
                  onClick={(e) => {
                    e.preventDefault();
                    setOtp(['', '', '', '', '', '']);
                    setOtpToken('');
                    setStep('phone');
                    setResendTimer(0);
                  }}
                  className="flex items-center font-bold text-gray-500 hover:text-[#FF8A00] transition-colors"
                >
                  <FiChevronLeft className="mr-1 h-5 w-5" /> Change Number
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (isLoading || resendTimer > 0) return;
                    try {
                      setIsLoading(true);
                      const response = await userAuthService.sendOTP(phoneNumber.replace(/\D/g, ''));
                      if (response.success) {
                        setOtpToken(response.token);
                        setResendTimer(120);
                        toast.success('OTP resent!');
                      }
                    } catch (err) {
                      toast.error('Error sending OTP');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading || resendTimer > 0}
                  className="font-bold text-[#FF8A00] hover:text-[#e65100] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0
                    ? `Resend in ${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, '0')}`
                    : 'Resend OTP'}
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
                    <span>Verify & Continue</span>
                  )}
                </button>
              </div>
            </form>
          )}
      </div>

      {/* Footer */}
      <div className="w-full text-center text-xs text-gray-400 mt-4 shrink-0 pb-2">
        &copy; {new Date().getFullYear()} Homestr. All rights reserved.
      </div>
      <DebugConsole />
    </div>
  );
};

export default Login;
