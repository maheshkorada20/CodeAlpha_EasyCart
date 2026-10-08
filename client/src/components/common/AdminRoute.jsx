import { useState } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShieldAlert, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

const AdminRoute = () => {
  const { user, loading, unlockAdminRole } = useAuth();
  const [adminCode, setAdminCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Not logged in at all -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authorized as Admin -> render dashboard routes
  if (user.role === 'admin') {
    return <Outlet />;
  }

  // Logged in as customer -> display Admin Access Code verification gate
  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!adminCode.trim()) return;

    setVerifying(true);
    setError('');
    setSuccess('');

    const res = await unlockAdminRole(adminCode.trim());
    if (res.success) {
      setSuccess('Admin verified! Opening Admin Dashboard...');
    } else {
      setError(res.message || 'Incorrect Admin Access Code. Access Denied.');
    }
    setVerifying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 text-center animate-fadeIn">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-gray-900">Restricted Admin Portal</h2>
        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
          Logged in as <strong className="text-gray-800">{user.email}</strong> (Customer). Standard customer accounts do not have access to this management portal.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {success}
          </div>
        )}

        <form onSubmit={handleUnlock} className="mt-6 space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-primary-600" /> Enter Admin Access Code
            </label>
            <input
              type="password"
              required
              placeholder="Enter secret admin access code"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={verifying || !adminCode.trim()}
            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Unlock Admin Dashboard'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-800 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Store
          </Link>

          <Link
            to="/customer/dashboard"
            className="text-primary-600 hover:text-primary-700 transition-colors"
          >
            My Customer Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRoute;
