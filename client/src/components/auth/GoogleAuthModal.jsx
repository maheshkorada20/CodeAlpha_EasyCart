import { useState } from 'react';
import { Loader2, X, Plus, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const GoogleLogoIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const GoogleAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { googleLogin } = useAuth();
  const [loadingEmail, setLoadingEmail] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const mockGoogleAccounts = [
    {
      name: 'Mahesh Kumar',
      email: 'mahesh.tech@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const handleSelectAccount = async (account) => {
    try {
      setLoadingEmail(account.email);
      setError('');
      const res = await googleLogin({
        email: account.email,
        name: account.name,
        avatar: account.avatar,
      });

      if (res.success) {
        onSuccess(res.user);
      } else {
        setError(res.message || 'Google sign-in failed');
        setLoadingEmail(null);
      }
    } catch (err) {
      setError('An error occurred during Google sign in.');
      setLoadingEmail(null);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address');
      return;
    }

    try {
      setLoadingEmail(customEmail);
      setError('');
      const name = customName.trim() || customEmail.split('@')[0];
      const res = await googleLogin({
        email: customEmail.trim(),
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff`,
      });

      if (res.success) {
        onSuccess(res.user);
      } else {
        setError(res.message || 'Google sign-in failed');
        setLoadingEmail(null);
      }
    } catch (err) {
      setError('An error occurred during Google sign in.');
      setLoadingEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeInFast">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 transition-all">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GoogleLogoIcon className="w-6 h-6" />
            <div>
              <h3 className="text-base font-bold text-gray-900">Sign in with Google</h3>
              <p className="text-xs text-gray-500">Choose an account to continue to EasyCart</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-3">
          {!customMode ? (
            <>
              {mockGoogleAccounts.map((account) => {
                const isLoading = loadingEmail === account.email;
                return (
                  <button
                    key={account.email}
                    onClick={() => handleSelectAccount(account)}
                    disabled={!!loadingEmail}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-primary-400 hover:bg-primary-50/40 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={account.avatar}
                        alt={account.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                          {account.name}
                        </div>
                        <div className="text-xs text-gray-500">{account.email}</div>
                      </div>
                    </div>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                    ) : (
                      <span className="text-xs font-semibold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Continue &rarr;
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => { setCustomMode(true); setError(''); }}
                disabled={!!loadingEmail}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-left transition-all text-gray-700"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">Use another account</div>
                  <div className="text-xs text-gray-400">Enter custom Google email</div>
                </div>
              </button>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Google Account Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="input-field"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="flex-1 btn-secondary text-xs py-2.5"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!!loadingEmail}
                  className="flex-1 btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  {loadingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure Google OAuth authentication</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
