import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, ShieldCheck, User, Mail, Phone, Lock, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import GoogleAuthModal, { GoogleLogoIcon } from '../../components/auth/GoogleAuthModal';

const Register = ({ adminDefault = false }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialAdmin = adminDefault || searchParams.get('admin') === 'true';

  const [isAdminMode, setIsAdminMode] = useState(initialAdmin);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (isAdminMode && !formData.adminCode.trim()) {
      setError('Please provide the secret Admin Access Code');
      setLoading(false);
      return;
    }

    const { name, email, password, phone, adminCode } = formData;
    const registerPayload = {
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      role: isAdminMode ? 'admin' : 'customer',
      adminCode: isAdminMode ? adminCode.trim() : undefined,
    };

    const result = await register(registerPayload);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Registration failed. Please check your information.');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (user) => {
    setShowGoogleModal(false);
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/70">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner ${
              isAdminMode ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'
            }`}
          >
            {isAdminMode ? <ShieldCheck className="w-7 h-7" /> : <ShoppingBag className="w-7 h-7" />}
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {isAdminMode ? 'Admin Registration' : 'Create an account'}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
            {isAdminMode
              ? 'Authorized staff only: secret access code required'
              : 'Sign up to start shopping on EasyCart'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center">
            <span>{error}</span>
          </div>
        )}

        {/* Continue with Google (shown only for customer registration) */}
        {!isAdminMode && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3 px-4 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50/80 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              <GoogleLogoIcon className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-wider font-medium">
                or sign up with email
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                name="name"
                type="text"
                required
                className="input-field pl-10"
                placeholder={isAdminMode ? 'Admin Full Name' : 'John Doe'}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field pl-10"
                placeholder={isAdminMode ? 'admin@company.com' : 'name@example.com'}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                name="phone"
                type="tel"
                required
                className="input-field pl-10"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="input-field pl-10 pr-10"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="input-field pl-10"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Admin Access Code Field (Only shown in Admin Mode) */}
          {isAdminMode && (
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                Secret Admin Access Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="adminCode"
                  type="password"
                  required
                  className="input-field border-emerald-300 focus:ring-emerald-500 font-mono tracking-wider"
                  placeholder="Enter secret admin access code"
                  value={formData.adminCode}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-400">
                Verification required: Access to the Admin Dashboard is restricted strictly to authorized code holders.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-xs sm:text-sm font-bold flex justify-center items-center shadow-md active:scale-[0.99] transition-all rounded-xl text-white ${
                isAdminMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'btn-primary shadow-primary-500/20'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isAdminMode ? (
                'Verify & Register as Admin'
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Admin Mode Toggle Link */}
        <div className="mt-5 pt-4 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(!isAdminMode);
              setError('');
            }}
            className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1.5 font-medium transition-colors"
          >
            {isAdminMode ? (
              <>
                <User className="w-3.5 h-3.5 text-primary-600" />
                <span>Switch back to Customer Sign Up</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Have an Admin Access Code? Register as Admin</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-xs sm:text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Google Authentication Dialog */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
};

export default Register;
