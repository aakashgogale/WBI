import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { sharedAuthService } from '../../../services/authService';
import Logo from '../../../components/common/Logo';
import LogoLoader from '../../../components/common/LogoLoader';
import ForgotPasswordFlow from '../../../components/auth/ForgotPasswordFlow';
import { z } from "zod";
import { auth, GoogleAuthProvider, OAuthProvider, signInWithPopup } from '../../../firebase';

// Zod schema for Password Login
const loginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"),
  password: z.string().min(1, "Password is required"),
});

const WorkerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const brandColor = themeColors.brand?.teal || '#347989';

  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem('workerAccessToken')) {
      navigate('/worker/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Zod Validation
    const validationResult = loginSchema.safeParse(formData);
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const loginPayload = {
        mobile: formData.phone,
        password: formData.password
      };
      const response = await sharedAuthService.unifiedLogin(loginPayload);
      if (response.success) {
        toast.success(`Welcome Back! Logged in as ${response.user.role}`);
        navigate(response.redirectTo, { replace: true });
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (providerName) => {
    try {
      setIsLoading(true);
      let provider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
      } else if (providerName === 'apple') {
        provider = new OAuthProvider('apple.com');
      }
      
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
      const response = await sharedAuthService.socialLogin({ token, role: 'worker' });
      if (response.success) {
        toast.success(`Welcome Back! Logged in as ${response.user.role}`);
        navigate(response.redirectTo, { replace: true });
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Social login error:', error);
      toast.error(error?.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col justify-start sm:justify-center py-12 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#347989] opacity-[0.03] rounded-full blur-3xl animate-floating" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D68F35] opacity-[0.03] rounded-full blur-3xl animate-floating" style={{ animationDelay: '2s' }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10 animate-fade-in">
        <Logo className="h-16 w-auto mx-auto transform hover:scale-110 transition-transform duration-500" />
        
        {/* Removed duplicate logo circle */}

        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome Back!
        </h2>
        <p className="mt-2 text-sm text-gray-600 animate-stagger-1 animate-fade-in">
          Login to your Worker / Engineer account
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        {isForgotPassword ? (
          <div className="bg-white py-8 px-4 sm:rounded-2xl sm:px-10 border-0 sm:border border-gray-100 sm:shadow-2xl sm:shadow-gray-200/50 relative overflow-hidden animate-slide-in-bottom">
            <ForgotPasswordFlow 
              role="worker" 
              identifier={formData.phone}
              onBack={() => setIsForgotPassword(false)}
              onSuccess={() => setIsForgotPassword(false)}
            />
          </div>
        ) : (
        <div className="bg-white py-8 px-4 sm:rounded-2xl sm:px-10 border-0 sm:border border-gray-100 sm:shadow-2xl sm:shadow-gray-200/50 relative overflow-hidden animate-slide-in-bottom">
          
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="animate-stagger-1 animate-fade-in">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="relative rounded-xl shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#347989] transition-colors">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-medium border-r border-gray-300 pr-2">+91</span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-24 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                  placeholder="Enter your mobile number"
                  style={{ '--tw-ring-color': brandColor }}
                />
              </div>
            </div>

            <div className="animate-stagger-2 animate-fade-in">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#347989] transition-colors">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 hover:border-gray-300"
                  placeholder="Enter your password"
                  style={{ '--tw-ring-color': brandColor }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-semibold text-[#347989] hover:text-[#D68F35] transition-colors">
                  Forgot Password?
                </button>
              </div>
            </div>

            <div className="animate-stagger-3 animate-fade-in pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white transition-all duration-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 transform disabled:opacity-50 overflow-hidden"
                style={{ backgroundColor: '#4F46E5' }} // Using the specific blue/purple from UI mock
              >
                <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:translate-x-full transition-transform duration-700 -translate-x-full" />
                {isLoading ? (
                  <LogoLoader fullScreen={false} inline={true} size="w-6 h-6" />
                ) : (
                  <span className="flex items-center relative z-10">
                    Login
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Secondary Logins */}
          <div className="mt-8 animate-stagger-4 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {/* Google SVG */}
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {/* Apple SVG */}
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.05 20.28c-.98.68-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 13.25 4.51 5.96 9.05 5.68c1.3.07 2.45.81 3.05.81.65 0 2.06-.88 3.55-.74 1.3.06 2.5.64 3.3 1.68-2.8 1.67-2.3 5.48.51 6.6-1.07 2.4-2.14 4.58-2.41 6.25zM12.03 5.09c-.06-1.74 1.34-3.32 3.1-3.4 1.14 1.94-.96 3.84-3.1 3.4z" />
                </svg>
                Apple
              </button>
            </div>
          </div>
        </div>
        )}

        <p className="mt-8 text-center text-sm text-gray-500 animate-fade-in animate-stagger-5">
          Don't have an account?{' '}
          <Link to="/worker/signup" className="font-semibold text-[#4F46E5] hover:text-[#3F37C9] transition-colors duration-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default WorkerLogin;
