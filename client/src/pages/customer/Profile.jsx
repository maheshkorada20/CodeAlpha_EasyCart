import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Mail, Phone, CheckCircle, AlertCircle, Loader2, KeyRound, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, unlockAdminRole, api } = useAuth();

  const [activeTab, setActiveTab] = useState('general');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Admin Code State
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [adminCodeLoading, setAdminCodeLoading] = useState(false);
  const [adminCodeMessage, setAdminCodeMessage] = useState({ type: '', text: '' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      await updateProfile(profileData);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setPasswordLoading(false);
      return;
    }

    try {
      await api.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password. Please check your current password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAdminCodeSubmit = async (e) => {
    e.preventDefault();
    if (!adminCodeInput.trim()) return;
    setAdminCodeLoading(true);
    setAdminCodeMessage({ type: '', text: '' });

    const res = await unlockAdminRole(adminCodeInput.trim());
    if (res.success) {
      setAdminCodeMessage({
        type: 'success',
        text: 'Admin role activated successfully! You now have full access to the Admin Dashboard.',
      });
      setAdminCodeInput('');
    } else {
      setAdminCodeMessage({
        type: 'error',
        text: res.message || 'Invalid Admin Access Code.',
      });
    }
    setAdminCodeLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your personal profile and security preferences.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-4 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4" />
            General Info
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            Security & Password
          </button>
        </div>

        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Details</h2>

            {profileMessage.text && (
              <div
                className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm ${
                  profileMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
                >
                  {profileLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Change Password</h2>

            {passwordMessage.text && (
              <div
                className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="block w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
                >
                  {passwordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Password
                </button>
              </div>
            </form>

            {/* Admin Privileges Management */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-2xl">
                <div className="p-2.5 bg-slate-800 text-white rounded-xl shadow-sm">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">Administrator Privileges</h3>
                    {user?.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5" /> Active Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        Customer Role
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {user?.role === 'admin'
                      ? 'You have verified administrator status with full access to product management, inventory, orders, coupons, and business analytics.'
                      : 'Store staff and administrators with an authorized Admin Access Code can unlock full administrative controls below.'}
                  </p>

                  {user?.role !== 'admin' && (
                    <form onSubmit={handleAdminCodeSubmit} className="mt-4 space-y-3">
                      {adminCodeMessage.text && (
                        <div
                          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                            adminCodeMessage.type === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {adminCodeMessage.type === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          {adminCodeMessage.text}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="password"
                          required
                          placeholder="Enter Admin Access Code..."
                          value={adminCodeInput}
                          onChange={(e) => setAdminCodeInput(e.target.value)}
                          className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono tracking-wider focus:ring-2 focus:ring-slate-700 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={adminCodeLoading || !adminCodeInput.trim()}
                          className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {adminCodeLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          Verify & Activate Admin
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
