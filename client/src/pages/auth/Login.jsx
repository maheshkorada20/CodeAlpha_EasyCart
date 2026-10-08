import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import GoogleAuthModal, { GoogleLogoIcon } from '../../components/auth/GoogleAuthModal';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login({
      email: email.trim(),
      password,
    });

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.message || 'Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (user) => {
    setShowGoogleModal(false);
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/70">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600 shadow-inner">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
            Sign in to your account to continue shopping
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center">
            <span>{error}</span>
          </div>
        )}

        {/* Continue with Google Button */}
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
              or sign in with email
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
        </div>

        {/* Email & Password Form */}
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field pl-10"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-primary text-xs sm:text-sm font-bold flex justify-center items-center shadow-md shadow-primary-500/20 active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs sm:text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 hover:underline">
            Sign up now
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

export default Login;
