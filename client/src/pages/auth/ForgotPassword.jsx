import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Forgot Password?</h2>
          <p className="mt-1 text-xs text-gray-500">
            No worries! Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-xs text-gray-700 font-semibold">
              Password reset link sent to <strong className="text-gray-900">{email}</strong>!
            </p>
            <p className="text-[11px] text-gray-400">
              Please check your spam or inbox folder. For local development or quick testing, you can also sign in with the seed credentials.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="email" className="block font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
