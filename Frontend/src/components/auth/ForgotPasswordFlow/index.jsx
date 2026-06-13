import React, { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiLock, FiCheckCircle, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import sharedAuthService from '../../../services/sharedAuthService';
import toast from 'react-hot-toast';

const ForgotPasswordFlow = ({ role, identifier: initialIdentifier = '', onBack, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!identifier) return toast.error('Please enter your email or mobile');
    
    setLoading(true);
    try {
      await sharedAuthService.forgotPassword(role, identifier);
      toast.success('OTP sent successfully');
      setStep(2);
      setCountdown(60); // 1 minute cooldown for resend
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');
    if (otp.length !== 6) return toast.error('OTP must be 6 digits');

    setLoading(true);
    try {
      const res = await sharedAuthService.verifyResetOtp(role, identifier, otp);
      setResetToken(res.resetToken);
      toast.success('OTP Verified!');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await sharedAuthService.resendResetOtp(role, identifier);
      toast.success('OTP resent');
      setCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await sharedAuthService.resetPassword(role, identifier, resetToken, newPassword, confirmPassword);
      toast.success('Password reset successfully!');
      setStep(4);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-gray-100">
      
      {step === 1 && (
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
          </div>
          <p className="text-gray-500 mb-8 text-sm">
            Enter your registered email or mobile number to receive a secure OTP for password reset.
          </p>
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Mobile</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  placeholder="name@company.com or 9876543210"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep(1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
          </div>
          <p className="text-gray-500 mb-8 text-sm">
            Enter the 6-digit verification code sent to <span className="font-semibold text-gray-700">{identifier}</span>
          </p>
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="block w-full text-center tracking-[0.5em] text-2xl py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                placeholder="------"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button 
              onClick={handleResendOtp}
              disabled={countdown > 0 || loading}
              className="text-teal-600 font-semibold text-sm disabled:text-gray-400 hover:text-teal-700 transition-colors"
            >
              {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
              <FiLock className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">New Password</h2>
          </div>
          <p className="text-gray-500 mb-8 text-sm">
            Create a strong new password for your account. Must be at least 8 characters long.
          </p>
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    confirmPassword && newPassword !== confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-teal-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><FiAlertCircle /> Passwords do not match</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full mt-2 flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? 'Resetting...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {step === 4 && (
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Password Updated!</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Your password has been successfully reset. You can now login securely with your new password.
          </p>
          <button
            onClick={() => {
              if (onSuccess) onSuccess();
              else onBack();
            }}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all active:scale-[0.98]"
          >
            Back to Login
          </button>
        </div>
      )}

    </div>
  );
};

export default ForgotPasswordFlow;
