import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiShield, FiHeadphones, FiZap, FiAward } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { themeColors } from '../../../theme';
import { sharedAuthService } from '../../../services/authService';
import LogoLoader from '../../../components/common/LogoLoader';
import Logo from '../../../components/common/Logo';
import ForgotPasswordFlow from '../../../components/auth/ForgotPasswordFlow';
import { auth, GoogleAuthProvider, OAuthProvider, signInWithPopup } from '../../../firebase';

const VendorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem('vendorAccessToken')) {
      navigate('/vendor', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      toast.error('Please enter both Email/Phone and Password');
      return;
    }

    setIsLoading(true);
    try {
      const loginPayload = {
        mobile: formData.identifier,
        password: formData.password
      };

      const response = await sharedAuthService.unifiedLogin(loginPayload);
      if (response.success) {
        toast.success(
          <div className="flex flex-col">
            <span className="font-bold">Welcome Back!</span>
            <span className="text-xs">Successfully logged into your {response.user.role} account.</span>
          </div>,
          { icon: <FiCheckCircle className="text-green-500" /> }
        );
        navigate(response.redirectTo, { replace: true });
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
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
      
      const response = await sharedAuthService.socialLogin({ token, role: 'vendor' });
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

  const brandColor = themeColors.brand?.teal || '#0D8A72';

  return (
    <div className="h-[100dvh] w-full bg-gray-50 flex flex-col font-sans overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-8 xl:p-12 bg-white border-r border-gray-100 relative overflow-hidden">
          {/* Top Logo */}
          <div className="flex items-center gap-2 relative z-10 shrink-0">
            <Logo className="h-8 w-auto" />
            <span className="text-xl font-bold text-gray-800 tracking-tight">Vendor Portal</span>
          </div>

          {/* Middle Content */}
          <div className="relative z-10 mt-8 xl:mt-12 shrink-0">
            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Welcome to <br />
              <span style={{ color: brandColor }}>WBI Vendor Portal</span>
            </h1>
            <p className="text-gray-600 text-sm xl:text-base mb-8 max-w-md leading-relaxed">
              Connect with businesses, manage services, and grow your professional network with WBI.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-teal-50 text-teal-600 shrink-0">
                  <FiZap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base xl:text-lg">Grow Your Business</h3>
                  <p className="text-gray-500 text-xs xl:text-sm mt-0.5">Get more projects and expand your reach across multiple cities.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-blue-50 text-blue-600 shrink-0">
                  <FiShield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base xl:text-lg">Manage Everything</h3>
                  <p className="text-gray-500 text-xs xl:text-sm mt-0.5">Projects, teams, invoices, and earnings all in one secure place.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-orange-50 text-orange-600 shrink-0">
                  <FiAward className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base xl:text-lg">Trusted by Thousands</h3>
                  <p className="text-gray-500 text-xs xl:text-sm mt-0.5">Join a premier network of verified vendors and professionals.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Illustration (Abstract) */}
          <div className="relative flex-1 min-h-0 mt-8 w-full rounded-2xl overflow-hidden bg-gradient-to-tr from-gray-50 to-gray-100 flex items-end justify-center border border-gray-100 shadow-inner">
            <div className="w-[80%] h-[80%] bg-white rounded-t-xl shadow-lg border border-gray-200 flex flex-col p-4 relative animate-fade-in-up">
              {/* Mock Dashboard UI */}
              <div className="w-full h-4 bg-gray-100 rounded mb-4 flex gap-2">
                 <div className="w-12 h-full bg-gray-200 rounded"></div>
                 <div className="w-24 h-full bg-gray-200 rounded"></div>
              </div>
              <div className="flex-1 flex gap-4">
                <div className="w-1/3 h-full bg-gray-50 rounded border border-gray-100 flex flex-col gap-2 p-2">
                  <div className="w-full h-2 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                </div>
                <div className="flex-1 h-full bg-teal-50 rounded border border-teal-100 relative overflow-hidden">
                   <div className="absolute bottom-0 left-0 w-full h-1/2 bg-teal-100 rounded-t-full opacity-50 transform translate-y-4"></div>
                </div>
              </div>
              {/* Overlay Shield */}
              <div className="absolute -right-4 -bottom-4 bg-white p-2 rounded-full shadow-xl">
                 <div className="bg-[#0D8A72] text-white p-3 rounded-full">
                    <FiShield className="w-6 h-6" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-24 relative bg-gray-50 overflow-y-auto overflow-x-hidden py-6">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6 shrink-0">
            <Logo className="h-10 w-auto mx-auto mb-2" />
            <span className="text-xl font-bold text-gray-800">Vendor Portal</span>
          </div>

          {isForgotPassword ? (
            <div className="my-auto w-full max-w-[460px] mx-auto shrink-0">
              <ForgotPasswordFlow 
                role="vendor" 
                identifier={formData.identifier}
                onBack={() => setIsForgotPassword(false)}
                onSuccess={() => setIsForgotPassword(false)}
              />
            </div>
          ) : (
          <div className="bg-white p-6 sm:p-8 xl:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 w-full max-w-[460px] mx-auto shrink-0 my-auto">
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
              <p className="text-gray-500 mt-1 text-sm">Login to your vendor account</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 relative">
              <button className="flex-1 pb-3 font-semibold text-[#0D8A72] border-b-2 border-[#0D8A72] transition-colors">
                Login
              </button>
              <button onClick={() => navigate('/vendor/signup')} className="flex-1 pb-3 font-semibold text-gray-400 hover:text-gray-700 transition-colors">
                Signup
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email or Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="identifier"
                    required
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    placeholder="Enter your email or phone number"
                    style={{ '--tw-ring-color': brandColor }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    style={{ '--tw-ring-color': brandColor }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#0D8A72] focus:ring-[#0D8A72]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-medium">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="font-semibold text-[#0D8A72] hover:text-[#0a6b58] transition-colors">
                    Forgot Password?
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-white font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 transform hover:-translate-y-0.5"
                  style={{ backgroundColor: brandColor }}
                >
                  {isLoading ? <LogoLoader fullScreen={false} inline={true} size="w-5 h-5" /> : 'Login'}
                </button>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500 font-medium">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                  <FcGoogle className="w-5 h-5 mr-2" />
                  Google
                </button>
                <button type="button" onClick={() => handleSocialLogin('apple')} className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.05 20.28c-.98.68-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 13.25 4.51 5.96 9.05 5.68c1.3.07 2.45.81 3.05.81.65 0 2.06-.88 3.55-.74 1.3.06 2.5.64 3.3 1.68-2.8 1.67-2.3 5.48.51 6.6-1.07 2.4-2.14 4.58-2.41 6.25zM12.03 5.09c-.06-1.74 1.34-3.32 3.1-3.4 1.14 1.94-.96 3.84-3.1 3.4z" />
                  </svg>
                  Apple
                </button>
              </div>

              <p className="text-center text-sm text-gray-600 pt-2">
                Don't have an account?{' '}
                <Link to="/vendor/signup" className="font-bold text-[#0D8A72] hover:underline">
                  Sign up now
                </Link>
              </p>
            </form>
          </div>
          )}
        </div>
      </div>

      {/* Footer Features (Visible on larger screens) */}
      <div className="hidden lg:block bg-white border-t border-gray-200 shrink-0">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 grid grid-cols-4 gap-4">
          <div className="flex items-center justify-center gap-2 border-r border-gray-100 last:border-0">
            <div className="p-1.5 bg-green-50 rounded-lg text-green-600"><FiShield className="w-4 h-4"/></div>
            <div>
              <p className="text-xs font-bold text-gray-900">Secure & Trusted</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 border-r border-gray-100 last:border-0">
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><FiHeadphones className="w-4 h-4"/></div>
            <div>
              <p className="text-xs font-bold text-gray-900">24/7 Support</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 border-r border-gray-100 last:border-0">
            <div className="p-1.5 bg-yellow-50 rounded-lg text-yellow-600"><FiZap className="w-4 h-4"/></div>
            <div>
              <p className="text-xs font-bold text-gray-900">Quick & Easy</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="p-1.5 bg-teal-50 rounded-lg text-teal-600"><FiCheckCircle className="w-4 h-4"/></div>
            <div>
              <p className="text-xs font-bold text-gray-900">Verified & Reliable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
